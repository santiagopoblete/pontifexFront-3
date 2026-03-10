"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 10%)",
  borderColor: "hsl(220, 13%, 18%)",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(210, 20%, 92%)",
};

const axisTick = { fontSize: 11, fill: "hsl(200, 15%, 55%)" };
const gridStroke = "hsl(220, 13%, 18%)";

interface CreditChartsProps {
  data: {
    revenueTrend: Array<{ mes: string; ingresos: number; gastos: number }>;
    margins: Array<{ mes: string; bruto: number; operativo: number; neto: number }>;
    leverage: Array<{ mes: string; deuda: number; deudaCapital: number }>;
    liquidity: Array<{ mes: string; current: number; acid: number }>;
  };
}

export function CreditCharts({ data }: CreditChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Revenue Trend */}
      <div className="animate-fade-in-up animation-delay-200">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Ingresos vs Gastos</CardTitle>
            <CardDescription className="text-muted-foreground">Tendencia semestral</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient id="creditRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(192, 100%, 44%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(192, 100%, 44%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="creditExpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="mes" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "ingresos" ? "Ingresos" : "Gastos"]} />
                <Area type="monotone" dataKey="ingresos" stroke="hsl(192, 100%, 44%)" fill="url(#creditRevGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="gastos" stroke="hsl(0, 70%, 50%)" fill="url(#creditExpGrad)" strokeWidth={2} />
                <Legend formatter={(v) => (v === "ingresos" ? "Ingresos" : "Gastos")} wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profit Margins */}
      <div className="animate-fade-in-up animation-delay-300">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Márgenes de Utilidad</CardTitle>
            <CardDescription className="text-muted-foreground">Evolución mensual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.margins}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="mes" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${(v * 100).toFixed(1)}%`, name === "bruto" ? "Bruto" : name === "operativo" ? "Operativo" : "Neto"]} />
                <Line type="monotone" dataKey="bruto" stroke="hsl(192, 100%, 44%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="operativo" stroke="hsl(192, 80%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="neto" stroke="hsl(160, 60%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
                <Legend formatter={(v) => (v === "bruto" ? "Bruto" : v === "operativo" ? "Operativo" : "Neto")} wrapperStyle={{ fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leverage */}
      <div className="animate-fade-in-up animation-delay-400">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Apalancamiento</CardTitle>
            <CardDescription className="text-muted-foreground">Razón de deuda y D/C</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.leverage}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="mes" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${(v * 100).toFixed(1)}%`, name === "deuda" ? "Razón Deuda" : "Deuda/Capital"]} />
                <Bar dataKey="deuda" fill="hsl(192, 100%, 44%)" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="deudaCapital" fill="hsl(192, 80%, 35%)" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Legend formatter={(v) => (v === "deuda" ? "Razón Deuda" : "Deuda/Capital")} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity */}
      <div className="animate-fade-in-up animation-delay-500">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Ratios de Liquidez</CardTitle>
            <CardDescription className="text-muted-foreground">Current Ratio y Prueba Ácida</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.liquidity}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="mes" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}x`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v.toFixed(2)}x`, name === "current" ? "Current Ratio" : "Prueba Ácida"]} />
                <Line type="monotone" dataKey="current" stroke="hsl(192, 100%, 44%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="acid" stroke="hsl(45, 80%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                <Legend formatter={(v) => (v === "current" ? "Current Ratio" : "Prueba Ácida")} wrapperStyle={{ fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
