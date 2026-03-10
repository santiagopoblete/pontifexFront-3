"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { categoria: "Activos",   valor: 85 },
  { categoria: "Pasivos",   valor: 40 },
  { categoria: "Capital",   valor: 65 },
  { categoria: "Deuda",     valor: 30 },
  { categoria: "Liquidez",  valor: 72 },
];

export function BalanceChart() {
  return (
    <Card className="card-premium w-full overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Balance General
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribución de indicadores 2024
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(220, 13%, 18%)" />
            <PolarAngleAxis dataKey="categoria" tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, ""]}
              contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", borderColor: "hsl(220, 13%, 18%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 92%)" }}
            />
            <Radar dataKey="valor" stroke="hsl(192, 100%, 44%)" fill="hsl(192, 100%, 44%)" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
