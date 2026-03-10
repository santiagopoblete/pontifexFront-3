import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Category {
  name: string;
  score: number;
  max: number;
}

interface CreditScoringPanelProps {
  categories: Category[];
  score: number;
}

export function CreditScoringPanel({ categories, score }: CreditScoringPanelProps) {
  return (
    <Card className="card-premium overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Modelo de Scoring Crediticio
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Desglose por categoría — Puntaje total: {score}/100
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((cat) => {
            const pct = (cat.score / cat.max) * 100;
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {cat.score} / {cat.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { range: "80–100", label: "A — Riesgo Bajo", color: "bg-emerald-500" },
              { range: "60–79", label: "B — Riesgo Medio", color: "bg-amber-500" },
              { range: "40–59", label: "C — Riesgo Alto", color: "bg-orange-500" },
              { range: "0–39", label: "Rechazado", color: "bg-red-500" },
            ].map((item) => (
              <div key={item.range} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                <span className="text-muted-foreground">
                  {item.range}: {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
