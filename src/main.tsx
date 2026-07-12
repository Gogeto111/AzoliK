import { StrictMode, useState, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BootSplash } from "@/components/effects/BootSplash";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed silently
    });
  });
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#07080c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui" }}>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>{this.state.error.message}</p>
            <button onClick={() => window.location.reload()} style={{ padding: "8px 24px", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontSize: 14 }}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Root() {
  const [booted, setBooted] = useState(false);
  return (
    <>
      <AnimatePresence>{!booted && <BootSplash onDone={() => setBooted(true)} />}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={booted ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(12px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </motion.div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>
);
