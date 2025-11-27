import { useState, useCallback } from "react";
import type { PullRequest, ReviewedPullRequest } from "@/types";
import * as tauriService from "@/services/tauri";

interface UseGitHubDataReturn {
  pullRequests: PullRequest[];
  reviewedPrs: ReviewedPullRequest[];
  organizations: string[];
  loading: boolean;
  orgsLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  fetchReport: (startDate: string, endDate: string, orgName: string | null) => Promise<void>;
  fetchOrganizations: (startDate: string, endDate: string) => Promise<void>;
  clearError: () => void;
  setPullRequests: (prs: PullRequest[]) => void;
}

export function useGitHubData(): UseGitHubDataReturn {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [reviewedPrs, setReviewedPrs] = useState<ReviewedPullRequest[]>([]);
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchReport = useCallback(async (
    startDate: string,
    endDate: string,
    orgName: string | null
  ) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const [authResult, reviewResult] = await Promise.all([
        tauriService.fetchGitHubActivity(
          startDate,
          endDate,
          orgName === "__all__" ? null : orgName
        ),
        tauriService.fetchReviewedPrs(startDate, endDate),
      ]);

      if (authResult.success && authResult.data) {
        setPullRequests(authResult.data);
      } else {
        setError(authResult.error || "An unknown error occurred");
        setPullRequests([]);
      }

      if (reviewResult.success && reviewResult.data) {
        setReviewedPrs(reviewResult.data);
      } else {
        setReviewedPrs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setPullRequests([]);
      setReviewedPrs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrganizations = useCallback(async (
    startDate: string,
    endDate: string
  ) => {
    setOrgsLoading(true);
    
    try {
      const result = await tauriService.fetchOrganizations(startDate, endDate);
      
      if (result.success && result.organizations) {
        setOrganizations(result.organizations);
      } else {
        console.error("Failed to fetch organizations:", result.error);
        setOrganizations([]);
      }
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setOrganizations([]);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    pullRequests,
    reviewedPrs,
    organizations,
    loading,
    orgsLoading,
    error,
    hasSearched,
    fetchReport,
    fetchOrganizations,
    clearError,
    setPullRequests,
  };
}
