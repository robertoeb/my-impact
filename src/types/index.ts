// ============================================
// GitHub Data Types
// ============================================

export interface Repository {
  name: string;
  nameWithOwner: string;
}

export interface PullRequest {
  title: string;
  url: string;
  body: string | null;
  closedAt: string;
  createdAt?: string;
  number?: number;
  repository: Repository;
}

export interface Author {
  login: string;
}

export interface ReviewedPullRequest {
  title: string;
  url: string;
  closedAt: string | null;
  createdAt: string;
  author: Author;
  repository: Repository;
}

export interface ReviewedResult {
  success: boolean;
  data: ReviewedPullRequest[] | null;
  error: string | null;
}

// ============================================
// API Response Types
// ============================================

export interface FetchResult {
  success: boolean;
  data: PullRequest[] | null;
  error: string | null;
}

export interface AiResult {
  success: boolean;
  summary: string | null;
  error: string | null;
}

export interface OrganizationsResult {
  success: boolean;
  organizations: string[] | null;
  error: string | null;
}

export interface SaveResult {
  success: boolean;
  error: string | null;
}

// ============================================
// Settings & Reports Types
// ============================================

export interface AppSettings {
  api_key: string | null;
}

export interface LoadSettingsResult {
  success: boolean;
  settings: AppSettings | null;
  error: string | null;
}

export interface SavedReport {
  id: string;
  name: string;
  created_at: string;
  org_name: string;
  date_range: string;
  pr_count: number;
  summary: string;
  pull_requests: PullRequest[];
}

export interface LoadReportsResult {
  success: boolean;
  reports: SavedReport[] | null;
  error: string | null;
}

// ============================================
// Chart Data Types
// ============================================

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MonthlyDataPoint {
  month: string;
  count: number;
}

// ============================================
// Component Props Types
// ============================================

export interface DateRange {
  start: string;
  end: string;
}

