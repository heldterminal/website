import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Analytics } from "@vercel/analytics/react"; 
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
// Auth import removed - auth is disabled for prod, redirects to waitlist
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import TeamManagement from "./pages/TeamManagement";
import TeamDetails from "./pages/TeamDetails";
import TeamCreate from "./pages/TeamCreate";
import AcceptInvite from "./pages/AcceptInvite";
import PersonalAnalytics from "./pages/PersonalAnalytics";
import NotFound from "./pages/NotFound";
import Waitlist from "./pages/Waitlist";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <SpeedInsights />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Navigate to="/waitlist" replace />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/team-management" element={<TeamManagement />} />
            <Route path="/team-management/create" element={<TeamCreate />} />
            <Route path="/team-management/:teamId" element={<TeamDetails />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/waitlist" element={<Waitlist />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/personal-analytics" element={<PersonalAnalytics />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
