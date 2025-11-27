import { useState, useEffect, useCallback } from "react";
import type { SavedReport, PullRequest } from "@/types";
import { generateId } from "@/lib/helpers";
import * as tauriService from "@/services/tauri";

interface UseReportsReturn {
  savedReports: SavedReport[];
  isLoading: boolean;
  saveReport: (params: SaveReportParams) => Promise<void>;
  updateReport: (reportId: string, params: UpdateReportParams) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  loadReport: (report: SavedReport) => LoadedReportData;
}

interface SaveReportParams {
  name: string;
  orgName: string;
  dateRange: string;
  pullRequests: PullRequest[];
  summary?: string | null;
}

interface UpdateReportParams {
  summary?: string | null;
}

interface LoadedReportData {
  id: string;
  orgName: string;
  pullRequests: PullRequest[];
  summary: string | null;
}

export function useReports(): UseReportsReturn {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialReports() {
      try {
        const result = await tauriService.loadReports();
        if (result.success && result.reports) {
          setSavedReports(result.reports);
        }
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialReports();
  }, []);

  const saveReport = useCallback(async (params: SaveReportParams) => {
    const report: SavedReport = {
      id: generateId(),
      name: params.name,
      created_at: new Date().toISOString(),
      org_name: params.orgName,
      date_range: params.dateRange,
      pr_count: params.pullRequests.length,
      summary: params.summary || "",
      pull_requests: params.pullRequests,
    };

    try {
      const result = await tauriService.saveReport(report);
      if (result.success) {
        setSavedReports((prev) => [report, ...prev]);
      } else {
        throw new Error(result.error || "Failed to save report");
      }
    } catch (err) {
      console.error("Failed to save report:", err);
      throw err;
    }
  }, []);

  const updateReport = useCallback(async (reportId: string, params: UpdateReportParams) => {
    const existingReport = savedReports.find((r) => r.id === reportId);
    if (!existingReport) {
      throw new Error("Report not found");
    }

    const updatedReport: SavedReport = {
      ...existingReport,
      summary: params.summary ?? existingReport.summary,
    };

    try {
      const result = await tauriService.saveReport(updatedReport);
      if (result.success) {
        setSavedReports((prev) =>
          prev.map((r) => (r.id === reportId ? updatedReport : r))
        );
      } else {
        throw new Error(result.error || "Failed to update report");
      }
    } catch (err) {
      console.error("Failed to update report:", err);
      throw err;
    }
  }, [savedReports]);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      const result = await tauriService.deleteReport(reportId);
      if (result.success) {
        setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        throw new Error(result.error || "Failed to delete report");
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
      throw err;
    }
  }, []);

  const loadReport = useCallback((report: SavedReport): LoadedReportData => {
    return {
      id: report.id,
      orgName: report.org_name,
      pullRequests: report.pull_requests,
      summary: report.summary || null,
    };
  }, []);

  return {
    savedReports,
    isLoading,
    saveReport,
    updateReport,
    deleteReport,
    loadReport,
  };
}

