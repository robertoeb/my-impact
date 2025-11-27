import { Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";

interface SaveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  onReportNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SaveReportDialog({
  open,
  onOpenChange,
  reportName,
  onReportNameChange,
  onSave,
  isSaving,
}: SaveReportDialogProps) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="save-dialog">
        <DialogHeader>
          <DialogTitle>{t("save.title")}</DialogTitle>
          <DialogDescription>{t("save.description")}</DialogDescription>
        </DialogHeader>
        <div className="save-content">
          <div className="setting-item">
            <Label htmlFor="report-name">{t("save.reportName")}</Label>
            <Input
              id="report-name"
              value={reportName}
              onChange={(e) => onReportNameChange(e.target.value)}
              placeholder={t("save.placeholder")}
            />
          </div>
          <Button
            onClick={onSave}
            disabled={!reportName.trim() || isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("save.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("save.saveReport")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

