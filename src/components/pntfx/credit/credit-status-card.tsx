import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";

interface CreditStatusCardProps {
  rating: "A" | "B" | "C" | "R";
  score: number;
  label: string;
}

const config = {
  A: {
    icon: ShieldCheck,
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    glow: "shadow-[0_0_30px_-5px_hsl(160,60%,40%/0.2)]",
    barColor: "bg-emerald-500",
  },
  B: {
    icon: ShieldAlert,
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    border: "border-amber-500/30",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    glow: "shadow-[0_0_30px_-5px_hsl(45,80%,50%/0.2)]",
    barColor: "bg-amber-500",
  },
  C: {
    icon: AlertTriangle,
    gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
    border: "border-orange-500/30",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    glow: "shadow-[0_0_30px_-5px_hsl(25,80%,50%/0.2)]",
    barColor: "bg-orange-500",
  },
  R: {
    icon: ShieldX,
    gradient: "from-red-500/20 via-red-500/10 to-transparent",
    border: "border-red-500/30",
    text: "text-red-400",
    bg: "bg-red-500/10",
    glow: "shadow-[0_0_30px_-5px_hsl(0,70%,50%/0.2)]",
    barColor: "bg-red-500",
  },
};

const ratingLabels: Record<string, string> = {
  A: "A — Riesgo Bajo",
  B: "B — Riesgo Medio",
  C: "C — Riesgo Alto",
  R: "Rechazado",
};

export function CreditStatusCard({ rating, score, label }: CreditStatusCardProps) {
  const c = config[rating];
  const Icon = c.icon;

  return (
    <Card className={`card-premium overflow-hidden ${c.glow}`}>
      <div className={`h-1 w-full bg-gradient-to-r ${c.gradient}`} />
      <CardContent className="py-6 px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
            <Icon size={28} className={c.text} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Resultado del Diagnóstico
            </p>
            <h2 className={`text-2xl font-bold ${c.text}`}>{label}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Calificación: <span className={`font-semibold ${c.text}`}>{ratingLabels[rating]}</span>
            </p>
          </div>

          {/* Score */}
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground mb-1">Puntaje</p>
            <p className={`text-4xl font-bold tabular-nums ${c.text}`}>{score}</p>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-5">
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full ${c.barColor} transition-all duration-1000 ease-out`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
