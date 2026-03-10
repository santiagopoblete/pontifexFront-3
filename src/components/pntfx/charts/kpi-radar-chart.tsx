import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { MasterDataset } from "@/lib/financial/types";

interface KpiRadarChartProps {
  master: MasterDataset;
}

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function KpiRadarChart({ master }: KpiRadarChartProps) {
  const currentData = [
    { kpi: "Margen Neto", actual: normalize(master.margenNeto, -0.1, 0.5), prediccion: 0 },
    { kpi: "ROE", actual: normalize(master.roe, -0.1, 0.5), prediccion: 0 },
    { kpi: "Liquidez", actual: normalize(master.currentRatio, 0, 4), prediccion: 0 },
    { kpi: "Solvencia", actual: normalize(1 - master.razonDeuda, 0, 1), prediccion: 0 },
    { kpi: "Eficiencia", actual: normalize(master.rotacionInventarios, 0, 10), prediccion: 0 },
    { kpi: "ROA", actual: normalize(master.roa, -0.1, 0.4), prediccion: 0 },
  ];

  // Simple prediction: simulate improvement after credit injection (10-20% boost)
  const data = currentData.map((d) => ({
    ...d,
    prediccion: Math.min(100, d.actual * 1.15 + 5),
  }));

  return (
    <Card className="card-premium w-full overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Estado General de KPIs
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Actual vs. Predicción post-crédito
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(220, 13%, 18%)" />
            <PolarAngleAxis dataKey="kpi" tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} />
            <Tooltip
              formatter={(value: number) => [`${Math.round(value)}%`, ""]}
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                borderColor: "hsl(220, 13%, 18%)",
                borderRadius: 8,
                fontSize: 12,
                color: "hsl(210, 20%, 92%)",
              }}
            />
            <Radar
              name="Actual"
              dataKey="actual"
              stroke="hsl(192, 100%, 44%)"
              fill="hsl(192, 100%, 44%)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="Predicción"
              dataKey="prediccion"
              stroke="hsl(142, 71%, 45%)"
              fill="hsl(142, 71%, 45%)"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "hsl(200, 15%, 55%)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
