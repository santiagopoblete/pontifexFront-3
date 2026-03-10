import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import type { MasterDataset } from "@/lib/financial/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface IndustryComparisonChartProps {
  master: MasterDataset;
  industryProjects: MasterDataset[];
}

export function IndustryComparisonChart({ master, industryProjects }: IndustryComparisonChartProps) {
  if (industryProjects.length === 0) {
    return (
      <Card className="card-premium w-full overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Comparativa de Industria
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Desempeño de KPIs vs. otros proyectos del mismo sector
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted/50 border-border">
            <Info className="!w-4 !h-4 text-muted-foreground" />
            <AlertDescription className="text-muted-foreground text-sm">
              No hay otros proyectos en la misma industria para comparar.
              Genera MASTER datasets de otras empresas del mismo sector para habilitar la comparativa.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Compute industry averages
  const allProjects = [...industryProjects, master];
  const avgVentas = allProjects.reduce((s, p) => s + p.ventas, 0) / allProjects.length;
  const avgMargen = allProjects.reduce((s, p) => s + p.margenNeto, 0) / allProjects.length;
  const avgROE = allProjects.reduce((s, p) => s + p.roe, 0) / allProjects.length;
  const avgLiquidez = allProjects.reduce((s, p) => s + p.currentRatio, 0) / allProjects.length;

  const data = [
    {
      kpi: "Margen Neto",
      proyecto: Math.round(master.margenNeto * 100),
      industria: Math.round(avgMargen * 100),
      prediccion: Math.round(master.margenNeto * 100 * 1.12),
    },
    {
      kpi: "ROE",
      proyecto: Math.round(master.roe * 100),
      industria: Math.round(avgROE * 100),
      prediccion: Math.round(master.roe * 100 * 1.15),
    },
    {
      kpi: "Liquidez",
      proyecto: Math.round(master.currentRatio * 100),
      industria: Math.round(avgLiquidez * 100),
      prediccion: Math.round(master.currentRatio * 100 * 1.1),
    },
  ];

  return (
    <Card className="card-premium w-full overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Comparativa de Industria
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {master.empresa} vs. promedio del sector ({industryProjects.length + 1} empresas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} barGap={4}>
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
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value}%`, name]}
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
              name={master.empresa}
              dataKey="proyecto"
              fill="hsl(192, 100%, 44%)"
              radius={[4, 4, 0, 0]}
              opacity={0.9}
            />
            <Bar
              name="Promedio Industria"
              dataKey="industria"
              fill="hsl(220, 15%, 45%)"
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />
            <Bar
              name="Predicción"
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
