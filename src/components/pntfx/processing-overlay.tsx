const STEPS = [
  "Leyendo estructura del archivo...",
  "Extrayendo indicadores financieros...",
  "Calculando ratios de liquidez...",
  "Evaluando rentabilidad operativa...",
  "Generando calificaciones...",
];

export function ProcessingOverlay() {
  return (
    <div className="w-full mt-8 flex flex-col items-center gap-6 animate-fade-in-up">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-border border-t-primary animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-4 border-secondary border-b-primary/60 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        />
      </div>

      <p className="text-sm font-medium text-foreground">
        Procesando archivo...
      </p>

      <ul className="flex flex-col gap-2 w-full max-w-sm">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-3 text-xs rounded-lg px-4 py-2 bg-secondary border border-border text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: `${i * 500}ms` }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse bg-primary" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
