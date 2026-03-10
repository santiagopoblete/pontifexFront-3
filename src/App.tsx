import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinancialProvider } from "@/stores/financial-store";
import Index from "./pages/Index";
import ProcesadorFinanciero from "./pages/ProcesadorFinanciero";
import EmpateDeClientes from "./pages/EmpateDeClientes";
import DiagnosticoCrediticio from "./pages/DiagnosticoCrediticio";
import PredictorKPI from "./pages/PredictorKPI";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinancialProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ProcesadorFinanciero" element={<ProcesadorFinanciero />} />
            <Route path="/EmpateDeClientes" element={<EmpateDeClientes />} />
            <Route path="/DiagnosticoCrediticio" element={<DiagnosticoCrediticio />} />
            <Route path="/PredictorKPI" element={<PredictorKPI />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FinancialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
