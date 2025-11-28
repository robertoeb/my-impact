import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSettings } from "./useSettings";
import { invoke } from "@tauri-apps/api/core";

vi.mock("@tauri-apps/api/core");

describe("useSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "load_settings") {
        return {
          success: true,
          settings: { api_key: "sk-test-key" },
          error: null,
        };
      }
      if (cmd === "save_settings") {
        return { success: true, error: null };
      }
      throw new Error(`Unknown command: ${cmd}`);
    });
  });

  it("loads settings on mount", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.apiKey).toBe("sk-test-key");
    expect(invoke).toHaveBeenCalledWith("load_settings");
  });

  it("allows setting API key", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setApiKey("new-api-key");
    });

    expect(result.current.apiKey).toBe("new-api-key");
  });

  it("saves settings", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setApiKey("new-key");
    });

    await act(async () => {
      await result.current.saveSettings();
    });

    expect(invoke).toHaveBeenCalledWith("save_settings", { apiKey: "new-key" });
  });

  it("handles load error gracefully", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Load failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles save error", async () => {
    vi.mocked(invoke).mockImplementation(async (cmd: string) => {
      if (cmd === "load_settings") {
        return { success: true, settings: { api_key: "" }, error: null };
      }
      if (cmd === "save_settings") {
        throw new Error("Save failed");
      }
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.saveSettings()).rejects.toThrow("Save failed");
    consoleSpy.mockRestore();
  });

  it("handles empty settings response", async () => {
    vi.mocked(invoke).mockImplementation(async () => ({
      success: true,
      settings: null,
      error: null,
    }));

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.apiKey).toBe("");
  });
});

