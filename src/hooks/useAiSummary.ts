import { useState, useCallback } from "react";
import type { PullRequest } from "@/types";
import * as tauriService from "@/services/tauri";

interface UseAiSummaryReturn {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  generateSummary: (params: GenerateSummaryParams) => Promise<void>;
  setSummary: (summary: string | null) => void;
  clearError: () => void;
}

interface GenerateSummaryParams {
  apiKey: string;
  pullRequests: PullRequest[];
  dateRange: string;
  orgName: string;
}

export function useAiSummary(): UseAiSummaryReturn {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async (params: GenerateSummaryParams) => {
    if (!params.apiKey) {
      setError("Please configure your OpenAI API key in settings");
      return;
    }

    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const result = await tauriService.generateAiSummary(
        params.apiKey,
        params.pullRequests,
        params.dateRange,
        params.orgName
      );

      if (result.success && result.summary) {
        setSummary(result.summary);
      } else {
        setError(result.error || "Failed to generate summary");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    summary,
    isLoading,
    error,
    generateSummary,
    setSummary,
    clearError,
  };
}

