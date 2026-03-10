import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MasterDataset } from "@/lib/financial/types";

export interface CreditPartner {
  id: string;
  name: string;
  tipo: string;
  tier: string;
  cobertura_local: boolean;
  cobertura_estatal: boolean;
  cobertura_regional: boolean;
  cobertura_nacional: boolean;
  credito_simple: boolean;
  credito_revolvente: boolean;
  factoraje: boolean;
  arrendamiento: boolean;
  exp_menor_1_anio: boolean;
  exp_1_anio: boolean;
  exp_2_o_mas: boolean;
  sector_comercio: boolean;
  sector_industria: boolean;
  sector_servicios: boolean;
  sector_primario: boolean;
  buro_excelente: boolean;
  buro_bueno: boolean;
  buro_regular: boolean;
  mal_buro: boolean;
  garantia_aval: boolean;
  garantia_patrimonial: boolean;
  garantia_hipotecaria: boolean;
  garantia_prendaria: boolean;
  garantia_liquida: boolean;
  garantia_contratos: boolean;
  acepta_utilidad: boolean;
  acepta_perdida: boolean;
  acepta_quiebra_tecnica: boolean;
  mas_rentable: boolean;
  tiene_contrato: boolean;
}

// Fields the user must provide that can't be derived from the MASTER
export interface ClientProfile {
  sector: "comercio" | "industria" | "servicios" | "primario" | null;
  experienciaAnios: number | null;
  nivelBuro: "excelente" | "bueno" | "regular" | "malo" | null;
  garantiasDisponibles: string[]; // aval, patrimonial, hipotecaria, prendaria, liquida, contratos
  coberturaDeseada: "local" | "estatal" | "regional" | "nacional" | null;
  productoDeseado: string | null; // credito_simple, credito_revolvente, factoraje, arrendamiento
}

export interface MatchResult {
  partner: CreditPartner;
  score: number; // 0-100
  matches: string[];
  mismatches: string[];
}

export function getMissingFields(master: MasterDataset | null, profile: ClientProfile): string[] {
  const missing: string[] = [];
  if (!master) {
    missing.push("MASTER (procesa documentos en el Procesador Financiero)");
    return missing;
  }
  if (!profile.sector) missing.push("Sector empresarial");
  if (profile.experienciaAnios === null) missing.push("Años de experiencia");
  if (!profile.nivelBuro) missing.push("Nivel de Buró de Crédito");
  if (profile.garantiasDisponibles.length === 0) missing.push("Garantías disponibles");
  if (!profile.coberturaDeseada) missing.push("Cobertura geográfica deseada");
  if (!profile.productoDeseado) missing.push("Tipo de producto crediticio");
  return missing;
}

function determineSolvencia(master: MasterDataset): "utilidad" | "perdida" | "quiebra_tecnica" {
  if (master.capitalContable <= 0) return "quiebra_tecnica";
  if (master.utilidadNeta < 0) return "perdida";
  return "utilidad";
}

export function matchClientToPartners(
  master: MasterDataset,
  profile: ClientProfile,
  partners: CreditPartner[]
): MatchResult[] {
  const solvencia = determineSolvencia(master);

  return partners
    .map((p) => {
      const matches: string[] = [];
      const mismatches: string[] = [];
      let totalCriteria = 0;
      let matchedCriteria = 0;

      // 1. Solvencia financiera (from MASTER)
      totalCriteria++;
      if (
        (solvencia === "utilidad" && p.acepta_utilidad) ||
        (solvencia === "perdida" && p.acepta_perdida) ||
        (solvencia === "quiebra_tecnica" && p.acepta_quiebra_tecnica)
      ) {
        matchedCriteria++;
        matches.push(`Acepta solvencia: ${solvencia}`);
      } else {
        mismatches.push(`No acepta solvencia: ${solvencia}`);
      }

      // 2. Sector
      if (profile.sector) {
        totalCriteria++;
        const sectorMap: Record<string, keyof CreditPartner> = {
          comercio: "sector_comercio",
          industria: "sector_industria",
          servicios: "sector_servicios",
          primario: "sector_primario",
        };
        if (p[sectorMap[profile.sector]] as boolean) {
          matchedCriteria++;
          matches.push(`Sector ${profile.sector} aceptado`);
        } else {
          mismatches.push(`Sector ${profile.sector} no aceptado`);
        }
      }

      // 3. Experiencia
      if (profile.experienciaAnios !== null) {
        totalCriteria++;
        const expOk =
          (profile.experienciaAnios < 1 && p.exp_menor_1_anio) ||
          (profile.experienciaAnios >= 1 && profile.experienciaAnios < 2 && p.exp_1_anio) ||
          (profile.experienciaAnios >= 2 && p.exp_2_o_mas);
        if (expOk) {
          matchedCriteria++;
          matches.push(`Experiencia ${profile.experienciaAnios} año(s) aceptada`);
        } else {
          mismatches.push(`Experiencia ${profile.experienciaAnios} año(s) no aceptada`);
        }
      }

      // 4. Buró
      if (profile.nivelBuro) {
        totalCriteria++;
        const buroMap: Record<string, keyof CreditPartner> = {
          excelente: "buro_excelente",
          bueno: "buro_bueno",
          regular: "buro_regular",
          malo: "mal_buro",
        };
        if (p[buroMap[profile.nivelBuro]] as boolean) {
          matchedCriteria++;
          matches.push(`Buró ${profile.nivelBuro} aceptado`);
        } else {
          mismatches.push(`Buró ${profile.nivelBuro} no aceptado`);
        }
      }

      // 5. Garantías
      if (profile.garantiasDisponibles.length > 0) {
        totalCriteria++;
        const garantiaMap: Record<string, keyof CreditPartner> = {
          aval: "garantia_aval",
          patrimonial: "garantia_patrimonial",
          hipotecaria: "garantia_hipotecaria",
          prendaria: "garantia_prendaria",
          liquida: "garantia_liquida",
          contratos: "garantia_contratos",
        };
        const anyMatch = profile.garantiasDisponibles.some(
          (g) => p[garantiaMap[g]] as boolean
        );
        if (anyMatch) {
          matchedCriteria++;
          matches.push("Garantía compatible encontrada");
        } else {
          mismatches.push("Ninguna garantía compatible");
        }
      }

      // 6. Cobertura
      if (profile.coberturaDeseada) {
        totalCriteria++;
        const cobMap: Record<string, keyof CreditPartner> = {
          local: "cobertura_local",
          estatal: "cobertura_estatal",
          regional: "cobertura_regional",
          nacional: "cobertura_nacional",
        };
        if (p[cobMap[profile.coberturaDeseada]] as boolean) {
          matchedCriteria++;
          matches.push(`Cobertura ${profile.coberturaDeseada} disponible`);
        } else {
          mismatches.push(`Cobertura ${profile.coberturaDeseada} no disponible`);
        }
      }

      // 7. Producto
      if (profile.productoDeseado) {
        totalCriteria++;
        const prodMap: Record<string, keyof CreditPartner> = {
          credito_simple: "credito_simple",
          credito_revolvente: "credito_revolvente",
          factoraje: "factoraje",
          arrendamiento: "arrendamiento",
        };
        if (p[prodMap[profile.productoDeseado]] as boolean) {
          matchedCriteria++;
          matches.push(`Producto ${profile.productoDeseado.replace("_", " ")} disponible`);
        } else {
          mismatches.push(`Producto ${profile.productoDeseado.replace("_", " ")} no disponible`);
        }
      }

      const score = totalCriteria > 0 ? Math.round((matchedCriteria / totalCriteria) * 100) : 0;

      return { partner: p, score, matches, mismatches };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function usePartners() {
  const [partners, setPartners] = useState<CreditPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("credit_partners")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data) setPartners(data as CreditPartner[]);
        setLoading(false);
      });
  }, []);

  return { partners, loading };
}
