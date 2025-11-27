import { useState, useEffect } from "react";

type Platform = "macos" | "windows" | "linux";

export function Titlebar() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>("windows");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac") || ua.includes("darwin")) {
      setCurrentPlatform("macos");
    } else if (ua.includes("win")) {
      setCurrentPlatform("windows");
    } else {
      setCurrentPlatform("linux");
    }
  }, []);

  const isMac = currentPlatform === "macos";

  if (isMac) {
    return (
      <div className="titlebar mac">
        <div className="titlebar-drag-region" data-tauri-drag-region />
        <div className="titlebar-traffic-light-space" />
        <div className="titlebar-content">
          <span className="titlebar-title">MyImpact</span>
        </div>
      </div>
    );
  }

  return (
    <div className="titlebar windows">
      <div className="titlebar-drag-region" data-tauri-drag-region />
      <div className="titlebar-content">
        <span className="titlebar-title">MyImpact</span>
      </div>
    </div>
  );
}
