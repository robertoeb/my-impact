import { invoke } from "@tauri-apps/api/core";
import type {
  FetchResult,
  AiResult,
  OrganizationsResult,
  SaveResult,
  LoadSettingsResult,
  LoadReportsResult,
  SavedReport,
  PullRequest,
  ReviewedResult,
} from "@/types";

export async function fetchGitHubActivity(
  startDate: string,
  endDate: string,
  orgName: string | null
): Promise<FetchResult> {
  return invoke<FetchResult>("fetch_github_activity", {
    startDate,
    endDate,
    orgName,
  });
}

export async function fetchOrganizations(
  startDate: string,
  endDate: string
): Promise<OrganizationsResult> {
  return invoke<OrganizationsResult>("fetch_organizations", {
    startDate,
    endDate,
  });
}

export async function fetchReviewedPrs(
  startDate: string,
  endDate: string
): Promise<ReviewedResult> {
  return invoke<ReviewedResult>("fetch_reviewed_prs", {
    startDate,
    endDate,
  });
}

export async function generateAiSummary(
  apiKey: string,
  prs: PullRequest[],
  dateRange: string,
  orgName: string
): Promise<AiResult> {
  return invoke<AiResult>("generate_ai_summary", {
    apiKey,
    prs,
    dateRange,
    orgName,
  });
}

export async function loadSettings(): Promise<LoadSettingsResult> {
  return invoke<LoadSettingsResult>("load_settings");
}

export async function saveSettings(apiKey: string): Promise<SaveResult> {
  return invoke<SaveResult>("save_settings", { apiKey });
}

export async function loadReports(): Promise<LoadReportsResult> {
  return invoke<LoadReportsResult>("load_reports");
}

export async function saveReport(report: SavedReport): Promise<SaveResult> {
  return invoke<SaveResult>("save_report", { report });
}

export async function deleteReport(reportId: string): Promise<SaveResult> {
  return invoke<SaveResult>("delete_report", { reportId });
}

