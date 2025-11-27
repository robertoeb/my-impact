import { TrendingUp, FileDown, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useReport } from "@/contexts/ReportContext";
import { usePdfExport } from "@/hooks/usePdfExport";

interface FloatingActionsProps {
  onCompareClick: () => void;
  onSaveClick: () => void;
  saving: boolean;
}

export function FloatingActions({
  onCompareClick,
  onSaveClick,
  saving,
}: FloatingActionsProps) {
  const { t } = useApp();
  const {
    pullRequests,
    reviewedPrs,
    aiSummary,
    orgData,
    repoData,
    loadedReportId,
    loadedReportHadSummary,
    updateReport,
    getFormattedOrgName,
    startDate,
    endDate,
  } = useReport();

  const { exporting, exportSuccess, exportPdf } = usePdfExport({
    orgName: getFormattedOrgName(),
    startDate,
    endDate,
    pullRequests,
    reviewedPrs,
    aiSummary,
    orgData,
    repoData,
  });

  const handleUpdateReport = async () => {
    await updateReport();
  };

  const showUpdateButton = loadedReportId && aiSummary && !loadedReportHadSummary;

  return (
    <div className="floating-actions">
      <Button
        variant="outline"
        onClick={onCompareClick}
        className="compare-btn"
      >
        <TrendingUp className="h-4 w-4" />
        {t("compare.button")}
      </Button>

      <Button
        variant="outline"
        onClick={exportPdf}
        disabled={exporting}
        className="export-button"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("export.pdf")}
          </>
        ) : exportSuccess ? (
          <>
            <Check className="h-4 w-4" />
            {t("export.pdf")}
          </>
        ) : (
          <>
            <FileDown className="h-4 w-4" />
            {t("export.pdf")}
          </>
        )}
      </Button>

      {showUpdateButton ? (
        <Button
          onClick={handleUpdateReport}
          disabled={saving}
          className="save-button"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("save.updateReport")}
        </Button>
      ) : (
        <Button onClick={onSaveClick} className="save-button">
          <Save className="h-4 w-4" />
          {t("ai.saveReport")}
        </Button>
      )}
    </div>
  );
}

