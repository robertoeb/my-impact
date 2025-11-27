import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import type { MonthlyDataPoint } from "@/types";

interface MonthlyChartProps {
  data: MonthlyDataPoint[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const { t } = useApp();

  return (
    <Card className="chart-card monthly-chart">
      <CardHeader>
        <CardTitle className="text-base">{t("overview.prsByMonth")}</CardTitle>
        <CardDescription>{t("overview.contributionTrend")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(160, 84%, 35%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

