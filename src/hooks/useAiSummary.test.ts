import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAiSummary } from "./useAiSummary";
import { invoke } from "@tauri-apps/api/core";
import { mockPullRequest } from "@/test/mocks/tauri";

vi.mock("@tauri-apps/api/core");

describe("useAiSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoke).mockResolvedValue({
      success: true,
      summary: "AI generated summary content",
      error: null,
    });
  });

  it("initializes with null summary", () => {
    const { result } = renderHook(() => useAiSummary());

    expect(result.current.summary).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("generates summary successfully", async () => {
    const { result } = renderHook(() => useAiSummary());

    await act(async () => {
      await result.current.generateSummary({
        apiKey: "sk-test",
        pullRequests: [mockPullRequest],
        dateRange: "Nov 1 - Nov 27",
        orgName: "org",
      });
    });

    await waitFor(() => {
      expect(result.current.summary).toBe("AI generated summary content");
    });
  });

  it("sets loading state during generation", async () => {
    vi.mocked(invoke).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useAiSummary());

    act(() => {
      result.current.generateSummary({
        apiKey: "sk-test",
        pullRequests: [mockPullRequest],
        dateRange: "Nov 1 - Nov 27",
        orgName: "org",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
  });

  it("handles missing API key", async () => {
    const { result } = renderHook(() => useAiSummary());

    await act(async () => {
      await result.current.generateSummary({
        apiKey: "",
        pullRequests: [mockPullRequest],
        dateRange: "Nov 1 - Nov 27",
        orgName: "org",
      });
    });

    expect(result.current.error).toBe(
      "Please configure your OpenAI API key in settings"
    );
    expect(result.current.summary).toBeNull();
  });

  it("handles API error", async () => {
    vi.mocked(invoke).mockResolvedValue({
      success: false,
      summary: null,
      error: "API rate limit exceeded",
    });

    const { result } = renderHook(() => useAiSummary());

    await act(async () => {
      await result.current.generateSummary({
        apiKey: "sk-test",
        pullRequests: [mockPullRequest],
        dateRange: "Nov 1 - Nov 27",
        orgName: "org",
      });
    });

    expect(result.current.error).toBe("API rate limit exceeded");
  });

  it("handles network error", async () => {
    vi.mocked(invoke).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAiSummary());

    await act(async () => {
      await result.current.generateSummary({
        apiKey: "sk-test",
        pullRequests: [mockPullRequest],
        dateRange: "Nov 1 - Nov 27",
        orgName: "org",
      });
    });

    expect(result.current.error).toBe("Network error");
  });

  it("allows setting summary manually", () => {
    const { result } = renderHook(() => useAiSummary());

    act(() => {
      result.current.setSummary("Manual summary");
    });

    expect(result.current.summary).toBe("Manual summary");
  });

  it("allows clearing summary", () => {
    const { result } = renderHook(() => useAiSummary());

    act(() => {
      result.current.setSummary("Some summary");
    });

    act(() => {
      result.current.setSummary(null);
    });

    expect(result.current.summary).toBeNull();
  });

  it("clears error", () => {
    const { result } = renderHook(() => useAiSummary());

    act(() => {
      result.current.generateSummary({
        apiKey: "",
        pullRequests: [],
        dateRange: "",
        orgName: "",
      });
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
