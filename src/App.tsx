import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Nominees from "./pages/Nominees";
import NomineeProfile from "./pages/NomineeProfile";
import CreatorRegistration from "./pages/CreatorRegistration";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorTips from "./pages/CreatorTips";
import CreatorProfile from "./pages/CreatorProfile";
import DashboardRankings from "./pages/DashboardRankings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNominees from "./pages/AdminNominees";
import AdminPayouts from "./pages/AdminPayouts";
import Leaderboard from "./pages/Leaderboard";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import VoteSuccess from "./pages/VoteSuccess";
import PayoutPreferences from "./pages/PayoutPreferences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/nominees" element={<Nominees />} />
          <Route path="/nominee/:id" element={<NomineeProfile />} />
          <Route path="/nominees/:id" element={<NomineeProfile />} />
          <Route path="/creator/register" element={<CreatorRegistration />} />
          <Route path="/dashboard" element={<CreatorDashboard />} />
          <Route path="/dashboard/tips" element={<CreatorTips />} />
          <Route path="/dashboard/profile" element={<CreatorProfile />} />
          <Route path="/dashboard/rankings" element={<DashboardRankings />} />
          <Route path="/dashboard/payout" element={<PayoutPreferences />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/nominees" element={<AdminNominees />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/vote-success" element={<VoteSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
