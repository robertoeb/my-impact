import { FolderOpen, Trash2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import type { SavedReport } from "@/types";
import { formatDateTime } from "@/lib/helpers";

interface ReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: SavedReport[];
  onLoadReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export function ReportsDialog({
  open,
  onOpenChange,
  reports,
  onLoadReport,
  onDeleteReport,
}: ReportsDialogProps) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="reports-dialog">
        <DialogHeader>
          <DialogTitle>{t("reports.title")}</DialogTitle>
          <DialogDescription>{t("reports.description")}</DialogDescription>
        </DialogHeader>
        <div className="reports-list">
          {reports.length === 0 ? (
            <div className="reports-empty">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
              <p>{t("reports.empty")}</p>
              <p className="text-sm text-muted-foreground">
                {t("reports.emptyHint")}
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-info">
                  <h4 className="report-name">{report.name}</h4>
                  <div className="report-meta">
                    <span className="report-org">{report.org_name}</span>
                    <span className="report-date-range">{report.date_range}</span>
                    <span className="report-pr-count">
                      {report.pr_count} {t("reports.prs")}
                    </span>
                  </div>
                  <div className="report-created">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(report.created_at)}
                  </div>
                </div>
                <div className="report-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onLoadReport(report);
                      onOpenChange(false);
                    }}
                  >
                    <FolderOpen className="h-4 w-4" />
                    {t("reports.load")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteReport(report.id)}
                    className="delete-button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

