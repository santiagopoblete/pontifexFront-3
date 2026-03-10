"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { mes: "Ene", gastos: 28000 },
  { mes: "Feb", gastos: 31000 },
  { mes: "Mar", gastos: 27500 },
  { mes: "Abr", gastos: 33000 },
  { mes: "May", gastos: 29800 },
  { mes: "Jun", gastos: 35400 },
];

export function ExpensesChart() {
  return (
    <Card className="card-premium w-full overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Gastos por Mes
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enero — Junio 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Gastos"]}
              contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", borderColor: "hsl(220, 13%, 18%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 92%)" }}
              cursor={{ fill: "hsl(220, 14%, 14%)" }}
            />
            <Bar dataKey="gastos" fill="hsl(192, 100%, 44%)" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
