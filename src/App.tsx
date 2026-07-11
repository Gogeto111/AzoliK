import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AIProvider } from "@/lib/aiStore";
import { CommandPalette } from "@/components/os/CommandPalette";
import { AICopilot } from "@/components/os/AICopilot";
import { DepartmentActivation } from "@/components/os/DepartmentActivation";
import { Onboarding } from "@/components/os/Onboarding";
import { AssignWork as AssignWorkFAB } from "@/components/os/AssignWork";
import Dashboard from "@/pages/Dashboard";
import Departments from "@/pages/Departments";
import DepartmentDetail from "@/pages/DepartmentDetail";
import Automation from "@/pages/Automation";
import Integrations from "@/pages/Integrations";
import Analytics from "@/pages/Analytics";
import Marketplace from "@/pages/Marketplace";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <AIProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/departments/:id" element={<DepartmentDetail />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <CommandPalette />
        <AICopilot />
        <DepartmentActivation />
        <Onboarding />
        <AssignWorkFAB />
      </BrowserRouter>
    </AIProvider>
  );
}
