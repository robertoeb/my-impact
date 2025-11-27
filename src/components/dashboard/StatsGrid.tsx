import { GitPullRequest, Building2, FolderGit2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import type { MonthlyDataPoint } from "@/types";

interface StatsGridProps {
  totalPRs: number;
  orgCount: number;
  repoCount: number;
  monthlyData: MonthlyDataPoint[];
}

export function StatsGrid({
  totalPRs,
  orgCount,
  repoCount,
  monthlyData,
}: StatsGridProps) {
  const { t } = useApp();

  const avgPRsPerMonth =
    monthlyData.length > 0
      ? (totalPRs / monthlyData.length).toFixed(1)
      : "0";

  return (
    <div className="overview-grid">
      <Card className="stat-card">
        <CardContent className="pt-6">
          <div className="stat-icon">
            <GitPullRequest className="h-6 w-6" />
          </div>
          <div className="stat-value">{totalPRs}</div>
          <div className="stat-label">{t("overview.prsMerged")}</div>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardContent className="pt-6">
          <div className="stat-icon repos">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="stat-value">{orgCount}</div>
          <div className="stat-label">{t("overview.organizations")}</div>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardContent className="pt-6">
          <div className="stat-icon files">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div className="stat-value">{repoCount}</div>
          <div className="stat-label">{t("overview.repositories")}</div>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardContent className="pt-6">
          <div className="stat-icon trend">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="stat-value">{avgPRsPerMonth}</div>
          <div className="stat-label">{t("overview.avgPrsMonth")}</div>
        </CardContent>
      </Card>
    </div>
  );
}

