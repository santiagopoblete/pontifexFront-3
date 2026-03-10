import { NavBar } from "@/components/pntfx/navbar";
import { useFinancialStore } from "@/stores/financial-store";
import { EmptyMasterState } from "@/components/pntfx/empty-master-state";
import { CreditStatusCard } from "@/components/pntfx/credit/credit-status-card";
import { CreditKpiGrid } from "@/components/pntfx/credit/credit-kpi-grid";
import { CreditCharts } from "@/components/pntfx/credit/credit-charts";
import { CreditScoringPanel } from "@/components/pntfx/credit/credit-scoring-panel";
import { CreditDecisionSummary } from "@/components/pntfx/credit/credit-decision-summary";
import { useCreditAnalysis } from "@/hooks/use-credit-analysis";

export default function DiagnosticoCrediticio() {
  const { master } = useFinancialStore();
  const analysis = useCreditAnalysis();

  if (!master) {
    return (
      <div className="min-h-screen w-full bg-page-gradient">
        <NavBar />
        <main className="w-full max-w-7xl mx-auto py-8 px-6 md:px-8">
          <div className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Diagnóstico Crediticio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Evaluación financiera para determinar aptitud crediticia
            </p>
          </div>
          <EmptyMasterState section="Diagnóstico Crediticio" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <NavBar />
      <main className="w-full max-w-7xl mx-auto py-8 px-6 md:px-8">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Diagnóstico Crediticio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluación financiera para determinar aptitud crediticia
          </p>
        </div>

        <div className="mb-8 animate-fade-in-up animation-delay-100">
          <CreditStatusCard rating={analysis.rating} score={analysis.score} label={analysis.label} />
        </div>
        <div className="mb-8">
          <CreditKpiGrid metrics={analysis.metrics} />
        </div>
        <div className="mb-8">
          <CreditCharts data={analysis.chartData} />
        </div>
        <div className="mb-8 animate-fade-in-up animation-delay-300">
          <CreditScoringPanel categories={analysis.categories} score={analysis.score} />
        </div>
        <div className="animate-fade-in-up animation-delay-400">
          <CreditDecisionSummary
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
            risks={analysis.risks}
            recommendation={analysis.recommendation}
          />
        </div>
      </main>
    </div>
  );
}
