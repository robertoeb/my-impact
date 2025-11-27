import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PullRequest } from "@/types";

interface ContributionHeatmapProps {
  pullRequests: PullRequest[];
}

export function ContributionHeatmap({ pullRequests }: ContributionHeatmapProps) {
  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    
    pullRequests.forEach((pr) => {
      const date = new Date(pr.closedAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString().split("T")[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });

    return Object.entries(weeks)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [pullRequests]);

  const maxCount = useMemo(() => {
    return Math.max(...weeklyData.map((w) => w.count), 1);
  }, [weeklyData]);

  const getIntensityClass = (count: number) => {
    const ratio = count / maxCount;
    if (ratio === 0) return "intensity-0";
    if (ratio <= 0.25) return "intensity-1";
    if (ratio <= 0.5) return "intensity-2";
    if (ratio <= 0.75) return "intensity-3";
    return "intensity-4";
  };

  const formatWeek = (weekStr: string) => {
    const date = new Date(weekStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (weeklyData.length === 0) {
    return null;
  }

  return (
    <Card className="chart-card heatmap-card">
      <CardHeader>
        <CardTitle className="text-base">Contribution Activity</CardTitle>
        <CardDescription>Weekly PR merge activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            {weeklyData.map(({ week, count }) => (
              <div
                key={week}
                className={`heatmap-cell ${getIntensityClass(count)}`}
                title={`${formatWeek(week)}: ${count} PRs`}
              />
            ))}
          </div>
          <div className="heatmap-legend">
            <span className="legend-label">Less</span>
            <div className="heatmap-cell intensity-0" />
            <div className="heatmap-cell intensity-1" />
            <div className="heatmap-cell intensity-2" />
            <div className="heatmap-cell intensity-3" />
            <div className="heatmap-cell intensity-4" />
            <span className="legend-label">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

