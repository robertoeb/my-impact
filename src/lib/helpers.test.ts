import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDate,
  formatDateTime,
  getMonthName,
  getDefaultDateRange,
  generateId,
  getOrgDisplayName,
  CHART_COLORS,
} from "./helpers";

describe("formatDate", () => {
  it("formats date string to readable format", () => {
    const result = formatDate("2024-11-15T10:00:00Z");
    expect(result).toMatch(/Nov 15, 2024/);
  });

  it("handles ISO date strings without time", () => {
    const result = formatDate("2024-06-15");
    expect(result).toContain("Jun");
    expect(result).toContain("2024");
  });
});

describe("formatDateTime", () => {
  it("formats date string with time", () => {
    const result = formatDateTime("2024-11-15T10:30:00Z");
    expect(result).toContain("Nov");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});

describe("getMonthName", () => {
  it("returns short month and year", () => {
    const result = getMonthName("2024-11-15T10:00:00Z");
    expect(result).toMatch(/Nov '?24/);
  });

  it("handles different months", () => {
    expect(getMonthName("2024-01-15")).toContain("Jan");
    expect(getMonthName("2024-06-15")).toContain("Jun");
    expect(getMonthName("2024-12-15")).toContain("Dec");
  });
});

describe("getDefaultDateRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-11-27"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns date range with end as today", () => {
    const range = getDefaultDateRange();
    expect(range.end).toBe("2024-11-27");
  });

  it("returns date range with start 6 months ago", () => {
    const range = getDefaultDateRange();
    expect(range.start).toBe("2024-05-27");
  });

  it("returns start and end as ISO date strings", () => {
    const range = getDefaultDateRange();
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("generateId", () => {
  it("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("generates IDs with timestamp prefix", () => {
    const id = generateId();
    const parts = id.split("-");
    expect(parts.length).toBe(2);
    expect(Number(parts[0])).toBeGreaterThan(0);
  });

  it("generates IDs with alphanumeric suffix", () => {
    const id = generateId();
    const suffix = id.split("-")[1];
    expect(suffix).toMatch(/^[a-z0-9]+$/);
  });
});

describe("getOrgDisplayName", () => {
  it("returns 'All Organizations' for null", () => {
    expect(getOrgDisplayName(null)).toBe("All Organizations");
  });

  it("returns 'All Organizations' for __all__", () => {
    expect(getOrgDisplayName("__all__")).toBe("All Organizations");
  });

  it("returns the org name for valid org", () => {
    expect(getOrgDisplayName("my-org")).toBe("my-org");
  });

  it("returns empty string as org name", () => {
    expect(getOrgDisplayName("")).toBe("All Organizations");
  });

  it("returns specific org names unchanged", () => {
    expect(getOrgDisplayName("facebook")).toBe("facebook");
    expect(getOrgDisplayName("google")).toBe("google");
  });
});

describe("CHART_COLORS", () => {
  it("has 8 colors", () => {
    expect(CHART_COLORS).toHaveLength(8);
  });

  it("all colors are HSL format", () => {
    CHART_COLORS.forEach((color) => {
      expect(color).toMatch(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/);
    });
  });

  it("has unique colors", () => {
    const uniqueColors = new Set(CHART_COLORS);
    expect(uniqueColors.size).toBe(CHART_COLORS.length);
  });
});

