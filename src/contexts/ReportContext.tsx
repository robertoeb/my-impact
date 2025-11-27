import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  PullRequest,
  ReviewedPullRequest,
  SavedReport,
  ChartDataPoint,
  MonthlyDataPoint,
} from "@/types";
import { useGitHubData } from "@/hooks/useGitHubData";
import { useAiSummary } from "@/hooks/useAiSummary";
import { useReports } from "@/hooks/useReports";
import { useSettings } from "@/hooks/useSettings";
import {
  formatDate,
  getDefaultDateRange,
  getMonthName,
  getOrgDisplayName,
} from "@/lib/helpers";

interface ReportContextType {
  startDate: string;
  endDate: string;
  orgName: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setOrgName: (org: string) => void;
  pullRequests: PullRequest[];
  reviewedPrs: ReviewedPullRequest[];
  organizations: string[];
  aiSummary: string | null;
  orgData: ChartDataPoint[];
  repoData: ChartDataPoint[];
  monthlyData: MonthlyDataPoint[];
  loading: boolean;
  orgsLoading: boolean;
  aiLoading: boolean;
  error: string | null;
  aiError: string | null;
  hasSearched: boolean;
  savedReports: SavedReport[];
  loadedReportId: string | null;
  loadedReportHadSummary: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  saveSettings: () => Promise<void>;
  generateReport: () => void;
  generateAiSummary: () => Promise<void>;
  saveReport: (name: string) => Promise<void>;
  updateReport: () => Promise<void>;
  loadReport: (report: SavedReport) => void;
  deleteReport: (reportId: string) => Promise<void>;
  setAiSummary: (summary: string | null) => void;
  getFormattedOrgName: () => string;
  getFormattedDateRange: () => string;
}

const ReportContext = createContext<ReportContextType | null>(null);

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
}

interface ReportProviderProps {
  children: ReactNode;
}

export function ReportProvider({ children }: ReportProviderProps) {
  const defaultDates = getDefaultDateRange();

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [orgName, setOrgName] = useState("__all__");
  const [loadedReportId, setLoadedReportId] = useState<string | null>(null);
  const [loadedReportHadSummary, setLoadedReportHadSummary] = useState(false);

  const {
    pullRequests,
    reviewedPrs,
    organizations,
    loading,
    orgsLoading,
    error,
    hasSearched,
    fetchReport,
    fetchOrganizations,
    setPullRequests,
  } = useGitHubData();

  const { apiKey, setApiKey, saveSettings } = useSettings();

  const {
    savedReports,
    saveReport: saveReportToStorage,
    updateReport: updateReportInStorage,
    deleteReport,
    loadReport: loadReportFromStorage,
  } = useReports();

  const {
    summary: aiSummary,
    isLoading: aiLoading,
    error: aiError,
    generateSummary,
    setSummary: setAiSummary,
  } = useAiSummary();

  const monthlyData = useMemo<MonthlyDataPoint[]>(() => {
    const grouped: Record<string, number> = {};
    pullRequests.forEach((pr) => {
      const month = getMonthName(pr.closedAt);
      grouped[month] = (grouped[month] || 0) + 1;
    });
    return Object.entries(grouped).map(([month, count]) => ({ month, count }));
  }, [pullRequests]);

  const orgData = useMemo<ChartDataPoint[]>(() => {
    const grouped: Record<string, number> = {};
    pullRequests.forEach((pr) => {
      const org = pr.repository.nameWithOwner.split("/")[0];
      grouped[org] = (grouped[org] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [pullRequests]);

  const repoData = useMemo<ChartDataPoint[]>(() => {
    const grouped: Record<string, number> = {};
    pullRequests.forEach((pr) => {
      const repo = pr.repository.name;
      grouped[repo] = (grouped[repo] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [pullRequests]);

  const getFormattedOrgName = useCallback(() => {
    return getOrgDisplayName(orgName);
  }, [orgName]);

  const getFormattedDateRange = useCallback(() => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }, [startDate, endDate]);

  const generateReport = useCallback(() => {
    setAiSummary(null);
    setLoadedReportId(null);
    setLoadedReportHadSummary(false);
    fetchReport(startDate, endDate, orgName === "__all__" ? null : orgName);
  }, [startDate, endDate, orgName, fetchReport, setAiSummary]);

  const generateAiSummary = useCallback(async () => {
    await generateSummary({
      apiKey,
      pullRequests,
      dateRange: getFormattedDateRange(),
      orgName: getFormattedOrgName(),
    });
  }, [
    apiKey,
    pullRequests,
    getFormattedDateRange,
    getFormattedOrgName,
    generateSummary,
  ]);

  const saveReport = useCallback(
    async (name: string) => {
      await saveReportToStorage({
        name,
        orgName: getFormattedOrgName(),
        dateRange: getFormattedDateRange(),
        pullRequests,
        summary: aiSummary,
      });
      setLoadedReportId(null);
    },
    [
      aiSummary,
      pullRequests,
      getFormattedOrgName,
      getFormattedDateRange,
      saveReportToStorage,
    ]
  );

  const updateReport = useCallback(async () => {
    if (!loadedReportId || !aiSummary) return;
    await updateReportInStorage(loadedReportId, { summary: aiSummary });
    setLoadedReportHadSummary(true);
  }, [loadedReportId, aiSummary, updateReportInStorage]);

  const loadReport = useCallback(
    (report: SavedReport) => {
      const data = loadReportFromStorage(report);
      setOrgName(data.orgName);
      setPullRequests(data.pullRequests);
      setAiSummary(data.summary);
      setLoadedReportId(data.id);
      setLoadedReportHadSummary(!!data.summary);
    },
    [loadReportFromStorage, setPullRequests, setAiSummary]
  );

  const handleStartDateChange = useCallback(
    (date: string) => {
      setStartDate(date);
      if (date && endDate) {
        fetchOrganizations(date, endDate);
      }
    },
    [endDate, fetchOrganizations]
  );

  const handleEndDateChange = useCallback(
    (date: string) => {
      setEndDate(date);
      if (startDate && date) {
        fetchOrganizations(startDate, date);
      }
    },
    [startDate, fetchOrganizations]
  );

  const value = useMemo<ReportContextType>(
    () => ({
      startDate,
      endDate,
      orgName,
      setStartDate: handleStartDateChange,
      setEndDate: handleEndDateChange,
      setOrgName,
      pullRequests,
      reviewedPrs,
      organizations,
      aiSummary,
      orgData,
      repoData,
      monthlyData,
      loading,
      orgsLoading,
      aiLoading,
      error,
      aiError,
      hasSearched,
      savedReports,
      loadedReportId,
      loadedReportHadSummary,
      apiKey,
      setApiKey,
      saveSettings,
      generateReport,
      generateAiSummary,
      saveReport,
      updateReport,
      loadReport,
      deleteReport,
      setAiSummary,
      getFormattedOrgName,
      getFormattedDateRange,
    }),
    [
      startDate,
      endDate,
      orgName,
      handleStartDateChange,
      handleEndDateChange,
      pullRequests,
      reviewedPrs,
      organizations,
      aiSummary,
      orgData,
      repoData,
      monthlyData,
      loading,
      orgsLoading,
      aiLoading,
      error,
      aiError,
      hasSearched,
      savedReports,
      loadedReportId,
      loadedReportHadSummary,
      apiKey,
      setApiKey,
      saveSettings,
      generateReport,
      generateAiSummary,
      saveReport,
      updateReport,
      loadReport,
      deleteReport,
      setAiSummary,
      getFormattedOrgName,
      getFormattedDateRange,
    ]
  );

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}
