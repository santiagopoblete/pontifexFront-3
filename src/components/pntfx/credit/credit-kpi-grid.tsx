import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Metric {
  key: string;
  label: string;
  value: number;
  fmt: "pct" | "x";
  tooltip: string;
}

interface CreditKpiGridProps {
  metrics: {
    profitability: Metric[];
    liquidity: Metric[];
    efficiency: Metric[];
    leverage: Metric[];
  };
}

function formatValue(value: number, fmt: "pct" | "x") {
  if (fmt === "pct") return `${(value * 100).toFixed(1)}%`;
  return `${value.toFixed(2)}x`;
}

function getTrend(value: number, fmt: "pct" | "x") {
  if (fmt === "pct") {
    if (value > 0.2) return { icon: TrendingUp, color: "text-emerald-400" };
    if (value > 0.1) return { icon: Minus, color: "text-amber-400" };
    return { icon: TrendingDown, color: "text-red-400" };
  }
  if (value > 2) return { icon: TrendingUp, color: "text-emerald-400" };
  if (value > 1) return { icon: Minus, color: "text-amber-400" };
  return { icon: TrendingDown, color: "text-red-400" };
}

const sectionLabels: Record<string, string> = {
  profitability: "Rentabilidad",
  liquidity: "Liquidez",
  efficiency: "Eficiencia",
  leverage: "Apalancamiento",
};

function MetricCard({ metric, delay }: { metric: Metric; delay: number }) {
  const trend = getTrend(metric.value, metric.fmt);
  const TrendIcon = trend.icon;

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <Card className="card-premium overflow-hidden group h-full">
        <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate pr-2">
              {metric.label}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-accent transition-colors" aria-label={`Info: ${metric.label}`}>
                  <Info size={12} className="text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                {metric.tooltip}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-xl font-bold text-foreground tabular-nums">
              {formatValue(metric.value, metric.fmt)}
            </p>
            <TrendIcon size={16} className={trend.color} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CreditKpiGrid({ metrics }: CreditKpiGridProps) {
  let globalDelay = 100;

  return (
    <div className="space-y-6">
      {(Object.keys(sectionLabels) as Array<keyof typeof sectionLabels>).map((section) => {
        const items = metrics[section as keyof typeof metrics];
        return (
          <div key={section}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 pl-1">
              {sectionLabels[section]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {items.map((m) => {
                const d = globalDelay;
                globalDelay += 50;
                return <MetricCard key={m.key} metric={m} delay={d} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
