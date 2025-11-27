import type { DateRange } from "@/types";

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMonthName(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getOrgDisplayName(orgName: string | null): string {
  if (!orgName || orgName === "__all__") {
    return "All Organizations";
  }
  return orgName;
}

export const CHART_COLORS = [
  "hsl(160, 84%, 35%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 65%, 55%)",
  "hsl(40, 90%, 50%)",
  "hsl(340, 75%, 55%)",
  "hsl(120, 60%, 45%)",
  "hsl(30, 80%, 55%)",
  "hsl(220, 70%, 55%)",
];

