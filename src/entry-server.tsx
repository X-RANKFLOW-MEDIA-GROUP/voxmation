/* eslint-disable react-refresh/only-export-components */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Eager imports: renderToString does not resolve React.lazy/Suspense, so the
// server tree must reference real components (the client App stays lazy).
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import HowItWorksPage from "./pages/HowItWorks";
import MissedCallRecovery from "./pages/MissedCallRecovery";
import Services from "./pages/Services";
import About from "./pages/About";
import MissedCallRoiCalculator from "./pages/MissedCallRoiCalculator";
import IndustryReceptionistPage from "./pages/IndustryReceptionistPage";
import ComparePage from "./pages/ComparePage";
import AlternativePage from "./pages/AlternativePage";
import Pricing from "./pages/Pricing";
import ROICalculator from "./pages/ROICalculator";
import UseCases from "./pages/UseCases";
import Industries from "./pages/Industries";
import CaseStudies from "./pages/CaseStudies";
import UseCaseDetail from "./pages/UseCaseDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import VerticalPage from "./pages/VerticalPage";
import StateVerticalPage from "./pages/StateVerticalPage";
import ComparisonPage from "./pages/ComparisonPage";
import ResourcePage from "./pages/ResourcePage";
import NotFound from "./pages/NotFound";

import { blogPosts } from "./data/blogPosts";
import { useCasesData } from "./data/useCases";
import { comparisonsData, resourcesData } from "./data/seoData";
import { industryReceptionists, compareData, alternativesData } from "./data/seoExpansion";

// Every indexable route to prerender. Dynamic slugs are derived from the same
// data the pages render from, so this list stays in sync automatically.
export const prerenderUrls: string[] = [
  "/",
  "/demo",
  "/how-it-works",
  "/missed-call-recovery",
  "/services",
  "/about",
  "/pricing",
  "/roi-calculator",
  "/tools/missed-call-roi-calculator",
  "/contact",
  "/use-cases",
  "/industries",
  "/case-studies",
  "/blog",
  ...Object.keys(blogPosts).map((s) => `/blog/${s}`),
  ...Object.keys(useCasesData).map((s) => `/use-cases/${s}`),
  ...Object.keys(industryReceptionists).map((s) => `/industries/${s}`),
  ...Object.keys(compareData).map((s) => `/compare/${s}`),
  ...Object.keys(alternativesData).map((s) => `/alternatives/${s}`),
  ...Object.keys(comparisonsData).map((s) => `/vs-${s}`),
  ...Object.keys(resourcesData).map((s) => `/resources/${s}`),
];

const queryClient = new QueryClient();

function ServerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
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
      <Route path="/vs-:slug" element={<ComparisonPage />} />
      <Route path="/compare/:slug" element={<ComparePage />} />
      <Route path="/alternatives/:slug" element={<AlternativePage />} />
      <Route path="/industries/:slug" element={<IndustryReceptionistPage />} />
      <Route path="/resources/:slug" element={<ResourcePage />} />
      <Route path="/:vertical/:state" element={<StateVerticalPage />} />
      <Route path="/:slug" element={<VerticalPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function render(url: string): { html: string; helmet: HelmetServerState | undefined } {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <StaticRouter location={url}>
              <ServerRoutes />
            </StaticRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
  return { html, helmet: helmetContext.helmet };
}
