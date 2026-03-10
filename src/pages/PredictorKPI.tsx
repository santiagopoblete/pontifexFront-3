import { NavBar } from "@/components/pntfx/navbar";
import { useFinancialStore } from "@/stores/financial-store";
import { EmptyMasterState } from "@/components/pntfx/empty-master-state";
import { KpiRadarChart } from "@/components/pntfx/charts/kpi-radar-chart";
import { AnnualKpiBarChart } from "@/components/pntfx/charts/annual-kpi-bar-chart";
import { IndustryComparisonChart } from "@/components/pntfx/charts/industry-comparison-chart";
import { KpiCard } from "@/components/pntfx/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

export default function PredictorKPI() {
  const { master } = useFinancialStore();

  return (
    <div className="min-h-screen w-full bg-page-gradient">
      <NavBar />

      <main className="w-full max-w-7xl mx-auto py-8 px-6 md:px-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Predictor de KPI&apos;s
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de indicadores clave de desempeño y predicciones
          </p>
        </div>

        {!master ? (
          <EmptyMasterState section="Predictor de KPIs" />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="animate-fade-in-up animation-delay-100">
                <KpiCard
                  title="Ingresos Totales"
                  value={`$${master.ventas.toLocaleString()}`}
                  description={`Margen bruto ${Math.round(master.margenBruto * 100)}%`}
                  icon={<DollarSign size={18} className="text-primary" />}
                />
              </div>
              <div className="animate-fade-in-up animation-delay-200">
                <KpiCard
                  title="Gastos Totales"
                  value={`$${(master.costoDeVentas + master.gastosOperativos).toLocaleString()}`}
                  description="Costo + operativos"
                  icon={<TrendingDown size={18} className="text-primary" />}
                />
              </div>
              <div className="animate-fade-in-up animation-delay-300">
                <KpiCard
                  title="Utilidad Neta"
                  value={`$${master.utilidadNeta.toLocaleString()}`}
                  description={`Margen neto ${Math.round(master.margenNeto * 100)}%`}
                  icon={<TrendingUp size={18} className="text-primary" />}
                />
              </div>
              <div className="animate-fade-in-up animation-delay-400">
                <KpiCard
                  title="Flujo de Caja"
                  value={`$${(master.saldoFinal - master.saldoInicial).toLocaleString()}`}
                  description="Acumulado"
                  icon={<BarChart3 size={18} className="text-primary" />}
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="forecast" className="animate-fade-in-up animation-delay-300">
              <TabsList className="mb-6">
                <TabsTrigger value="forecast" className="cursor-pointer">
                  General Forecast
                </TabsTrigger>
                <TabsTrigger value="industry" className="cursor-pointer">
                  Industria
                </TabsTrigger>
              </TabsList>

              {/* General Forecast */}
              <TabsContent value="forecast" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <KpiRadarChart master={master} />
                  <AnnualKpiBarChart master={master} />
                </div>
              </TabsContent>

              {/* Industry */}
              <TabsContent value="industry" className="space-y-6">
                <IndustryComparisonChart master={master} industryProjects={[]} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
