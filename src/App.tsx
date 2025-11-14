// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { refreshFxRates } from "@/lib/currency";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ValuationPage from "./pages/Valuation";
import InsightsPage from "./pages/Insights";
import CalculatorPage from "./pages/Calculator";
import ContactPage from "./pages/Contact";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProfilePage from "./pages/Profile";
import FeaturesPage from "./pages/Features";
import Predict from "./pages/Predict"; // small debug form we built

const queryClient = new QueryClient();

// simple auth via localStorage
const isAuthenticated = () => {
  try {
    const u = JSON.parse(localStorage.getItem("auth:user") || "null");
    return !!u && !!(u.email || u.name);
  } catch {
    return false;
  }
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  return isAuthenticated() ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default function App() {
  // optional splash (kept, but you can remove if you want)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return localStorage.getItem("splashSeen") !== "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => {
      setShowSplash(false);
      try {
        localStorage.setItem("splashSeen", "true");
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  }, [showSplash]);

  // Refresh FX rates on app start (non-blocking, cached with TTL)
  useEffect(() => {
    refreshFxRates().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {showSplash && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
            <div className="text-4xl md:text-6xl font-bold tracking-wider">Estate Luxe</div>
          </div>
        )}

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/features"
              element={
                <RequireAuth>
                  <FeaturesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/valuation"
              element={
                <RequireAuth>
                  <ValuationPage />
                </RequireAuth>
              }
            />
            <Route
              path="/insights"
              element={
                <RequireAuth>
                  <InsightsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/calculator"
              element={
                <RequireAuth>
                  <CalculatorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/contact"
              element={
                <RequireAuth>
                  <ContactPage />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />

            {/* IMPORTANT ROUTES */}
            <Route
              path="/predict"
              element={
                <RequireAuth>
                  <ValuationPage />
                </RequireAuth>
              }
            />   {/* fancy UI */}
            <Route
              path="/debug-predict"
              element={
                <RequireAuth>
                  <Predict />
                </RequireAuth>
              }
            />    {/* small API tester */}

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
