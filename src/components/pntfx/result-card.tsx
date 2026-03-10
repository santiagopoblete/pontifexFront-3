import { Card, CardContent } from "@/components/ui/card";

const RATING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "A+": { bg: "hsl(var(--rating-a-bg))", text: "hsl(var(--rating-a-text))", border: "hsl(var(--rating-a-border))" },
  "A":  { bg: "hsl(var(--rating-a-bg))", text: "hsl(var(--rating-a-text))", border: "hsl(var(--rating-a-border))" },
  "A-": { bg: "hsl(var(--rating-a-bg))", text: "hsl(var(--rating-a-text))", border: "hsl(var(--rating-a-border))" },
  "B+": { bg: "hsl(var(--rating-b-bg))", text: "hsl(var(--rating-b-text))", border: "hsl(var(--rating-b-border))" },
  "B":  { bg: "hsl(var(--rating-b-bg))", text: "hsl(var(--rating-b-text))", border: "hsl(var(--rating-b-border))" },
  "B-": { bg: "hsl(var(--rating-b-bg))", text: "hsl(var(--rating-b-text))", border: "hsl(var(--rating-b-border))" },
  "C":  { bg: "hsl(var(--rating-c-bg))", text: "hsl(var(--rating-c-text))", border: "hsl(var(--rating-c-border))" },
  "C-": { bg: "hsl(var(--rating-c-bg))", text: "hsl(var(--rating-c-text))", border: "hsl(var(--rating-c-border))" },
  "D":  { bg: "hsl(var(--rating-c-bg))", text: "hsl(var(--rating-c-text))", border: "hsl(var(--rating-c-border))" },
};

interface ResultCardProps {
  title: string;
  description: string;
  rating: string;
  image?: string;
}

export function ResultCard({ title, description, rating, image }: ResultCardProps) {
  const colors = RATING_COLORS[rating] ?? { bg: "hsl(var(--secondary))", text: "hsl(var(--foreground))", border: "hsl(var(--border))" };

  return (
    <Card className="card-premium w-full overflow-hidden group">
      {/* Top glow accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      {/* Image area */}
      <div className="w-full flex items-center justify-center p-4 bg-secondary/30" style={{ height: "140px" }}>
        {image ? (
          <img src={image} alt={title} className="max-h-full object-contain" />
        ) : (
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
            <rect x="4"  y="30" width="12" height="26" rx="2" fill="hsl(var(--border))" />
            <rect x="22" y="18" width="12" height="38" rx="2" fill="hsl(var(--primary))" opacity="0.4" />
            <rect x="40" y="10" width="12" height="46" rx="2" fill="hsl(var(--primary))" opacity="0.7" />
            <rect x="58" y="22" width="12" height="34" rx="2" fill="hsl(var(--primary))" opacity="0.5" />
          </svg>
        )}
      </div>

      <CardContent className="pt-4 pb-5 px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Calificación
          </p>
          <span
            className="text-sm font-bold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}
          >
            {rating}
          </span>
        </div>
        <h3 className="text-sm font-semibold mb-1 text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
