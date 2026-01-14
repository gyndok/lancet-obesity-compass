import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import InitialVisitInterview from "./pages/InitialVisitInterview";
import ReturnVisitInterview from "./pages/ReturnVisitInterview";
import FormularyBrowse from "./pages/FormularyBrowse";
import FormularyDetail from "./pages/FormularyDetail";
import FormularyComparePage from "./pages/FormularyComparePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assessment" element={<Index />} />
          <Route path="/interview/initial" element={<InitialVisitInterview />} />
          <Route path="/interview/return" element={<ReturnVisitInterview />} />
          <Route path="/formulary" element={<FormularyBrowse />} />
          <Route path="/formulary/:id" element={<FormularyDetail />} />
          <Route path="/formulary/compare" element={<FormularyComparePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
