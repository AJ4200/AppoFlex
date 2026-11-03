"use client";

import { useEffect, useState } from "react";

const SPLASH_MS = 5000;

type Phase = "checking" | "splash" | "done";

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    setPhase("splash");
    const loader = setTimeout(() => setShowLoader(true), 2500);
    const finish = setTimeout(() => finishSplash(), SPLASH_MS);
    return () => {
      clearTimeout(loader);
      clearTimeout(finish);
    };
  }, []);

  function finishSplash() {
    setPhase("done");
  }

  return (
    <>
      {phase === "splash" && (
        <div className="splash-overlay" onClick={finishSplash} role="presentation">
          <div className="typewriter-container">
            <div className="typewriter">
              <h1>AppoFlex.</h1>
              {showLoader ? <div className="splashloader" /> : null}
            </div>
          </div>
        </div>
      )}
      <div style={{ visibility: phase === "done" ? "visible" : "hidden" }}>{children}</div>
    </>
  );
}
