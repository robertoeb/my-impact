import { Sparkles, FolderOpen, Settings, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedReportsCount: number;
  onOpenReports: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export function Sidebar({
  open,
  onOpenChange,
  savedReportsCount,
  onOpenReports,
  onOpenSettings,
  onOpenAbout,
}: SidebarProps) {
  const { t } = useApp();

  const handleAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="menu-sheet">
        <SheetHeader>
          <SheetTitle className="menu-title">
            <div className="menu-logo">
              <Sparkles className="h-5 w-5" />
            </div>
            {t("app.name")}
          </SheetTitle>
          <SheetDescription>{t("about.description")}</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <nav className="menu-nav">
          <button
            className="menu-item"
            onClick={() => handleAction(onOpenReports)}
          >
            <FolderOpen className="h-4 w-4" />
            {t("menu.savedReports")}
            {savedReportsCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {savedReportsCount}
              </Badge>
            )}
          </button>
        </nav>

        <Separator className="my-4" />

        <nav className="menu-nav">
          <button
            className="menu-item"
            onClick={() => handleAction(onOpenSettings)}
          >
            <Settings className="h-4 w-4" />
            {t("menu.settings")}
          </button>
          <button
            className="menu-item"
            onClick={() => handleAction(onOpenAbout)}
          >
            <Info className="h-4 w-4" />
            {t("menu.about")}
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
