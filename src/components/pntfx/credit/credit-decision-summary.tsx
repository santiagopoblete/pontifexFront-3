import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, ShieldAlert, FileText } from "lucide-react";

interface CreditDecisionSummaryProps {
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendation: string;
}

function Section({
  title,
  items,
  icon: Icon,
  iconColor,
}: {
  title: string;
  items: string[];
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={iconColor} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <ul className="space-y-1.5 pl-6">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CreditDecisionSummary({
  strengths,
  weaknesses,
  risks,
  recommendation,
}: CreditDecisionSummaryProps) {
  return (
    <Card className="card-premium overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-60" />
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">
          Resumen de Decisión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Section title="Fortalezas" items={strengths} icon={CheckCircle2} iconColor="text-emerald-400" />
          <Section title="Debilidades" items={weaknesses} icon={AlertTriangle} iconColor="text-amber-400" />
          <Section title="Riesgos Principales" items={risks} icon={ShieldAlert} iconColor="text-red-400" />
        </div>

        {/* Recommendation */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={16} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Recomendación</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
