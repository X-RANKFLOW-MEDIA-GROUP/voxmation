import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/portal/ProtectedRoute";
import PortalLayout from "@/components/portal/PortalLayout";
import Index from "./pages/Index";
import HomeTest from "./pages/HomeTest";
import Demo from "./pages/Demo";
import Pricing from "./pages/Pricing";
import ROICalculator from "./pages/ROICalculator";
import IndustryPage from "./pages/IndustryPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/portal/Dashboard";
import VoiceAgent from "./pages/portal/VoiceAgent";
import MissedCalls from "./pages/portal/MissedCalls";
import Leads from "./pages/portal/Leads";
import Bookings from "./pages/portal/Bookings";
import Automations from "./pages/portal/Automations";
import Integrations from "./pages/portal/Integrations";
import Billing from "./pages/portal/Billing";
import Support from "./pages/portal/Support";
import UseCases from "./pages/UseCases";
import Industries from "./pages/Industries";
import CaseStudies from "./pages/CaseStudies";
import UseCaseDetail from "./pages/UseCaseDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import VerticalPage from "./pages/VerticalPage";
import StateVerticalPage from "./pages/StateVerticalPage";
import ComparisonPage from "./pages/ComparisonPage";
import ResourcePage from "./pages/ResourcePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PortalPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <PortalLayout>{children}</PortalLayout>
  </ProtectedRoute>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home-test" element={<HomeTest />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/roi-calculator" element={<ROICalculator />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/use-cases/:slug" element={<UseCaseDetail />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* Vertical Pillar Pages */}
              <Route path="/:vertical" element={<VerticalPage />} />
              <Route path="/:vertical/:state" element={<StateVerticalPage />} />
              
              {/* Comparison Pages */}
              <Route path="/vs-:slug" element={<ComparisonPage />} />
              
              {/* Resource Pages */}
              <Route path="/resources/:slug" element={<ResourcePage />} />
              
              <Route path="/auth" element={<Auth />} />
              <Route path="/portal" element={<PortalPage><Dashboard /></PortalPage>} />
              <Route path="/portal/voice-agent" element={<PortalPage><VoiceAgent /></PortalPage>} />
              <Route path="/portal/missed-calls" element={<PortalPage><MissedCalls /></PortalPage>} />
              <Route path="/portal/leads" element={<PortalPage><Leads /></PortalPage>} />
              <Route path="/portal/bookings" element={<PortalPage><Bookings /></PortalPage>} />
              <Route path="/portal/automations" element={<PortalPage><Automations /></PortalPage>} />
              <Route path="/portal/integrations" element={<PortalPage><Integrations /></PortalPage>} />
              <Route path="/portal/billing" element={<PortalPage><Billing /></PortalPage>} />
              <Route path="/portal/support" element={<PortalPage><Support /></PortalPage>} />
              <Route path="/:slug" element={<IndustryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
