import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useApp();

  return (
    <header className="app-header">
      <div className="header-top">
        <Button
          variant="ghost"
          size="icon"
          className="menu-button"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="logo-section">
          <div className="logo-icon">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="logo-text">{t("app.name")}</h1>
        </div>

        <div className="header-spacer" />
      </div>
      <p className="header-tagline">{t("app.tagline")}</p>
    </header>
  );
}
