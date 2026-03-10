import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MasterDataset } from "@/lib/financial/types";

interface AnnualKpiBarChartProps {
  master: MasterDataset;
}

export function AnnualKpiBarChart({ master }: AnnualKpiBarChartProps) {
  // Build data from MASTER — current year metrics + predicted next year
  const currentYear = master.periodo || new Date().getFullYear().toString();
  const nextYear = `${parseInt(currentYear.replace(/\D/g, "").slice(0, 4) || "2025") + 1}`;

  const kpis = [
    { kpi: "Ventas", actual: master.ventas, prediccion: master.ventas * 1.12 },
    { kpi: "Util. Bruta", actual: master.utilidadBruta, prediccion: master.utilidadBruta * 1.15 },
    { kpi: "EBIT", actual: master.ebit, prediccion: master.ebit * 1.18 },
    { kpi: "Util. Neta", actual: master.utilidadNeta, prediccion: master.utilidadNeta * 1.14 },
    { kpi: "Cap. Trabajo", actual: master.capitalDeTrabajo, prediccion: master.capitalDeTrabajo * 1.2 },
  ];

  return (
    <Card className="card-premium w-full overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Desempeño Anual de KPIs
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {currentYear} (actual) vs. {nextYear} (predicción)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={kpis} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
            <XAxis
              dataKey="kpi"
              tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                borderColor: "hsl(220, 13%, 18%)",
                borderRadius: 8,
                fontSize: 12,
                color: "hsl(210, 20%, 92%)",
              }}
              cursor={{ fill: "hsl(220, 14%, 14%)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(200, 15%, 55%)" }} />
            <Bar
              name={`Actual (${currentYear})`}
              dataKey="actual"
              fill="hsl(192, 100%, 44%)"
              radius={[4, 4, 0, 0]}
              opacity={0.9}
            />
            <Bar
              name={`Predicción (${nextYear})`}
              dataKey="prediccion"
              fill="hsl(142, 71%, 45%)"
              radius={[4, 4, 0, 0]}
              opacity={0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
