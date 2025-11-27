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
import type { ChartDataPoint } from "@/types";

interface OrgChartProps {
  data: ChartDataPoint[];
}

export function OrgChart({ data }: OrgChartProps) {
  const { t } = useApp();

  if (data.length <= 1) {
    return null;
  }

  return (
    <Card className="chart-card org-chart">
      <CardHeader>
        <CardTitle className="text-base">
          {t("overview.prsByOrganization")}
        </CardTitle>
        <CardDescription>{t("overview.distributionOrgs")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(200, 70%, 50%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

