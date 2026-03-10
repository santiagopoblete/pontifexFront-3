import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, FileSpreadsheet, Zap, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Carga de Estados Financieros",
    description: "Importa tus estados de cuenta, resultados y balance general en segundos.",
  },
  {
    icon: BarChart3,
    title: "Análisis Automático",
    description: "Obtén insights accionables generados automáticamente a partir de tus datos.",
  },
  {
    icon: Zap,
    title: "Resultados Instantáneos",
    description: "Procesamiento rápido para que tomes decisiones sin esperar.",
  },
  {
    icon: ShieldCheck,
    title: "Datos Seguros",
    description: "Tu información financiera es procesada de forma privada y segura.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-page-gradient">
      {/* Navbar */}
      <nav className="w-full glass-surface sticky top-0 z-50 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart3 size={16} className="text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Pontifex
            </span>
          </div>
          <Link to="/ProcesadorFinanciero">
            <Button className="cursor-pointer text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105">
              Ir a la herramienta
              <ArrowRight className="!w-4 !h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 pt-20 md:pt-28 pb-20 flex flex-col items-center text-center">
        <div className="glow-line w-12 mb-6 animate-fade-in-up" />

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 animate-fade-in-up animation-delay-100">
          Análisis financiero{" "}
          <span className="text-gradient-primary">inteligente</span>
          <br />
          sin complicaciones.
        </h1>

        <p className="text-base md:text-lg max-w-xl mb-10 text-muted-foreground animate-fade-in-up animation-delay-200">
          Pontifex Auto Crédito Empresarial transforma tus estados financieros en insights
          claros y accionables, de forma automática.
        </p>

        <div className="flex items-center gap-4 animate-fade-in-up animation-delay-300">
          <Link to="/ProcesadorFinanciero">
            <Button className="cursor-pointer px-6 py-5 text-base transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow">
              Comenzar ahora
              <ArrowRight className="!w-4 !h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="w-full h-px bg-border" />
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-20">
        <div className="flex flex-col items-center mb-12 animate-fade-in-up">
          <div className="glow-line w-8 mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Todo lo que necesitas
          </h2>
          <p className="text-sm mt-2 text-muted-foreground">
            Diseñado para contadores, CFOs y analistas financieros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card-premium rounded-xl p-6 animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-primary/10 border border-primary/20">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-1 text-foreground">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 pb-24">
        <div className="card-premium rounded-2xl p-8 md:p-12 flex flex-col items-center text-center">
          <div className="glow-line w-8 mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-foreground">
            Listo para empezar?
          </h2>
          <p className="text-base mb-8 max-w-md text-muted-foreground">
            Carga tus primeros estados financieros y obtén tu análisis en minutos.
          </p>
          <Link to="/ProcesadorFinanciero">
            <Button className="cursor-pointer px-8 py-5 text-base transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90">
              Ir al Analizador
              <ArrowRight className="!w-4 !h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Pontifex Data Analyzer. Todos los derechos reservados.
      </footer>
    </div>
  );
}
