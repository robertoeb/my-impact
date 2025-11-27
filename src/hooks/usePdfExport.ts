import { useState, useCallback } from "react";
import type { PullRequest, ReviewedPullRequest, ChartDataPoint } from "@/types";
import { formatDate } from "@/lib/helpers";

interface UsePdfExportParams {
  orgName: string;
  startDate: string;
  endDate: string;
  pullRequests: PullRequest[];
  reviewedPrs: ReviewedPullRequest[];
  aiSummary: string | null;
  orgData: ChartDataPoint[];
  repoData: ChartDataPoint[];
}

interface UsePdfExportReturn {
  exporting: boolean;
  exportSuccess: boolean;
  exportPdf: () => Promise<void>;
}

export function usePdfExport({
  orgName,
  startDate,
  endDate,
  pullRequests,
  reviewedPrs,
  aiSummary,
  orgData,
  repoData,
}: UsePdfExportParams): UsePdfExportReturn {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportPdf = useCallback(async () => {
    setExporting(true);
    setExportSuccess(false);

    // Allow React to render the loading state before starting the export
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Create a temporary container for the PDF content
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; line-height: 1.6; color: #1a1a1a; max-width: 800px;">
        <h1 style="color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 8px; font-size: 28px; margin-top: 0;">
          ✨ MyImpact Performance Report
        </h1>
        <p style="color: #666; margin-bottom: 24px; font-size: 13px;">
          <strong>Organization:</strong> ${orgName} •
          <strong>Period:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}
        </p>
        
        <h2 style="color: #333; margin-top: 28px; margin-bottom: 12px; font-size: 18px;">📊 Summary Statistics</h2>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0;">
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); padding: 16px 20px; border-radius: 10px; border: 1px solid #d1fae5; flex: 1; min-width: 120px;">
            <div style="font-size: 28px; font-weight: 700; color: #10b981;">${pullRequests.length}</div>
            <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">PRs Merged</div>
          </div>
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); padding: 16px 20px; border-radius: 10px; border: 1px solid #d1fae5; flex: 1; min-width: 120px;">
            <div style="font-size: 28px; font-weight: 700; color: #10b981;">${reviewedPrs.length}</div>
            <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">PRs Reviewed</div>
          </div>
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); padding: 16px 20px; border-radius: 10px; border: 1px solid #d1fae5; flex: 1; min-width: 120px;">
            <div style="font-size: 28px; font-weight: 700; color: #10b981;">${orgData.length}</div>
            <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Organizations</div>
          </div>
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); padding: 16px 20px; border-radius: 10px; border: 1px solid #d1fae5; flex: 1; min-width: 120px;">
            <div style="font-size: 28px; font-weight: 700; color: #10b981;">${repoData.length}</div>
            <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Repositories</div>
          </div>
        </div>
        
        ${
          aiSummary
            ? `
        <h2 style="color: #333; margin-top: 28px; margin-bottom: 12px; font-size: 18px;">🤖 AI-Generated Summary</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; white-space: pre-wrap; font-size: 13px; line-height: 1.7;">${aiSummary}</div>
        `
            : ""
        }
        
        <h2 style="color: #333; margin-top: 28px; margin-bottom: 12px; font-size: 18px;">🔀 Pull Requests (${pullRequests.length})</h2>
        <div style="margin-top: 12px;">
          ${pullRequests
            .slice(0, 50)
            .map(
              (pr) => `
          <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; color: #1a1a1a; font-size: 13px;">${pr.title}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${pr.repository.nameWithOwner} • Merged ${formatDate(pr.closedAt)}</div>
          </div>`
            )
            .join("")}
          ${
            pullRequests.length > 50
              ? `<p style="color: #6b7280; font-style: italic; padding-top: 12px; font-size: 12px;">... and ${pullRequests.length - 50} more PRs</p>`
              : ""
          }
        </div>
        
        ${
          reviewedPrs.length > 0
            ? `
        <h2 style="color: #333; margin-top: 28px; margin-bottom: 12px; font-size: 18px;">👀 PRs Reviewed (${reviewedPrs.length})</h2>
        <div style="margin-top: 12px;">
          ${reviewedPrs
            .slice(0, 30)
            .map(
              (pr) => `
          <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; color: #1a1a1a; font-size: 13px;">${pr.title}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${pr.repository.nameWithOwner} • Author: @${pr.author.login}</div>
          </div>`
            )
            .join("")}
          ${
            reviewedPrs.length > 30
              ? `<p style="color: #6b7280; font-style: italic; padding-top: 12px; font-size: 12px;">... and ${reviewedPrs.length - 30} more PRs reviewed</p>`
              : ""
          }
        </div>
        `
            : ""
        }
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">
          Generated by <strong>MyImpact</strong> • ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    `;

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeFile } = await import("@tauri-apps/plugin-fs");

      const safeOrgName = orgName.toLowerCase().replace(/\s+/g, "-");
      const defaultFileName = `myimpact-report-${safeOrgName}-${startDate}-to-${endDate}.pdf`;

      const filePath = await save({
        defaultPath: defaultFileName,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });

      if (filePath) {
        // Generate PDF as blob
        const pdfBlob = await html2pdf()
          .set({
            margin: [10, 10, 10, 10],
            filename: defaultFileName,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .from(container)
          .outputPdf("blob");

        // Convert blob to Uint8Array
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        await writeFile(filePath, uint8Array);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setExporting(false);
    }
  }, [orgName, startDate, endDate, pullRequests, reviewedPrs, aiSummary, orgData, repoData]);

  return {
    exporting,
    exportSuccess,
    exportPdf,
  };
}

