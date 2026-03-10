import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ClientProfile } from "@/hooks/use-client-matching";

interface MissingDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (profile: ClientProfile) => void;
  missingFields: string[];
  currentProfile: ClientProfile;
}

const GARANTIAS_OPTIONS = [
  { value: "aval", label: "Aval / Obligado solidario" },
  { value: "patrimonial", label: "Relación patrimonial" },
  { value: "hipotecaria", label: "Hipotecaria" },
  { value: "prendaria", label: "Prendaria" },
  { value: "liquida", label: "Líquida" },
  { value: "contratos", label: "Contratos" },
];

export function MissingDataDialog({
  open,
  onClose,
  onSubmit,
  missingFields,
  currentProfile,
}: MissingDataDialogProps) {
  const [profile, setProfile] = useState<ClientProfile>({ ...currentProfile });

  const handleGarantiaToggle = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      garantiasDisponibles: prev.garantiasDisponibles.includes(value)
        ? prev.garantiasDisponibles.filter((g) => g !== value)
        : [...prev.garantiasDisponibles, value],
    }));
  };

  const canSubmit =
    profile.sector &&
    profile.experienciaAnios !== null &&
    profile.nivelBuro &&
    profile.garantiasDisponibles.length > 0 &&
    profile.coberturaDeseada &&
    profile.productoDeseado;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Información faltante</DialogTitle>
          <DialogDescription>
            Para realizar el empate de clientes necesitamos los siguientes datos que no se
            pueden obtener automáticamente del MASTER.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Sector */}
          {missingFields.includes("Sector empresarial") && (
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Sector empresarial</Label>
              <Select
                value={profile.sector || ""}
                onValueChange={(v) =>
                  setProfile((p) => ({ ...p, sector: v as ClientProfile["sector"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comercio">Comercio</SelectItem>
                  <SelectItem value="industria">Industria</SelectItem>
                  <SelectItem value="servicios">Servicios</SelectItem>
                  <SelectItem value="primario">Primario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Experiencia */}
          {missingFields.includes("Años de experiencia") && (
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Años de experiencia</Label>
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Ej: 3"
                value={profile.experienciaAnios ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    experienciaAnios: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
          )}

          {/* Buró */}
          {missingFields.includes("Nivel de Buró de Crédito") && (
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Nivel de Buró de Crédito</Label>
              <Select
                value={profile.nivelBuro || ""}
                onValueChange={(v) =>
                  setProfile((p) => ({ ...p, nivelBuro: v as ClientProfile["nivelBuro"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excelente">Excelente (MOP 01)</SelectItem>
                  <SelectItem value="bueno">Bueno (MOP 01, 02)</SelectItem>
                  <SelectItem value="regular">Regular (MOP 01, 02, 03)</SelectItem>
                  <SelectItem value="malo">Mal Buró</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Garantías */}
          {missingFields.includes("Garantías disponibles") && (
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Garantías disponibles</Label>
              <div className="grid grid-cols-2 gap-2">
                {GARANTIAS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
                  >
                    <Checkbox
                      checked={profile.garantiasDisponibles.includes(opt.value)}
                      onCheckedChange={() => handleGarantiaToggle(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cobertura */}
          {missingFields.includes("Cobertura geográfica deseada") && (
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Cobertura geográfica deseada</Label>
              <Select
                value={profile.coberturaDeseada || ""}
                onValueChange={(v) =>
                  setProfile((p) => ({
                    ...p,
                    coberturaDeseada: v as ClientProfile["coberturaDeseada"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cobertura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="estatal">Estatal</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="nacional">Nacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Producto */}
          {missingFields.includes("Tipo de producto crediticio") && (
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Tipo de producto crediticio</Label>
              <Select
                value={profile.productoDeseado || ""}
                onValueChange={(v) =>
                  setProfile((p) => ({ ...p, productoDeseado: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credito_simple">Crédito Simple</SelectItem>
                  <SelectItem value="credito_revolvente">Crédito Revolvente</SelectItem>
                  <SelectItem value="factoraje">Factoraje</SelectItem>
                  <SelectItem value="arrendamiento">Arrendamiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit} onClick={() => canSubmit && onSubmit(profile)}>
            Ejecutar empate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
