import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AIProvider } from "@/lib/aiStore";
import { CommandPalette } from "@/components/os/CommandPalette";
import { AICopilot } from "@/components/os/AICopilot";
import { DepartmentActivation } from "@/components/os/DepartmentActivation";
import { Onboarding } from "@/components/os/Onboarding";
import { AssignWork as AssignWorkFAB } from "@/components/os/AssignWork";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import Dashboard from "@/pages/Dashboard";
import Departments from "@/pages/Departments";
import DepartmentDetail from "@/pages/DepartmentDetail";
import Inbox from "@/pages/Inbox";
import Automation from "@/pages/Automation";
import Integrations from "@/pages/Integrations";
import Knowledge from "@/pages/Knowledge";
import Analytics from "@/pages/Analytics";
import AIWorkforce from "@/pages/AIWorkforce";
import ActivityFeed from "@/pages/ActivityFeed";
import Marketplace from "@/pages/Marketplace";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate("/auth")} />} />
        <Route path="/auth" element={<AuthPage onComplete={() => navigate("/onboarding")} />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/departments/:id" element={<DepartmentDetail />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/workforce" element={<AIWorkforce />} />
        <Route path="/activity" element={<ActivityFeed />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AIProvider>
      <BrowserRouter>
        <AppRoutes />
        <CommandPalette />
        <AICopilot />
        <DepartmentActivation />
        <Onboarding />
        <AssignWorkFAB />
      </BrowserRouter>
    </AIProvider>
  );
}