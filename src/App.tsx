import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AIProvider } from "@/lib/aiStore";
import { CommandPalette } from "@/components/os/CommandPalette";
import { AICopilot } from "@/components/os/AICopilot";
import { DepartmentActivation } from "@/components/os/DepartmentActivation";
import { Onboarding } from "@/components/os/Onboarding";
import { AssignWork as AssignWorkFAB } from "@/components/os/AssignWork";
import { LandingPage } from "@/pages/LandingPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import Dashboard from "@/pages/Dashboard";
import Departments from "@/pages/Departments";
import Inbox from "@/pages/Inbox";
import Automation from "@/pages/Automation";
import Analytics from "@/pages/Analytics";

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate("/dashboard")} />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
