import { useState, useEffect, useCallback } from "react";
import * as tauriService from "@/services/tauri";

interface UseSettingsReturn {
  apiKey: string;
  setApiKey: (key: string) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
}

export function useSettings(): UseSettingsReturn {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialSettings() {
      try {
        const result = await tauriService.loadSettings();
        if (result.success && result.settings?.api_key) {
          setApiKey(result.settings.api_key);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialSettings();
  }, []);

  const saveSettings = useCallback(async () => {
    try {
      await tauriService.saveSettings(apiKey);
    } catch (err) {
      console.error("Failed to save settings:", err);
      throw err;
    }
  }, [apiKey]);

  return {
    apiKey,
    setApiKey,
    saveSettings,
    isLoading,
  };
}

