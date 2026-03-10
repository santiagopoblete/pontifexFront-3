import { Link, useLocation } from "react-router-dom";
import { BarChart3, UserIcon } from "lucide-react";

const NAV_ITEMS = [
  ["Procesador Financiero", "/ProcesadorFinanciero"],
  ["Empate de Clientes", "/EmpateDeClientes"],
  ["Diagnóstico Crediticio", "/DiagnosticoCrediticio"],
  ["Predictor de KPIs", "/PredictorKPI"],
] as const;

export function NavBar() {
  const location = useLocation();

  return (
    <nav className="w-full glass-surface sticky top-0 z-50 border-b border-border/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40">
            <BarChart3 size={16} className="text-primary" />
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground">
            Pontifex
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(([label, path]) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* User Button */}
        <button
          className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center transition-all duration-200 hover:bg-accent hover:border-primary/30"
          aria-label="Usuario"
        >
          <UserIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </nav>
  );
}
