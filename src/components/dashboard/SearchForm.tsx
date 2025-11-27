import { Calendar, Building2, Loader2, GitPullRequest } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";

interface SearchFormProps {
  startDate: string;
  endDate: string;
  orgName: string;
  organizations: string[];
  isLoading: boolean;
  isOrgsLoading: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onOrgNameChange: (org: string) => void;
  onSubmit: () => void;
}

export function SearchForm({
  startDate,
  endDate,
  orgName,
  organizations,
  isLoading,
  isOrgsLoading,
  onStartDateChange,
  onEndDateChange,
  onOrgNameChange,
  onSubmit,
}: SearchFormProps) {
  const { t } = useApp();

  return (
    <Card className="controls-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t("search.title")}</CardTitle>
        <CardDescription>{t("search.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="controls-grid">
          <div className="input-group">
            <label className="input-label">
              <Calendar className="h-4 w-4" />
              {t("search.startDate")}
            </label>
            <DatePicker
              value={startDate}
              onChange={onStartDateChange}
              placeholder={t("search.startDate")}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Calendar className="h-4 w-4" />
              {t("search.endDate")}
            </label>
            <DatePicker
              value={endDate}
              onChange={onEndDateChange}
              placeholder={t("search.endDate")}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Building2 className="h-4 w-4" />
              {t("search.organization")}
              {isOrgsLoading && (
                <Loader2 className="h-3 w-3 animate-spin ml-1" />
              )}
            </label>
            <Select value={orgName} onValueChange={onOrgNameChange}>
              <SelectTrigger className="org-select">
                <SelectValue placeholder={t("search.allOrganizations")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  {t("search.allOrganizations")}
                </SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="button-group">
            <Button
              onClick={onSubmit}
              disabled={isLoading || !startDate || !endDate}
              size="lg"
              className="generate-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("search.fetching")}
                </>
              ) : (
                <>
                  <GitPullRequest className="h-4 w-4" />
                  {t("search.generateReport")}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

