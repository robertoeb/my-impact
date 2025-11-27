import { useState } from "react";
import { Sun, Moon, Monitor, Languages, Loader2, Check } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, localeNames, type Locale } from "@/contexts/AppContext";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSave: () => Promise<void>;
}

export function SettingsDialog({
  open,
  onOpenChange,
  apiKey,
  onApiKeyChange,
  onSave,
}: SettingsDialogProps) {
  const { t, theme, setTheme, locale, setLocale } = useApp();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="settings-dialog">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription>{t("settings.description")}</DialogDescription>
        </DialogHeader>
        <div className="settings-content">
          <div className="setting-item">
            <Label className="setting-label-row">
              <Sun className="h-4 w-4" />
              {t("settings.theme")}
            </Label>
            <div className="theme-options">
              <button
                className={`theme-option ${theme === "system" ? "active" : ""}`}
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-4 w-4" />
                {t("settings.themeSystem")}
              </button>
              <button
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
                {t("settings.themeLight")}
              </button>
              <button
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
                {t("settings.themeDark")}
              </button>
            </div>
          </div>

          <div className="setting-item">
            <Label className="setting-label-row">
              <Languages className="h-4 w-4" />
              {t("settings.language")}
            </Label>
            <Select
              value={locale}
              onValueChange={(v) => setLocale(v as Locale)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(localeNames) as Locale[]).map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {localeNames[loc]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-2" />

          <div className="setting-item">
            <Label htmlFor="api-key">{t("settings.apiKey")}</Label>
            <div className="api-key-input-group">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sk-..."
              />
              <Button 
                onClick={handleSave} 
                disabled={saving || !apiKey.trim()}
                size="sm"
                className="api-key-save-btn"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  t("settings.save")
                )}
              </Button>
            </div>
            <p className="setting-hint">{t("settings.apiKeyHint")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

