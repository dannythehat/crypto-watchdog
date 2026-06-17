import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackEvent } from "@/lib/analytics";
import Index from "./pages/Index";
import Reviews from "./pages/Reviews";
import ReviewDetail from "./pages/ReviewDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Warnings from "./pages/Warnings";
import WarningDetail from "./pages/WarningDetail";
import Submit from "./pages/Submit";
import About from "./pages/About";
import Go from "./pages/Go";
import Freebies from "./pages/Freebies";
import News from "./pages/News";
import CategoryHub from "./pages/CategoryHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Sends a GA4 page_view on SPA route changes (initial load is handled by config).
const RouteAnalytics = () => {
  const location = useLocation();
  useEffect(() => {
    trackEvent("page_view", { page_path: location.pathname + location.search });
  }, [location.pathname, location.search]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteAnalytics />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/:slug" element={<ReviewDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/warnings" element={<Warnings />} />
          <Route path="/warnings/:slug" element={<WarningDetail />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/about" element={<About />} />
          <Route path="/freebies" element={<Freebies />} />
          <Route path="/news" element={<News />} />
          <Route path="/go/:id" element={<Go />} />
          {/* Category hub landing pages (clean root slugs, e.g. /ai-finance).
              Static routes above rank higher, so this only catches hub slugs. */}
          <Route path="/:hubSlug" element={<CategoryHub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
