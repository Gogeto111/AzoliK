import { StrictMode, useState, useEffect } from "react";
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
    <Root />
  </StrictMode>
);
