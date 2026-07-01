import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import ProtectedRoute from "@/components/portal/ProtectedRoute";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import PortalLayout from "@/components/portal/PortalLayout";
import { useWebVitals } from "@/hooks/useWebVitals";
// Homepage stays eager for fast first paint / LCP; everything else is
// code-split so each route ships only the JS it needs.
import Index from "./pages/Index";

const HomeTest = lazy(() => import("./pages/HomeTest"));
const Demo = lazy(() => import("./pages/Demo"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorks"));
const MissedCallRecovery = lazy(() => import("./pages/MissedCallRecovery"));
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const MissedCallRoiCalculator = lazy(() => import("./pages/MissedCallRoiCalculator"));
const IndustryReceptionistPage = lazy(() => import("./pages/IndustryReceptionistPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const AlternativePage = lazy(() => import("./pages/AlternativePage"));
const TrialBuilder = lazy(() => import("./pages/TrialBuilder"));
const TrialStart = lazy(() => import("./pages/TrialStart"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ROICalculator = lazy(() => import("./pages/ROICalculator"));
const Auth = lazy(() => import("./pages/Auth"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/portal/Dashboard"));
const VoiceAgent = lazy(() => import("./pages/portal/VoiceAgent"));
const VoiceSettings = lazy(() => import("./pages/portal/VoiceSettings"));
const MissedCalls = lazy(() => import("./pages/portal/MissedCalls"));
const Leads = lazy(() => import("./pages/portal/Leads"));
const Bookings = lazy(() => import("./pages/portal/Bookings"));
const Automations = lazy(() => import("./pages/portal/Automations"));
const Integrations = lazy(() => import("./pages/portal/Integrations"));
const Billing = lazy(() => import("./pages/portal/Billing"));
const Support = lazy(() => import("./pages/portal/Support"));
const Campaigns = lazy(() => import("./pages/portal/Campaigns"));
const TeamManagement = lazy(() => import("./pages/portal/TeamManagement"));
const Analytics = lazy(() => import("./pages/portal/Analytics"));
const UseCases = lazy(() => import("./pages/UseCases"));
const Industries = lazy(() => import("./pages/Industries"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const UseCaseDetail = lazy(() => import("./pages/UseCaseDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const VerticalPage = lazy(() => import("./pages/VerticalPage"));
const StateVerticalPage = lazy(() => import("./pages/StateVerticalPage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const ResourcePage = lazy(() => import("./pages/ResourcePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PortalPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <PortalLayout>{children}</PortalLayout>
  </ProtectedRoute>
);

const App = () => {
  useWebVitals();

  return (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandingProvider>
          <AdminAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <BrowserRouter>
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Routes>
                {/* Static routes first - these take priority */}
                <Route path="/" element={<Index />} />
                <Route path="/home-test" element={<HomeTest />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/missed-call-recovery" element={<MissedCallRecovery />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/roi-calculator" element={<ROICalculator />} />
                <Route path="/tools/missed-call-roi-calculator" element={<MissedCallRoiCalculator />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/use-cases" element={<UseCases />} />
                <Route path="/use-cases/:slug" element={<UseCaseDetail />} />
                <Route path="/industries" element={<Industries />} />
                <Route path="/case-studies" element={<CaseStudies />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/trial-builder" element={<TrialBuilder />} />
                <Route path="/trial/start" element={<TrialStart />} />
                <Route path="/login" element={<Login />} />

                {/* Portal routes - protected */}
                <Route path="/portal" element={<PortalPage><Dashboard /></PortalPage>} />
                <Route path="/portal/voice-agent" element={<PortalPage><VoiceAgent /></PortalPage>} />
                <Route path="/portal/voice-settings" element={<PortalPage><VoiceSettings /></PortalPage>} />
                <Route path="/portal/missed-calls" element={<PortalPage><MissedCalls /></PortalPage>} />
                <Route path="/portal/leads" element={<PortalPage><Leads /></PortalPage>} />
                <Route path="/portal/bookings" element={<PortalPage><Bookings /></PortalPage>} />
                <Route path="/portal/automations" element={<PortalPage><Automations /></PortalPage>} />
                <Route path="/portal/integrations" element={<PortalPage><Integrations /></PortalPage>} />
                <Route path="/portal/billing" element={<PortalPage><Billing /></PortalPage>} />
                <Route path="/portal/support" element={<PortalPage><Support /></PortalPage>} />
                <Route path="/portal/campaigns" element={<PortalPage><Campaigns /></PortalPage>} />
                <Route path="/portal/team-management" element={<PortalPage><TeamManagement /></PortalPage>} />
                <Route path="/portal/analytics" element={<PortalPage><Analytics /></PortalPage>} />

                {/* Comparison Pages - specific pattern before dynamic */}
                <Route path="/vs/:slug" element={<ComparisonPage />} />
                <Route path="/compare/:slug" element={<ComparePage />} />
                <Route path="/alternatives/:slug" element={<AlternativePage />} />

                {/* Industry AI receptionist pages */}
                <Route path="/industries/:slug" element={<IndustryReceptionistPage />} />

                {/* Resource Pages */}
                <Route path="/resources/:slug" element={<ResourcePage />} />

                {/* Dynamic SEO pages - vertical pillar pages with state variations */}
                <Route path="/:vertical/:state" element={<StateVerticalPage />} />

                {/* Single segment dynamic routes - vertical pages first, then industry pages as fallback */}
                <Route path="/:slug" element={<VerticalPage />} />

                {/* 404 fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </BrowserRouter>
            </TooltipProvider>
          </AdminAuthProvider>
        </BrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
  );
};

export default App;
