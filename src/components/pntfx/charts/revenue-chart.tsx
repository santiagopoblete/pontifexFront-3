"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { mes: "Ene", ingresos: 42000 },
  { mes: "Feb", ingresos: 38500 },
  { mes: "Mar", ingresos: 51000 },
  { mes: "Abr", ingresos: 47800 },
  { mes: "May", ingresos: 53200 },
  { mes: "Jun", ingresos: 61000 },
];

export function RevenueChart() {
  return (
    <Card className="card-premium w-full overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Ingresos Mensuales
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enero — Junio 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(192, 100%, 44%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(192, 100%, 44%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Ingresos"]}
              contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", borderColor: "hsl(220, 13%, 18%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 92%)" }}
              cursor={{ fill: "hsl(220, 14%, 14%)" }}
            />
            <Area type="monotone" dataKey="ingresos" stroke="hsl(192, 100%, 44%)" fill="url(#colorRevenue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
