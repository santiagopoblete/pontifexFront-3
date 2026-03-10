import { useRef, useState } from "react";
import { NavBar } from "@/components/pntfx/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Trash2, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useFinancialStore } from "@/stores/financial-store";
import { importMasterFromXlsx } from "@/lib/financial/master-importer";
import { useToast } from "@/hooks/use-toast";

export default function CargarMaster() {
  const inputRef = useRef<HTMLInputElement>(null);
  const store = useFinancialStore();
  const { toast } = useToast();

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>("");

  const handleFile = async (file: File) => {
    setBusy(true);
    setProgress(15);
    setStep("Leyendo Excel...");
    try {
      setProgress(35);
      setStep("Importando MASTER...");
      const master = await importMasterFromXlsx(file);
      setProgress(85);
      setStep("Guardando...");
      store.setMaster(master);
      setProgress(100);
      setStep("Listo");
      toast({
        title: "MASTER cargado",
        description: `${file.name} se importó correctamente.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo importar el archivo MASTER.";
      toast({
        title: "Error al cargar MASTER",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setBusy(false);
        setProgress(0);
        setStep("");
      }, 400);
    }
  };

  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <NavBar />
      <main className="w-full max-w-5xl mx-auto py-8 px-6 md:px-8">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Cargar MASTER
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sube el archivo <span className="font-medium text-foreground">MASTER.xlsx</span> para usarlo en Empate de Clientes, Diagnóstico Crediticio y Predictor de KPIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="card-premium overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                Subir archivo MASTER
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Formato recomendado: el MASTER exportado desde Pontifex.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <Button
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="w-full gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {busy ? "Procesando..." : "Seleccionar archivo"}
              </Button>

              {busy && (
                <div className="space-y-2 animate-fade-in">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-center">
                    {step}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                MASTER actual
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Se guarda localmente en este navegador.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.master ? (
                <div className="rounded-lg bg-secondary border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Empresa</span>
                    <span className="text-xs text-foreground font-medium truncate max-w-[60%]" title={store.master.empresa}>
                      {store.master.empresa}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Periodo</span>
                    <span className="text-xs text-foreground font-medium truncate max-w-[60%]" title={store.master.periodo}>
                      {store.master.periodo || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Generado</span>
                    <span className="text-xs text-foreground font-medium truncate max-w-[60%]" title={store.master.generatedAt}>
                      {new Date(store.master.generatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No hay un MASTER cargado todavía.
                </div>
              )}

              <Button
                variant="outline"
                disabled={!store.master || busy}
                onClick={() => {
                  store.setMaster(null);
                  toast({ title: "MASTER eliminado", description: "Se eliminó el MASTER guardado localmente." });
                }}
                className="w-full gap-2 cursor-pointer text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar MASTER
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

