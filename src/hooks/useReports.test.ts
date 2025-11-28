import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReports } from "./useReports";
import { invoke } from "@tauri-apps/api/core";
import { mockPullRequest, mockSavedReport } from "@/test/mocks/tauri";

vi.mock("@tauri-apps/api/core");

describe("useReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "load_reports") {
        return { success: true, reports: [mockSavedReport], error: null };
      }
      if (cmd === "save_report") {
        return { success: true, error: null };
      }
      if (cmd === "delete_report") {
        return { success: true, error: null };
      }
      throw new Error(`Unknown command: ${cmd}`);
    });
  });

  it("loads reports on mount", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savedReports).toHaveLength(1);
    expect(result.current.savedReports[0].name).toBe("Q4 2024 Review");
  });

  it("saves a new report", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveReport({
        name: "New Report",
        orgName: "org",
        dateRange: "Nov 1 - Nov 27",
        pullRequests: [mockPullRequest],
        summary: "Summary text",
      });
    });

    expect(invoke).toHaveBeenCalledWith(
      "save_report",
      expect.objectContaining({
        report: expect.objectContaining({
          name: "New Report",
          org_name: "org",
          date_range: "Nov 1 - Nov 27",
          pr_count: 1,
          summary: "Summary text",
        }),
      })
    );
  });

  it("saves report without summary", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveReport({
        name: "Report Without Summary",
        orgName: "org",
        dateRange: "Nov 1 - Nov 27",
        pullRequests: [mockPullRequest],
        summary: null,
      });
    });

    expect(invoke).toHaveBeenCalledWith(
      "save_report",
      expect.objectContaining({
        report: expect.objectContaining({
          summary: "",
        }),
      })
    );
  });

  it("updates existing report", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateReport("report-123", {
        summary: "Updated summary",
      });
    });

    expect(invoke).toHaveBeenCalledWith(
      "save_report",
      expect.objectContaining({
        report: expect.objectContaining({
          id: "report-123",
          summary: "Updated summary",
        }),
      })
    );
  });

  it("throws error when updating non-existent report", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      result.current.updateReport("non-existent-id", { summary: "Updated" })
    ).rejects.toThrow("Report not found");
  });

  it("deletes a report", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.savedReports).toHaveLength(1);
    });

    await act(async () => {
      await result.current.deleteReport("report-123");
    });

    expect(invoke).toHaveBeenCalledWith("delete_report", {
      reportId: "report-123",
    });

    expect(result.current.savedReports).toHaveLength(0);
  });

  it("loads report data", async () => {
    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const loaded = result.current.loadReport(mockSavedReport);

    expect(loaded.id).toBe("report-123");
    expect(loaded.orgName).toBe("org");
    expect(loaded.pullRequests).toHaveLength(1);
    expect(loaded.summary).toBe("Great quarter with significant contributions.");
  });

  it("handles load reports error", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Load failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savedReports).toEqual([]);
    consoleSpy.mockRestore();
  });

  it("handles save error", async () => {
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "load_reports") {
        return { success: true, reports: [], error: null };
      }
      if (cmd === "save_report") {
        return { success: false, error: "Save failed" };
      }
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      result.current.saveReport({
        name: "Test",
        orgName: "org",
        dateRange: "Nov 1 - Nov 27",
        pullRequests: [],
        summary: "",
      })
    ).rejects.toThrow("Save failed");
    consoleSpy.mockRestore();
  });

  it("handles delete error", async () => {
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "load_reports") {
        return { success: true, reports: [mockSavedReport], error: null };
      }
      if (cmd === "delete_report") {
        return { success: false, error: "Delete failed" };
      }
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.deleteReport("report-123")).rejects.toThrow(
      "Delete failed"
    );
    consoleSpy.mockRestore();
  });

  it("returns null summary for report without summary", async () => {
    const reportWithoutSummary = { ...mockSavedReport, summary: "" };
    vi.mocked(invoke).mockResolvedValue({
      success: true,
      reports: [reportWithoutSummary],
      error: null,
    });

    const { result } = renderHook(() => useReports());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const loaded = result.current.loadReport(reportWithoutSummary);
    expect(loaded.summary).toBeNull();
  });
});

