import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGitHubData } from "./useGitHubData";
import { invoke } from "@tauri-apps/api/core";
import { mockPullRequest, mockReviewedPr } from "@/test/mocks/tauri";

vi.mock("@tauri-apps/api/core");

describe("useGitHubData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "fetch_github_activity") {
        return { success: true, data: [mockPullRequest], error: null };
      }
      if (cmd === "fetch_reviewed_prs") {
        return { success: true, data: [mockReviewedPr], error: null };
      }
      if (cmd === "fetch_organizations") {
        return { success: true, organizations: ["org1", "org2"], error: null };
      }
      throw new Error(`Unknown command: ${cmd}`);
    });
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useGitHubData());

    expect(result.current.pullRequests).toEqual([]);
    expect(result.current.reviewedPrs).toEqual([]);
    expect(result.current.organizations).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasSearched).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("fetches report data", async () => {
    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchReport("2024-01-01", "2024-06-01", null);
    });

    await waitFor(() => {
      expect(result.current.pullRequests).toHaveLength(1);
      expect(result.current.reviewedPrs).toHaveLength(1);
      expect(result.current.hasSearched).toBe(true);
    });
  });

  it("sets loading state during fetch", async () => {
    vi.mocked(invoke).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ success: true, data: [], error: null }),
            100
          )
        )
    );

    const { result } = renderHook(() => useGitHubData());

    act(() => {
      result.current.fetchReport("2024-01-01", "2024-06-01", null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it("fetches with organization filter", async () => {
    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchReport("2024-01-01", "2024-06-01", "my-org");
    });

    expect(invoke).toHaveBeenCalledWith("fetch_github_activity", {
      startDate: "2024-01-01",
      endDate: "2024-06-01",
      orgName: "my-org",
    });
  });

  it("handles __all__ org filter as null", async () => {
    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchReport("2024-01-01", "2024-06-01", "__all__");
    });

    expect(invoke).toHaveBeenCalledWith("fetch_github_activity", {
      startDate: "2024-01-01",
      endDate: "2024-06-01",
      orgName: null,
    });
  });

  it("handles fetch error", async () => {
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "fetch_github_activity") {
        return {
          success: false,
          data: null,
          error: "GitHub CLI not found",
        };
      }
      if (cmd === "fetch_reviewed_prs") {
        return { success: true, data: [], error: null };
      }
    });

    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchReport("2024-01-01", "2024-06-01", null);
    });

    expect(result.current.error).toBe("GitHub CLI not found");
    expect(result.current.pullRequests).toEqual([]);
  });

  it("handles network error", async () => {
    vi.mocked(invoke).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchReport("2024-01-01", "2024-06-01", null);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("fetches organizations", async () => {
    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchOrganizations("2024-01-01", "2024-06-01");
    });

    await waitFor(() => {
      expect(result.current.organizations).toEqual(["org1", "org2"]);
    });
  });

  it("handles organizations fetch error", async () => {
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "fetch_organizations") {
        return { success: false, organizations: null, error: "Error" };
      }
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchOrganizations("2024-01-01", "2024-06-01");
    });

    expect(result.current.organizations).toEqual([]);
    consoleSpy.mockRestore();
  });

  it("clears error", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Error"));

    const { result } = renderHook(() => useGitHubData());

    await act(async () => {
      await result.current.fetchReport("2024-01-01", "2024-06-01", null);
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("allows setting pull requests manually", () => {
    const { result } = renderHook(() => useGitHubData());

    act(() => {
      result.current.setPullRequests([mockPullRequest, mockPullRequest]);
    });

    expect(result.current.pullRequests).toHaveLength(2);
  });
});

