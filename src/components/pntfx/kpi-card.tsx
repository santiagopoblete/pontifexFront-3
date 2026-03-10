import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}

export function KpiCard({ title, value, description, icon }: KpiCardProps) {
  return (
    <Card className="card-premium w-full overflow-hidden group">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs mt-1 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
