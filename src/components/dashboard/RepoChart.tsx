import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { CHART_COLORS } from "@/lib/helpers";
import type { ChartDataPoint } from "@/types";

interface RepoChartProps {
  data: ChartDataPoint[];
}

export function RepoChart({ data }: RepoChartProps) {
  const { t } = useApp();

  return (
    <Card className="chart-card repo-chart">
      <CardHeader>
        <CardTitle className="text-base">
          {t("overview.prsByRepository")}
        </CardTitle>
        <CardDescription>{t("overview.distributionProjects")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="repo-chart-layout">
          <div className="repo-chart-pie">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} PRs`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="repo-legend-list">
            {data.map((repo, index) => (
              <div key={repo.name} className="repo-legend-item">
                <span
                  className="repo-legend-color"
                  style={{
                    background: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span className="repo-legend-name">{repo.name}</span>
                <span className="repo-legend-value">{repo.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

