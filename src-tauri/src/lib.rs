use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;

fn find_gh_cli() -> Option<PathBuf> {
    let common_paths = [
        "/opt/homebrew/bin/gh",
        "/usr/local/bin/gh",
        "/usr/bin/gh",
        "/opt/local/bin/gh",
    ];

    for path in common_paths {
        let path_buf = PathBuf::from(path);
        if path_buf.exists() {
            return Some(path_buf);
        }
    }

    if let Ok(output) = Command::new("/usr/bin/which").arg("gh").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                return Some(PathBuf::from(path));
            }
        }
    }

    None
}

fn gh_command() -> Result<Command, String> {
    match find_gh_cli() {
        Some(path) => Ok(Command::new(path)),
        None => {
            Err("GitHub CLI not found. Please install it from https://cli.github.com".to_string())
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PullRequest {
    pub title: String,
    pub url: String,
    pub body: Option<String>,
    #[serde(rename = "closedAt")]
    pub closed_at: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<String>,
    pub number: Option<i32>,
    pub repository: Repository,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReviewedPullRequest {
    pub title: String,
    pub url: String,
    #[serde(rename = "closedAt")]
    pub closed_at: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub author: Author,
    pub repository: Repository,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Author {
    pub login: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReviewedResult {
    pub success: bool,
    pub data: Option<Vec<ReviewedPullRequest>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Repository {
    pub name: String,
    #[serde(rename = "nameWithOwner")]
    pub name_with_owner: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FetchResult {
    pub success: bool,
    pub data: Option<Vec<PullRequest>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AiResult {
    pub success: bool,
    pub summary: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub api_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SavedReport {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub org_name: String,
    pub date_range: String,
    pub pr_count: usize,
    pub summary: String,
    pub pull_requests: Vec<PullRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveReportResult {
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoadReportsResult {
    pub success: bool,
    pub reports: Option<Vec<SavedReport>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoadSettingsResult {
    pub success: bool,
    pub settings: Option<AppSettings>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrganizationsResult {
    pub success: bool,
    pub organizations: Option<Vec<String>>,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SimplePr {
    repository: SimpleRepo,
}

#[derive(Debug, Deserialize)]
struct SimpleRepo {
    #[serde(rename = "nameWithOwner")]
    name_with_owner: String,
}

#[derive(Debug, Serialize)]
struct OpenAiRequest {
    model: String,
    messages: Vec<OpenAiMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Serialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAiResponse {
    choices: Vec<OpenAiChoice>,
}

#[derive(Debug, Deserialize)]
struct OpenAiChoice {
    message: OpenAiMessageResponse,
}

#[derive(Debug, Deserialize)]
struct OpenAiMessageResponse {
    content: String,
}

fn get_data_dir() -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    let data_dir = home.join(".myimpact");

    if !data_dir.exists() {
        let _ = fs::create_dir_all(&data_dir);
    }

    data_dir
}

fn get_settings_path() -> PathBuf {
    get_data_dir().join("settings.json")
}

fn get_reports_path() -> PathBuf {
    get_data_dir().join("reports.json")
}

#[tauri::command]
fn fetch_organizations(start_date: String, end_date: String) -> OrganizationsResult {
    let date_range = format!("{}..{}", start_date, end_date);

    let mut cmd = match gh_command() {
        Ok(cmd) => cmd,
        Err(e) => {
            return OrganizationsResult {
                success: false,
                organizations: None,
                error: Some(e),
            };
        }
    };

    let output = cmd
        .args([
            "search",
            "prs",
            "--author",
            "@me",
            "--merged-at",
            &date_range,
            "--json",
            "repository",
            "--limit",
            "100",
        ])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let stdout = String::from_utf8_lossy(&result.stdout);

                match serde_json::from_str::<Vec<SimplePr>>(&stdout) {
                    Ok(prs) => {
                        let mut orgs: Vec<String> = prs
                            .iter()
                            .filter_map(|pr| {
                                pr.repository
                                    .name_with_owner
                                    .split('/')
                                    .next()
                                    .map(|s| s.to_string())
                            })
                            .collect();

                        orgs.sort();
                        orgs.dedup();

                        OrganizationsResult {
                            success: true,
                            organizations: Some(orgs),
                            error: None,
                        }
                    }
                    Err(e) => OrganizationsResult {
                        success: false,
                        organizations: None,
                        error: Some(format!("Failed to parse GitHub response: {}", e)),
                    },
                }
            } else {
                let stderr = String::from_utf8_lossy(&result.stderr);
                OrganizationsResult {
                    success: false,
                    organizations: None,
                    error: Some(format!("GitHub CLI error: {}", stderr)),
                }
            }
        }
        Err(e) => OrganizationsResult {
            success: false,
            organizations: None,
            error: Some(format!("Failed to execute GitHub CLI: {}", e)),
        },
    }
}

#[tauri::command]
fn save_settings(api_key: Option<String>) -> SaveReportResult {
    let settings = AppSettings { api_key };
    let path = get_settings_path();

    match serde_json::to_string_pretty(&settings) {
        Ok(json) => match fs::write(&path, json) {
            Ok(_) => SaveReportResult {
                success: true,
                error: None,
            },
            Err(e) => SaveReportResult {
                success: false,
                error: Some(format!("Failed to save settings: {}", e)),
            },
        },
        Err(e) => SaveReportResult {
            success: false,
            error: Some(format!("Failed to serialize settings: {}", e)),
        },
    }
}

#[tauri::command]
fn load_settings() -> LoadSettingsResult {
    let path = get_settings_path();

    if !path.exists() {
        return LoadSettingsResult {
            success: true,
            settings: Some(AppSettings { api_key: None }),
            error: None,
        };
    }

    match fs::read_to_string(&path) {
        Ok(content) => match serde_json::from_str::<AppSettings>(&content) {
            Ok(settings) => LoadSettingsResult {
                success: true,
                settings: Some(settings),
                error: None,
            },
            Err(e) => LoadSettingsResult {
                success: false,
                settings: None,
                error: Some(format!("Failed to parse settings: {}", e)),
            },
        },
        Err(e) => LoadSettingsResult {
            success: false,
            settings: None,
            error: Some(format!("Failed to read settings: {}", e)),
        },
    }
}

#[tauri::command]
fn save_report(report: SavedReport) -> SaveReportResult {
    let path = get_reports_path();

    let mut reports: Vec<SavedReport> = if path.exists() {
        match fs::read_to_string(&path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Vec::new(),
        }
    } else {
        Vec::new()
    };

    if let Some(pos) = reports.iter().position(|r| r.id == report.id) {
        reports[pos] = report;
    } else {
        reports.push(report);
    }

    match serde_json::to_string_pretty(&reports) {
        Ok(json) => match fs::write(&path, json) {
            Ok(_) => SaveReportResult {
                success: true,
                error: None,
            },
            Err(e) => SaveReportResult {
                success: false,
                error: Some(format!("Failed to save report: {}", e)),
            },
        },
        Err(e) => SaveReportResult {
            success: false,
            error: Some(format!("Failed to serialize reports: {}", e)),
        },
    }
}

#[tauri::command]
fn load_reports() -> LoadReportsResult {
    let path = get_reports_path();

    if !path.exists() {
        return LoadReportsResult {
            success: true,
            reports: Some(Vec::new()),
            error: None,
        };
    }

    match fs::read_to_string(&path) {
        Ok(content) => match serde_json::from_str::<Vec<SavedReport>>(&content) {
            Ok(reports) => LoadReportsResult {
                success: true,
                reports: Some(reports),
                error: None,
            },
            Err(e) => LoadReportsResult {
                success: false,
                reports: None,
                error: Some(format!("Failed to parse reports: {}", e)),
            },
        },
        Err(e) => LoadReportsResult {
            success: false,
            reports: None,
            error: Some(format!("Failed to read reports: {}", e)),
        },
    }
}

#[tauri::command]
fn delete_report(report_id: String) -> SaveReportResult {
    let path = get_reports_path();

    if !path.exists() {
        return SaveReportResult {
            success: true,
            error: None,
        };
    }

    let mut reports: Vec<SavedReport> = match fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => Vec::new(),
    };

    reports.retain(|r| r.id != report_id);

    match serde_json::to_string_pretty(&reports) {
        Ok(json) => match fs::write(&path, json) {
            Ok(_) => SaveReportResult {
                success: true,
                error: None,
            },
            Err(e) => SaveReportResult {
                success: false,
                error: Some(format!("Failed to save reports: {}", e)),
            },
        },
        Err(e) => SaveReportResult {
            success: false,
            error: Some(format!("Failed to serialize reports: {}", e)),
        },
    }
}

#[tauri::command]
fn fetch_github_activity(
    start_date: String,
    end_date: String,
    org_name: Option<String>,
) -> FetchResult {
    let date_range = format!("{}..{}", start_date, end_date);

    let mut args = vec![
        "search".to_string(),
        "prs".to_string(),
        "--author".to_string(),
        "@me".to_string(),
        "--merged-at".to_string(),
        date_range,
        "--json".to_string(),
        "title,url,body,closedAt,createdAt,number,repository".to_string(),
        "--limit".to_string(),
        "200".to_string(),
    ];

    if let Some(ref org) = org_name {
        if !org.is_empty() {
            args.insert(4, "--owner".to_string());
            args.insert(5, org.clone());
        }
    }

    let mut cmd = match gh_command() {
        Ok(cmd) => cmd,
        Err(e) => {
            return FetchResult {
                success: false,
                data: None,
                error: Some(e),
            };
        }
    };

    let output = cmd.args(&args).output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let stdout = String::from_utf8_lossy(&result.stdout);

                match serde_json::from_str::<Vec<PullRequest>>(&stdout) {
                    Ok(prs) => FetchResult {
                        success: true,
                        data: Some(prs),
                        error: None,
                    },
                    Err(e) => FetchResult {
                        success: false,
                        data: None,
                        error: Some(format!("Failed to parse GitHub response: {}", e)),
                    },
                }
            } else {
                let stderr = String::from_utf8_lossy(&result.stderr);
                FetchResult {
                    success: false,
                    data: None,
                    error: Some(format!("GitHub CLI error: {}", stderr)),
                }
            }
        }
        Err(e) => FetchResult {
            success: false,
            data: None,
            error: Some(format!("Failed to execute GitHub CLI: {}", e)),
        },
    }
}

#[tauri::command]
fn fetch_reviewed_prs(start_date: String, end_date: String) -> ReviewedResult {
    let date_range = format!("{}..{}", start_date, end_date);

    let mut cmd = match gh_command() {
        Ok(cmd) => cmd,
        Err(e) => {
            return ReviewedResult {
                success: false,
                data: None,
                error: Some(e),
            };
        }
    };

    let output = cmd
        .args([
            "search",
            "prs",
            "--reviewed-by",
            "@me",
            "--merged-at",
            &date_range,
            "--json",
            "title,url,closedAt,createdAt,author,repository",
            "--limit",
            "200",
        ])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let stdout = String::from_utf8_lossy(&result.stdout);

                match serde_json::from_str::<Vec<ReviewedPullRequest>>(&stdout) {
                    Ok(prs) => ReviewedResult {
                        success: true,
                        data: Some(prs),
                        error: None,
                    },
                    Err(e) => ReviewedResult {
                        success: false,
                        data: None,
                        error: Some(format!("Failed to parse GitHub response: {}", e)),
                    },
                }
            } else {
                let stderr = String::from_utf8_lossy(&result.stderr);
                ReviewedResult {
                    success: false,
                    data: None,
                    error: Some(format!("GitHub CLI error: {}", stderr)),
                }
            }
        }
        Err(e) => ReviewedResult {
            success: false,
            data: None,
            error: Some(format!("Failed to execute GitHub CLI: {}", e)),
        },
    }
}

#[tauri::command]
async fn generate_ai_summary(
    api_key: String,
    prs: Vec<PullRequest>,
    date_range: String,
    org_name: String,
) -> AiResult {
    if api_key.is_empty() {
        return AiResult {
            success: false,
            summary: None,
            error: Some("OpenAI API key is required".to_string()),
        };
    }

    if prs.is_empty() {
        return AiResult {
            success: false,
            summary: None,
            error: Some("No pull requests to summarize".to_string()),
        };
    }

    let pr_summaries: Vec<String> = prs
        .iter()
        .map(|pr| {
            let body_preview = pr
                .body
                .as_ref()
                .map(|b| {
                    if b.len() > 200 {
                        format!("{}...", &b[..200])
                    } else {
                        b.clone()
                    }
                })
                .unwrap_or_else(|| "No description".to_string());
            format!(
                "- **{}** ({})\n  {}\n  Merged: {}",
                pr.title, pr.repository.name, body_preview, pr.closed_at
            )
        })
        .collect();

    let pr_list = pr_summaries.join("\n\n");

    let prompt = format!(
        r#"You are an expert at writing performance review self-assessments for software engineers.

CRITICAL RULES:
- NEVER invent or fabricate metrics, percentages, or statistics (like "15% improvement" or "reduced load time by 30%")
- NEVER claim outcomes you cannot verify from the PR data (like "increased user engagement" or "improved customer satisfaction")
- Only describe what the PRs actually show was built or changed
- Focus on the WORK DONE, not imagined business outcomes
- If you don't know the impact, describe the technical contribution without making up numbers

Based on the following merged pull requests from {} at {}, write a performance review summary that:

1. **Impact Summary** (2-3 sentences): High-level overview of what was built/improved. Describe the scope and nature of contributions without fabricating metrics.

2. **Key Achievements** (3-5 bullet points): Specific accomplishments based ONLY on what the PRs show. Mention the actual features, fixes, or improvements made. Do NOT add fake statistics.

3. **Technical Growth**: Areas of technical skill development demonstrated based on the types of work shown in the PRs.

4. **Collaboration & Leadership**: Only mention if clearly evidenced in PR descriptions (e.g., mentions of reviews, pair programming, helping others).

5. **Recommended Talking Points**: 2-3 specific PRs that seem significant based on their titles/descriptions. Explain why they might be good to discuss.

Here are the {} merged pull requests:

{}

Write in first person. Be professional and confident, but STICK TO THE FACTS shown in the PRs. Describe what was built, not imagined outcomes. If a PR title suggests a feature, you can describe building that feature, but don't invent usage statistics or business metrics."#,
        date_range,
        org_name,
        prs.len(),
        pr_list
    );

    let client = reqwest::Client::new();

    let request = OpenAiRequest {
        model: "gpt-4o-mini".to_string(),
        messages: vec![OpenAiMessage {
            role: "user".to_string(),
            content: prompt,
        }],
        max_tokens: 2000,
        temperature: 0.7,
    };

    match client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<OpenAiResponse>().await {
                    Ok(ai_response) => {
                        if let Some(choice) = ai_response.choices.first() {
                            AiResult {
                                success: true,
                                summary: Some(choice.message.content.clone()),
                                error: None,
                            }
                        } else {
                            AiResult {
                                success: false,
                                summary: None,
                                error: Some("No response from AI".to_string()),
                            }
                        }
                    }
                    Err(e) => AiResult {
                        success: false,
                        summary: None,
                        error: Some(format!("Failed to parse AI response: {}", e)),
                    },
                }
            } else {
                let status = response.status();
                let error_text = response.text().await.unwrap_or_default();
                AiResult {
                    success: false,
                    summary: None,
                    error: Some(format!("OpenAI API error ({}): {}", status, error_text)),
                }
            }
        }
        Err(e) => AiResult {
            success: false,
            summary: None,
            error: Some(format!("Failed to call OpenAI API: {}", e)),
        },
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            fetch_organizations,
            fetch_github_activity,
            fetch_reviewed_prs,
            generate_ai_summary,
            save_settings,
            load_settings,
            save_report,
            load_reports,
            delete_report
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
