import { Sparkles, Github, Linkedin, Globe, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const { t } = useApp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="about-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="about-logo">
              <Sparkles className="h-5 w-5" />
            </div>
            {t("app.name")}
          </DialogTitle>
          <DialogDescription>{t("about.description")}</DialogDescription>
        </DialogHeader>
        <div className="about-content">
          <div className="about-info">
            <div className="about-version">
              <span className="about-label">{t("about.version")}</span>
              <span className="about-value">1.0.0</span>
            </div>
            <div className="about-tech">
              <span className="about-label">{t("about.builtWith")}</span>
              <div className="tech-badges">
                <Badge variant="secondary">Tauri</Badge>
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">Rust</Badge>
                <Badge variant="secondary">TypeScript</Badge>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="about-developer">
            <h4 className="about-section-title">{t("about.developer")}</h4>
            <div className="developer-info">
              <div className="developer-name">Roberto Eustáquio</div>
              <div className="developer-role">Software Engineer</div>
            </div>
            <div className="developer-links">
              <a
                href="https://github.com/robertoeb"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/robertoeb/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.robertoeb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="about-footer">
            <p className="made-with">
              {t("about.madeWith")}{" "}
              <Heart className="h-4 w-4 text-red-500 inline" /> {t("about.in")}{" "}
              2025
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

