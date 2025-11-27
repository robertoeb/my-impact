import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useApp } from "@/contexts/AppContext";
import { useReport } from "@/contexts/ReportContext";
import type { SavedReport } from "@/types";
import { formatDate, getOrgDisplayName } from "@/lib/helpers";
import { Header, Sidebar, Titlebar } from "@/components/layout";
import {
  SettingsDialog,
  ReportsDialog,
  AboutDialog,
  SaveReportDialog,
  CompareDialog,
} from "@/components/dialogs";
import {
  SearchForm,
  StatsGrid,
  ExtendedStats,
  MonthlyChart,
  ContributionHeatmap,
  RepoChart,
  OrgChart,
  FloatingActions,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitPullRequest,
  Loader2,
  ExternalLink,
  AlertCircle,
  Sparkles,
  BarChart3,
  Copy,
  Check,
  Brain,
  Eye,
  Code,
} from "lucide-react";
import "./App.css";

function App() {
  const { t } = useApp();

  // Get data from ReportContext
  const {
    startDate,
    endDate,
    orgName,
    setStartDate,
    setEndDate,
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
    apiKey,
    setApiKey,
    saveSettings,
    generateReport,
    generateAiSummary,
    saveReport,
    loadReport,
    deleteReport,
    setAiSummary,
  } = useReport();

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [summaryEditMode, setSummaryEditMode] = useState(false);
  const [editableSummary, setEditableSummary] = useState("");

  const handleSaveReport = useCallback(async () => {
    if (!reportName.trim()) return;

    setSaving(true);
    try {
      await saveReport(reportName.trim());
      setReportName("");
      setSaveDialogOpen(false);
    } catch (err) {
      console.error("Failed to save report:", err);
    } finally {
      setSaving(false);
    }
  }, [reportName, saveReport]);

  const handleLoadReport = useCallback(
    (report: SavedReport) => {
      loadReport(report);
      setReportsOpen(false);
    },
    [loadReport]
  );

  const handleCopySummary = useCallback(() => {
    if (aiSummary) {
      navigator.clipboard.writeText(aiSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [aiSummary]);

  const handleToggleEditMode = useCallback(() => {
    if (!summaryEditMode && aiSummary) {
      setEditableSummary(aiSummary);
    } else if (summaryEditMode) {
      setAiSummary(editableSummary);
    }
    setSummaryEditMode(!summaryEditMode);
  }, [summaryEditMode, aiSummary, editableSummary, setAiSummary]);

  return (
    <div className="app-container">
      <Titlebar />

      <Sidebar
        open={menuOpen}
        onOpenChange={setMenuOpen}
        savedReportsCount={savedReports.length}
        onOpenReports={() => setReportsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
      />

      <Header onMenuClick={() => setMenuOpen(true)} />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onSave={saveSettings}
      />

      <ReportsDialog
        open={reportsOpen}
        onOpenChange={setReportsOpen}
        reports={savedReports}
        onLoadReport={handleLoadReport}
        onDeleteReport={deleteReport}
      />

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />

      <SaveReportDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        reportName={reportName}
        onReportNameChange={setReportName}
        onSave={handleSaveReport}
        isSaving={saving}
      />

      <CompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        currentPrs={pullRequests}
        currentReviewedPrs={reviewedPrs}
        currentStartDate={startDate}
        currentEndDate={endDate}
      />

      <main className="main-content">
        <SearchForm
          startDate={startDate}
          endDate={endDate}
          orgName={orgName}
          organizations={organizations}
          isLoading={loading}
          isOrgsLoading={orgsLoading}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onOrgNameChange={setOrgName}
          onSubmit={generateReport}
        />

        {hasSearched && pullRequests.length > 0 && (
          <FloatingActions
            onCompareClick={() => setCompareOpen(true)}
            onSaveClick={() => setSaveDialogOpen(true)}
            saving={saving}
          />
        )}

        {hasSearched ? (
          <Tabs defaultValue="overview" className="results-tabs">
            <TabsList className="tabs-list">
              <TabsTrigger value="overview" className="tab-trigger">
                <BarChart3 className="h-4 w-4" />
                {t("tabs.overview")}
              </TabsTrigger>
              <TabsTrigger value="prs" className="tab-trigger">
                <GitPullRequest className="h-4 w-4" />
                {t("tabs.pullRequests")}
              </TabsTrigger>
              <TabsTrigger value="ai-summary" className="tab-trigger">
                <Brain className="h-4 w-4" />
                {t("tabs.aiSummary")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="tab-content">
              {error ? (
                <Card className="error-card">
                  <CardContent className="pt-6">
                    <div className="error-content">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <div>
                        <h3 className="error-title">
                          {t("overview.errorFetching")}
                        </h3>
                        <p className="error-message">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : pullRequests.length === 0 ? (
                <Card className="empty-card">
                  <CardContent className="pt-6">
                    <div className="empty-state">
                      <GitPullRequest className="h-12 w-12 text-muted-foreground/50" />
                      <p>{t("overview.noPrsFound")}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="overview-content">
                  <StatsGrid
                    totalPRs={pullRequests.length}
                    orgCount={orgData.length}
                    repoCount={repoData.length}
                    monthlyData={monthlyData}
                  />

                  <ExtendedStats
                    pullRequests={pullRequests}
                    reviewedPrs={reviewedPrs}
                  />

                  <div className="charts-grid">
                    <MonthlyChart data={monthlyData} />
                    <OrgChart data={orgData} />
                    <RepoChart data={repoData} />
                  </div>

                  <ContributionHeatmap pullRequests={pullRequests} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="prs" className="tab-content">
              <Card className="prs-card">
                <CardHeader>
                  <CardTitle>{t("prs.title")}</CardTitle>
                  <CardDescription>
                    {pullRequests.length} PR
                    {pullRequests.length !== 1 ? "s" : ""} {t("prs.mergedIn")}{" "}
                    {getOrgDisplayName(orgName)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pullRequests.length === 0 ? (
                    <div className="empty-state">
                      <GitPullRequest className="h-12 w-12 text-muted-foreground/50" />
                      <p>{t("prs.noPrsFound")}</p>
                    </div>
                  ) : (
                    <div className="prs-list">
                      {pullRequests.map((pr, index) => (
                        <div key={index} className="pr-item">
                          <a
                            href={pr.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pr-link"
                            title="Open in GitHub"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <div className="pr-info">
                            <span className="pr-title">{pr.title}</span>
                            <div className="pr-meta">
                              <Badge variant="secondary" className="pr-repo">
                                {pr.repository.name}
                              </Badge>
                              <span className="pr-date">
                                {t("prs.mergedOn")} {formatDate(pr.closedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {reviewedPrs.length > 0 && (
                <Card className="prs-card reviewed-card">
                  <CardHeader>
                    <CardTitle>{t("prs.reviewedTitle")}</CardTitle>
                    <CardDescription>
                      {reviewedPrs.length} PR
                      {reviewedPrs.length !== 1 ? "s" : ""}{" "}
                      {t("prs.reviewedIn")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prs-list">
                      {reviewedPrs.map((pr, index) => (
                        <div key={index} className="pr-item">
                          <a
                            href={pr.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pr-link"
                            title="Open in GitHub"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <div className="pr-info">
                            <span className="pr-title">{pr.title}</span>
                            <div className="pr-meta">
                              <Badge variant="secondary" className="pr-repo">
                                {pr.repository.name}
                              </Badge>
                              <Badge variant="outline" className="pr-author">
                                @{pr.author.login}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* AI Summary Tab */}
            <TabsContent value="ai-summary" className="tab-content">
              <Card className="ai-card">
                <CardHeader>
                  <div className="ai-header">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {t("ai.title")}
                      </CardTitle>
                      <CardDescription>{t("ai.description")}</CardDescription>
                    </div>
                    <div className="ai-actions">
                      {!aiSummary && pullRequests.length > 0 && (
                        <Button
                          onClick={generateAiSummary}
                          disabled={aiLoading || !apiKey}
                          className="generate-ai-button"
                        >
                          {aiLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t("ai.generating")}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              {t("ai.generateSummary")}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!apiKey ? (
                    <div className="api-key-warning">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{t("ai.apiKeyRequired")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("ai.apiKeyRequiredHint")}
                        </p>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="ai-error">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium">{t("ai.errorGenerating")}</p>
                        <p className="text-sm text-muted-foreground">
                          {aiError}
                        </p>
                      </div>
                    </div>
                  ) : aiSummary ? (
                    <div className="ai-summary">
                      <div className="summary-header">
                        <Badge variant="secondary" className="ai-badge">
                          <Sparkles className="h-3 w-3" />
                          {t("ai.aiGenerated")}
                        </Badge>
                        <div className="summary-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleEditMode}
                          >
                            {summaryEditMode ? (
                              <>
                                <Eye className="h-4 w-4" />
                                {t("ai.preview")}
                              </>
                            ) : (
                              <>
                                <Code className="h-4 w-4" />
                                {t("ai.edit")}
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopySummary}
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                {t("ai.copied")}
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                {t("ai.copy")}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      {summaryEditMode ? (
                        <Textarea
                          value={editableSummary}
                          onChange={(e) => setEditableSummary(e.target.value)}
                          className="summary-editor"
                          rows={20}
                        />
                      ) : (
                        <div className="summary-content markdown-preview">
                          <ReactMarkdown>{aiSummary}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ) : pullRequests.length > 0 ? (
                    <div className="ai-placeholder">
                      <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                      <p>{t("ai.clickGenerate")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("ai.basedOnPrs", { count: pullRequests.length })}
                      </p>
                    </div>
                  ) : (
                    <div className="ai-placeholder">
                      <Brain className="h-12 w-12 text-muted-foreground/50" />
                      <p>{t("ai.generateFirst")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="initial-card">
            <CardContent className="pt-6">
              <div className="empty-state">
                <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                <p>{t("initial.ready")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("initial.configure")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default App;
