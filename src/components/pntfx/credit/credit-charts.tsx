"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CHART = {
  grid: "hsl(220, 13%, 18%)",
  tick: { fontSize: 11, fill: "hsl(200, 15%, 55%)" },
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(220, 18%, 10%)",
      border: "1px solid hsl(220, 13%, 18%)",
      borderRadius: 10,
      fontSize: 12,
      color: "hsl(210, 20%, 92%)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    },
    labelStyle: { color: "hsl(200, 15%, 55%)" },
  },
  colors: {
    primary: "hsl(192, 100%, 44%)",
    primaryLight: "hsl(192, 80%, 55%)",
    primaryDim: "hsl(192, 60%, 35%)",
    secondary: "hsl(160, 55%, 48%)",
    tertiary: "hsl(45, 80%, 55%)",
    expense: "hsl(0, 65%, 52%)",
    expenseDim: "hsl(0, 50%, 35%)",
  },
};

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Ingresos vs Gastos — grouped bars */}
      <div className="animate-fade-in-up animation-delay-200">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Ingresos vs Gastos</CardTitle>
            <CardDescription className="text-muted-foreground">Por periodo (anual o mensual)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.revenueTrend} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} barGap={6} barCategoryGap="24%">
                <defs>
                  <linearGradient id="ingresosGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={CHART.colors.primaryDim} />
                    <stop offset="100%" stopColor={CHART.colors.primary} />
                  </linearGradient>
                  <linearGradient id="gastosGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={CHART.colors.expenseDim} />
                    <stop offset="100%" stopColor={CHART.colors.expense} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="mes" tick={CHART.tick} axisLine={false} tickLine={false} dy={4} />
                <YAxis tick={CHART.tick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} width={42} />
                <Tooltip
                  contentStyle={CHART.tooltip.contentStyle}
                  formatter={(v: number, name: string) => [`$${Number(v).toLocaleString()}`, name === "ingresos" ? "Ingresos" : "Gastos"]}
                  cursor={{ fill: "hsl(220, 14%, 14%)" }}
                />
                <Bar dataKey="ingresos" name="ingresos" fill="url(#ingresosGrad)" radius={[6, 6, 0, 0]} maxBarSize={64} isAnimationActive animationDuration={700} />
                <Bar dataKey="gastos" name="gastos" fill="url(#gastosGrad)" radius={[6, 6, 0, 0]} maxBarSize={64} isAnimationActive animationDuration={700} />
                <Legend formatter={(v) => (v === "ingresos" ? "Ingresos" : "Gastos")} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 2. Márgenes — grouped bars */}
      <div className="animate-fade-in-up animation-delay-300">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Márgenes de Utilidad</CardTitle>
            <CardDescription className="text-muted-foreground">Por periodo (anual o mensual)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.margins} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} barGap={4} barCategoryGap="20%">
                <defs>
                  <linearGradient id="brutoGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={CHART.colors.primaryDim} />
                    <stop offset="100%" stopColor={CHART.colors.primary} />
                  </linearGradient>
                  <linearGradient id="operativoGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(192, 50%, 30%)" />
                    <stop offset="100%" stopColor={CHART.colors.primaryLight} />
                  </linearGradient>
                  <linearGradient id="netoGradBar" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(160, 45%, 32%)" />
                    <stop offset="100%" stopColor={CHART.colors.secondary} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="mes" tick={CHART.tick} axisLine={false} tickLine={false} dy={4} />
                <YAxis tick={CHART.tick} axisLine={false} tickLine={false} tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`} width={36} />
                <Tooltip
                  contentStyle={CHART.tooltip.contentStyle}
                  formatter={(v: number, name: string) => [`${(Number(v) * 100).toFixed(1)}%`, name === "bruto" ? "Bruto" : name === "operativo" ? "Operativo" : "Neto"]}
                  cursor={{ fill: "hsl(220, 14%, 14%)" }}
                />
                <Bar dataKey="bruto" name="bruto" fill="url(#brutoGrad)" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive animationDuration={700} />
                <Bar dataKey="operativo" name="operativo" fill="url(#operativoGrad)" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive animationDuration={700} />
                <Bar dataKey="neto" name="neto" fill="url(#netoGradBar)" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive animationDuration={700} />
                <Legend formatter={(v) => (v === "bruto" ? "Bruto" : v === "operativo" ? "Operativo" : "Neto")} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Apalancamiento — Bar chart with gradient and rounded corners */}
      <div className="animate-fade-in-up animation-delay-400">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Apalancamiento</CardTitle>
            <CardDescription className="text-muted-foreground">Razón de deuda y D/C</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.leverage} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} barGap={4} barCategoryGap="28%">
                <defs>
                  <linearGradient id="deudaGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={CHART.colors.primaryDim} />
                    <stop offset="100%" stopColor={CHART.colors.primary} />
                  </linearGradient>
                  <linearGradient id="deudaCapGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(192, 50%, 25%)" />
                    <stop offset="100%" stopColor={CHART.colors.primaryLight} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="mes" tick={CHART.tick} axisLine={false} tickLine={false} dy={4} />
                <YAxis tick={CHART.tick} axisLine={false} tickLine={false} tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`} width={36} />
                <Tooltip
                  contentStyle={CHART.tooltip.contentStyle}
                  formatter={(v: number, name: string) => [`${(Number(v) * 100).toFixed(1)}%`, name === "deuda" ? "Razón Deuda" : "Deuda/Capital"]}
                  cursor={{ fill: "hsl(220, 14%, 14%)" }}
                />
                <Bar dataKey="deuda" name="deuda" fill="url(#deudaGrad)" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={700} />
                <Bar dataKey="deudaCapital" name="deudaCapital" fill="url(#deudaCapGrad)" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={700} />
                <Legend formatter={(v) => (v === "deuda" ? "Razón Deuda" : "Deuda/Capital")} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 4. Liquidez — grouped bars */}
      <div className="animate-fade-in-up animation-delay-500">
        <Card className="card-premium w-full overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Ratios de Liquidez</CardTitle>
            <CardDescription className="text-muted-foreground">Current Ratio y Prueba Ácida</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.liquidity} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} barGap={6} barCategoryGap="28%">
                <defs>
                  <linearGradient id="currentGradBar" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={CHART.colors.primaryDim} />
                    <stop offset="100%" stopColor={CHART.colors.primary} />
                  </linearGradient>
                  <linearGradient id="acidGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(45, 55%, 38%)" />
                    <stop offset="100%" stopColor={CHART.colors.tertiary} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="mes" tick={CHART.tick} axisLine={false} tickLine={false} dy={4} />
                <YAxis tick={CHART.tick} axisLine={false} tickLine={false} tickFormatter={(v) => `${Number(v).toFixed(1)}x`} width={36} />
                <Tooltip
                  contentStyle={CHART.tooltip.contentStyle}
                  formatter={(v: number, name: string) => [`${Number(v).toFixed(2)}x`, name === "current" ? "Current Ratio" : "Prueba Ácida"]}
                  cursor={{ fill: "hsl(220, 14%, 14%)" }}
                />
                <Bar dataKey="current" name="current" fill="url(#currentGradBar)" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={700} />
                <Bar dataKey="acid" name="acid" fill="url(#acidGrad)" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={700} />
                <Legend formatter={(v) => (v === "current" ? "Current Ratio" : "Prueba Ácida")} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
