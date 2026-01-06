import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { ScrollGradient } from "./components/ScrollGradient";
import { AnimatePresence } from "framer-motion";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import RulesPage from "@/pages/RulesPage";
import FinancePage from "@/pages/FinancePage";
import ContactPage from "@/pages/ContactPage";
import GuestPage from "@/pages/GuestPage";
import Guest2Page from "@/pages/Guest2Page";
import BoardPage from "@/pages/BoardPage";
import GuestStatusPage from "@/pages/GuestStatusPage";
import TeamStatusPage from "@/pages/TeamStatusPage";
import MainTeamPage from "@/pages/MainTeamPage";
import LoginPage from "@/pages/LoginPage";
import AdminNewPostPage from "@/pages/AdminNewPostPage";
import AdminEditPostPage from "@/pages/AdminEditPostPage";
import NotFound from "@/pages/not-found";

function AppRouter() {
  // Base path 설정: 환경 변수로 제어, 기본값은 빈 문자열 (커스텀 도메인/Vercel용)
  const basePath = import.meta.env.VITE_BASE_PATH || '';
  
  return (
    <AuthProvider>
      <NavigationProvider>
        <Router base={basePath}>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="sync" initial={false}>
                <Switch>
                <Route path="/" component={() => (
                  <PageTransition key="/">
                    <HomePage />
                  </PageTransition>
                )} />
                <Route path="/about" component={() => (
                  <PageTransition key="/about">
                    <AboutPage />
                  </PageTransition>
                )} />
                <Route path="/rules" component={() => (
                  <PageTransition key="/rules">
                    <RulesPage />
                  </PageTransition>
                )} />
                <Route path="/finance" component={() => (
                  <PageTransition key="/finance">
                    <FinancePage />
                  </PageTransition>
                )} />
                <Route path="/contact" component={() => (
                  <PageTransition key="/contact">
                    <ContactPage />
                  </PageTransition>
                )} />
                <Route path="/guest" component={() => (
                  <PageTransition key="/guest">
                    <GuestPage />
                  </PageTransition>
                )} />
                <Route path="/guest2" component={() => (
                  <PageTransition key="/guest2">
                    <Guest2Page />
                  </PageTransition>
                )} />
                <Route path="/board" component={() => (
                  <PageTransition key="/board">
                    <BoardPage />
                  </PageTransition>
                )} />
                <Route path="/guest-status" component={() => (
                  <PageTransition key="/guest-status">
                    <GuestStatusPage />
                  </PageTransition>
                )} />
                <Route path="/team-status" component={() => (
                  <PageTransition key="/team-status">
                    <TeamStatusPage />
                  </PageTransition>
                )} />
                <Route path="/mainteam" component={() => (
                  <PageTransition key="/mainteam">
                    <MainTeamPage />
                  </PageTransition>
                )} />
                <Route path="/login" component={() => (
                  <PageTransition key="/login">
                    <LoginPage />
                  </PageTransition>
                )} />
                <Route path="/admin/new-post" component={() => (
                  <PageTransition key="/admin/new-post">
                    <AdminNewPostPage />
                  </PageTransition>
                )} />
                <Route path="/admin/edit/:id" component={() => (
                  <PageTransition key="/admin/edit">
                    <AdminEditPostPage />
                  </PageTransition>
                )} />
                <Route component={() => (
                  <PageTransition key="404">
                    <NotFound />
                  </PageTransition>
                )} />
              </Switch>
            </AnimatePresence>
          </main>
        </div>
        </Router>
      </NavigationProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatedBackground />
        <ScrollGradient />
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
