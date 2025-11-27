import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  GitPullRequest,
  Eye,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import * as tauriService from "@/services/tauri";
import type { PullRequest, ReviewedPullRequest } from "@/types";
import { formatDate } from "@/lib/helpers";

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrs: PullRequest[];
  currentReviewedPrs: ReviewedPullRequest[];
  currentStartDate: string;
  currentEndDate: string;
}

interface ComparisonMetric {
  label: string;
  current: number;
  compare: number;
  icon: React.ReactNode;
}

export function CompareDialog({
  open,
  onOpenChange,
  currentPrs,
  currentReviewedPrs,
  currentStartDate,
  currentEndDate,
}: CompareDialogProps) {
  const { t } = useApp();

  const getDefaultCompareRange = () => {
    const start = new Date(currentStartDate);
    const end = new Date(currentEndDate);
    const durationMs = end.getTime() - start.getTime();
    const compareEnd = new Date(start.getTime() - 1);
    const compareStart = new Date(compareEnd.getTime() - durationMs);

    return {
      start: compareStart.toISOString().split("T")[0],
      end: compareEnd.toISOString().split("T")[0],
    };
  };

  const defaultRange = getDefaultCompareRange();
  const [compareStartDate, setCompareStartDate] = useState(defaultRange.start);
  const [compareEndDate, setCompareEndDate] = useState(defaultRange.end);
  const [comparePrs, setComparePrs] = useState<PullRequest[]>([]);
  const [compareReviewedPrs, setCompareReviewedPrs] = useState<ReviewedPullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);

  useEffect(() => {
    if (open) {
      const range = getDefaultCompareRange();
      setCompareStartDate(range.start);
      setCompareEndDate(range.end);
      setComparePrs([]);
      setCompareReviewedPrs([]);
      setHasCompared(false);
    }
  }, [open, currentStartDate, currentEndDate]);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const [prsResult, reviewedResult] = await Promise.all([
        tauriService.fetchGitHubActivity(compareStartDate, compareEndDate, null),
        tauriService.fetchReviewedPrs(compareStartDate, compareEndDate),
      ]);

      if (prsResult.success && prsResult.data) {
        setComparePrs(prsResult.data);
      }
      if (reviewedResult.success && reviewedResult.data) {
        setCompareReviewedPrs(reviewedResult.data);
      }
      setHasCompared(true);
    } catch (err) {
      console.error("Failed to fetch comparison data:", err);
    } finally {
      setLoading(false);
    }
  };

  const metrics: ComparisonMetric[] = useMemo(() => [
    {
      label: t("overview.prsMerged"),
      current: currentPrs.length,
      compare: comparePrs.length,
      icon: <GitPullRequest className="h-4 w-4" />,
    },
    {
      label: t("overview.prsReviewed"),
      current: currentReviewedPrs.length,
      compare: compareReviewedPrs.length,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: t("overview.repositories"),
      current: new Set(currentPrs.map((pr) => pr.repository.name)).size,
      compare: new Set(comparePrs.map((pr) => pr.repository.name)).size,
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ], [currentPrs, comparePrs, currentReviewedPrs, compareReviewedPrs, t]);

  const renderChange = (current: number, compare: number) => {
    if (compare === 0) {
      if (current > 0) return { icon: <ArrowUp className="h-3 w-3" />, text: "New", color: "text-green-500" };
      return { icon: <Minus className="h-3 w-3" />, text: "—", color: "text-muted-foreground" };
    }

    const change = ((current - compare) / compare) * 100;
    
    if (Math.abs(change) < 1) {
      return { icon: <Minus className="h-3 w-3" />, text: "0%", color: "text-muted-foreground" };
    }

    if (change > 0) {
      return {
        icon: <ArrowUp className="h-3 w-3" />,
        text: `+${change.toFixed(0)}%`,
        color: "text-green-500",
      };
    }

    return {
      icon: <ArrowDown className="h-3 w-3" />,
      text: `${change.toFixed(0)}%`,
      color: "text-red-500",
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="compare-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("compare.title")}
          </DialogTitle>
          <DialogDescription>{t("compare.description")}</DialogDescription>
        </DialogHeader>

        <div className="compare-content">
          <div className="compare-periods">
            <div className="period-card current">
              <div className="period-label">
                <Calendar className="h-4 w-4" />
                {t("compare.currentPeriod")}
              </div>
              <div className="period-dates">
                {formatDate(currentStartDate)} - {formatDate(currentEndDate)}
              </div>
              <Badge variant="secondary">{currentPrs.length} PRs</Badge>
            </div>

            <div className="period-card compare">
              <div className="period-label">
                <Calendar className="h-4 w-4" />
                {t("compare.comparePeriod")}
              </div>
              <div className="period-inputs">
                <Input
                  type="date"
                  value={compareStartDate}
                  onChange={(e) => setCompareStartDate(e.target.value)}
                />
                <span className="period-separator">—</span>
                <Input
                  type="date"
                  value={compareEndDate}
                  onChange={(e) => setCompareEndDate(e.target.value)}
                />
              </div>
              {hasCompared && (
                <Badge variant="outline">{comparePrs.length} PRs</Badge>
              )}
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={loading || !compareStartDate || !compareEndDate}
            className="compare-button"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("compare.loading")}
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                {t("compare.compare")}
              </>
            )}
          </Button>

          {hasCompared && (
            <div className="compare-results">
              <h4 className="results-title">{t("compare.results")}</h4>
              <div className="metrics-grid">
                {metrics.map((metric, index) => {
                  const change = renderChange(metric.current, metric.compare);
                  return (
                    <div key={index} className="metric-card">
                      <div className="metric-header">
                        {metric.icon}
                        <span className="metric-label">{metric.label}</span>
                      </div>
                      <div className="metric-values">
                        <div className="metric-compare">
                          <span className="value-label">{t("compare.before")}</span>
                          <span className="value">{metric.compare}</span>
                        </div>
                        <div className="metric-arrow">→</div>
                        <div className="metric-current">
                          <span className="value-label">{t("compare.after")}</span>
                          <span className="value">{metric.current}</span>
                        </div>
                        <div className={`metric-change ${change.color}`}>
                          {change.icon}
                          <span>{change.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

