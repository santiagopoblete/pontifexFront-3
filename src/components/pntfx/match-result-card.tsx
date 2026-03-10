import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Building2 } from "lucide-react";
import type { MatchResult } from "@/hooks/use-client-matching";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (score >= 60) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-destructive bg-destructive/10 border-destructive/30";
}

export function MatchResultCard({ result }: { result: MatchResult }) {
  const [open, setOpen] = useState(false);
  const { partner, score, matches, mismatches } = result;

  return (
    <Card className="card-premium w-full overflow-hidden">
      <div
        className={`h-0.5 w-full ${
          score >= 80
            ? "bg-gradient-to-r from-emerald-500/60 via-emerald-400 to-emerald-500/60"
            : score >= 60
            ? "bg-gradient-to-r from-yellow-500/60 via-yellow-400 to-yellow-500/60"
            : "bg-gradient-to-r from-destructive/60 via-destructive to-destructive/60"
        }`}
      />
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">{partner.name}</h3>
              <p className="text-xs text-muted-foreground">{partner.tipo}</p>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs font-bold ${scoreColor(score)}`}>
            {score}%
          </Badge>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="text-xs text-primary hover:underline cursor-pointer">
            {open ? "Ocultar detalles" : "Ver detalles"}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {matches.length > 0 && (
              <div className="space-y-1">
                {matches.map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            )}
            {mismatches.length > 0 && (
              <div className="space-y-1">
                {mismatches.map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-destructive/80">
                    <XCircle className="w-3 h-3 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
