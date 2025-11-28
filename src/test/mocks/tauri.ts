import { vi } from "vitest";
import type {
  PullRequest,
  ReviewedPullRequest,
  SavedReport,
  FetchResult,
  AiResult,
  OrganizationsResult,
  SaveResult,
  LoadSettingsResult,
  LoadReportsResult,
  ReviewedResult,
} from "@/types";

export const mockPullRequest: PullRequest = {
  title: "Add new feature",
  url: "https://github.com/org/repo/pull/1",
  body: "This PR adds a new feature",
  closedAt: "2024-11-15T10:00:00Z",
  createdAt: "2024-11-14T08:00:00Z",
  number: 1,
  repository: {
    name: "repo",
    nameWithOwner: "org/repo",
  },
};

export const mockReviewedPr: ReviewedPullRequest = {
  title: "Fix bug in login",
  url: "https://github.com/org/repo/pull/2",
  closedAt: "2024-11-15T12:00:00Z",
  createdAt: "2024-11-13T09:00:00Z",
  author: { login: "teammate" },
  repository: {
    name: "repo",
    nameWithOwner: "org/repo",
  },
};

export const mockSavedReport: SavedReport = {
  id: "report-123",
  name: "Q4 2024 Review",
  created_at: "2024-11-27T10:00:00Z",
  org_name: "org",
  date_range: "Nov 1, 2024 - Nov 27, 2024",
  pr_count: 10,
  summary: "Great quarter with significant contributions.",
  pull_requests: [mockPullRequest],
};

export const createMockFetchResult = (
  prs: PullRequest[] = [mockPullRequest]
): FetchResult => ({
  success: true,
  data: prs,
  error: null,
});

export const createMockReviewedResult = (
  prs: ReviewedPullRequest[] = [mockReviewedPr]
): ReviewedResult => ({
  success: true,
  data: prs,
  error: null,
});

export const createMockOrgsResult = (
  orgs: string[] = ["org1", "org2"]
): OrganizationsResult => ({
  success: true,
  organizations: orgs,
  error: null,
});

export const createMockAiResult = (
  summary: string = "AI generated summary"
): AiResult => ({
  success: true,
  summary,
  error: null,
});

export const createMockSaveResult = (): SaveResult => ({
  success: true,
  error: null,
});

export const createMockLoadSettingsResult = (
  apiKey: string | null = "sk-test-key"
): LoadSettingsResult => ({
  success: true,
  settings: { api_key: apiKey },
  error: null,
});

export const createMockLoadReportsResult = (
  reports: SavedReport[] = [mockSavedReport]
): LoadReportsResult => ({
  success: true,
  reports,
  error: null,
});

export async function setupTauriMocks() {
  const { invoke } = await import("@tauri-apps/api/core");
  const mockedInvoke = vi.mocked(invoke);

  mockedInvoke.mockImplementation(async (cmd: string) => {
    switch (cmd) {
      case "fetch_github_activity":
        return createMockFetchResult();
      case "fetch_reviewed_prs":
        return createMockReviewedResult();
      case "fetch_organizations":
        return createMockOrgsResult();
      case "generate_ai_summary":
        return createMockAiResult();
      case "save_settings":
        return createMockSaveResult();
      case "load_settings":
        return createMockLoadSettingsResult();
      case "save_report":
        return createMockSaveResult();
      case "load_reports":
        return createMockLoadReportsResult();
      case "delete_report":
        return createMockSaveResult();
      default:
        throw new Error(`Unknown command: ${cmd}`);
    }
  });

  return { invoke: mockedInvoke };
}

