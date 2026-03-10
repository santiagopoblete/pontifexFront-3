"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [
  { mes: "Ene", flujo: 14000 },
  { mes: "Feb", flujo: 7500 },
  { mes: "Mar", flujo: 23500 },
  { mes: "Abr", flujo: 14800 },
  { mes: "May", flujo: 23400 },
  { mes: "Jun", flujo: 25600 },
];

export function CashFlowChart() {
  return (
    <Card className="card-premium w-full overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Flujo de Caja
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enero — Junio 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(200, 15%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <ReferenceLine y={0} stroke="hsl(220, 13%, 18%)" strokeDasharray="4 4" />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Flujo"]}
              contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", borderColor: "hsl(220, 13%, 18%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 92%)" }}
            />
            <Line type="monotone" dataKey="flujo" stroke="hsl(192, 100%, 44%)" strokeWidth={2} dot={{ fill: "hsl(192, 100%, 44%)", r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
