import { useState } from "react";
import { NavBar } from "@/components/pntfx/navbar";
import { useFinancialStore } from "@/stores/financial-store";
import { EmptyMasterState } from "@/components/pntfx/empty-master-state";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { MissingDataDialog } from "@/components/pntfx/missing-data-dialog";
import { MatchResultCard } from "@/components/pntfx/match-result-card";
import {
  usePartners,
  getMissingFields,
  matchClientToPartners,
  type ClientProfile,
  type MatchResult,
} from "@/hooks/use-client-matching";

const EMPTY_PROFILE: ClientProfile = {
  sector: null,
  experienciaAnios: null,
  nivelBuro: null,
  garantiasDisponibles: [],
  coberturaDeseada: null,
  productoDeseado: null,
};

export default function EmpateDeClientes() {
  const { master } = useFinancialStore();
  const { partners, loading } = usePartners();

  const [profile, setProfile] = useState<ClientProfile>(EMPTY_PROFILE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleRunMatch = () => {
    if (!master) return;
    const missing = getMissingFields(master, profile);
    if (missing.length > 0) {
      setDialogOpen(true);
      return;
    }
    executeMatch(profile);
  };

  const executeMatch = (p: ClientProfile) => {
    if (!master) return;
    setProfile(p);
    setDialogOpen(false);
    setProcessing(true);
    setTimeout(() => {
      const matched = matchClientToPartners(master, p, partners);
      setResults(matched);
      setProcessing(false);
    }, 800);
  };

  const compatible = results?.filter((r) => r.score >= 60) || [];
  const partial = results?.filter((r) => r.score > 0 && r.score < 60) || [];

  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <NavBar />
      <main className="w-full max-w-5xl mx-auto py-8 px-6 md:px-8">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Empate de Clientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compara los datos del MASTER con las instituciones financieras para encontrar
            opciones de crédito compatibles.
          </p>
        </div>

        {!master ? (
          <EmptyMasterState section="Empate de Clientes" />
        ) : (
          <>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando catálogo de instituciones...
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <Button onClick={handleRunMatch} disabled={processing} className="gap-2">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {processing ? "Analizando..." : "Ejecutar empate"}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {partners.length} instituciones en catálogo
                  </span>
                </div>

                {results !== null && !processing && (
                  <div className="space-y-8 animate-fade-in-up">
                    {compatible.length > 0 && (
                      <div>
                        <h2 className="text-sm font-semibold text-foreground mb-4">
                          Instituciones compatibles ({compatible.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {compatible.map((r, i) => (
                            <div key={r.partner.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                              <MatchResultCard result={r} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {partial.length > 0 && (
                      <div>
                        <h2 className="text-sm font-semibold text-muted-foreground mb-4">
                          Compatibilidad parcial ({partial.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {partial.map((r, i) => (
                            <div key={r.partner.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                              <MatchResultCard result={r} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {compatible.length === 0 && partial.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No se encontraron instituciones compatibles con el perfil proporcionado.
                      </div>
                    )}

                    <button
                      onClick={() => { setResults(null); setProfile(EMPTY_PROFILE); }}
                      className="text-xs underline cursor-pointer transition-opacity hover:opacity-70 text-muted-foreground"
                    >
                      Nuevo análisis
                    </button>
                  </div>
                )}
              </>
            )}

            <MissingDataDialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              onSubmit={executeMatch}
              missingFields={getMissingFields(master, profile)}
              currentProfile={profile}
            />
          </>
        )}
      </main>
    </div>
  );
}
