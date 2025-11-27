# ✨ MyImpact

> Generate your performance review summary in seconds using GitHub CLI and AI

![MyImpact Screenshot](docs/screenshot-home.png)

## 🎯 What is MyImpact?

**MyImpact** is a desktop application that helps developers generate comprehensive performance review summaries by analyzing their GitHub contributions. It wraps the local GitHub CLI (`gh`) to fetch your PR data and uses OpenAI to generate professional summaries.

### Key Features

- 📊 **PR Analytics** - View merged PRs, reviews, and contribution patterns
- 🤖 **AI Summaries** - Generate professional performance review text with OpenAI
- 📈 **Visual Charts** - Monthly trends, organization distribution, and repository breakdown
- 🔥 **Contribution Streaks** - Track your longest streak of consistent contributions
- 👥 **Collaboration Metrics** - See how many teammates you've helped through code reviews
- 📄 **PDF Export** - Export your report for sharing or printing
- 💾 **Save Reports** - Save and load reports for different review periods
- 🌙 **Dark Mode** - Follows system preference with manual override
- 🌐 **i18n** - English and Portuguese (Brazil) support

## 📸 Screenshots

<details>
<summary>📊 Overview Dashboard</summary>

The Overview tab shows key metrics and charts including:
- Total PRs merged
- PRs reviewed
- Organizations contributed to
- Repositories involved
- Monthly contribution trends
- Contribution heatmap

</details>

<details>
<summary>📝 Pull Requests List</summary>

View all your merged PRs and PRs you've reviewed with:
- PR titles with direct links to GitHub
- Repository badges
- Merge dates
- Author information (for reviewed PRs)

</details>

<details>
<summary>🤖 AI Summary</summary>

Generate AI-powered performance review summaries that:
- Highlight key accomplishments
- Group contributions by theme
- Use professional language
- Can be edited and customized
- Support markdown formatting

</details>

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Tauri v2](https://tauri.app/) |
| **Frontend** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Backend** | Rust |
| **Data** | GitHub CLI (`gh`) |
| **AI** | OpenAI API (GPT-4) |

## 📋 Prerequisites

Before running MyImpact, ensure you have:

1. **GitHub CLI** installed and authenticated
   ```bash
   # Install (macOS)
   brew install gh
   
   # Authenticate
   gh auth login
   ```

2. **Node.js** (v18+) and **npm**

3. **Rust** (for Tauri)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

4. **OpenAI API Key** (optional, for AI summaries)
   - Get your key at [platform.openai.com](https://platform.openai.com/api-keys)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/robertoeb/my-impact.git
cd my-impact

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Building for Production

```bash
# Build the app
npm run tauri build

# The installer will be in src-tauri/target/release/bundle/
```

## ⚙️ Configuration

### Settings

Access settings via the hamburger menu (☰) → Settings:

- **OpenAI API Key**: Required for AI-generated summaries
- **Theme**: System / Light / Dark
- **Language**: English (US) / Português (Brasil)

### Data Storage

MyImpact stores data locally in `~/.myimpact/`:
- `settings.json` - Your preferences and API key
- `reports.json` - Saved reports

## 📖 Usage

1. **Set Date Range**: Choose the period for your performance review
2. **Select Organization**: Filter by org or view all contributions
3. **Generate Report**: Click to fetch your PR data
4. **Explore Tabs**:
   - **Overview**: Charts and metrics
   - **Pull Requests**: Detailed PR list
   - **AI Summary**: Generate and edit your summary
5. **Export**: Save as PDF or save the report locally

## 🔒 Privacy

- Your GitHub data is fetched locally using `gh` CLI
- OpenAI API key is stored locally, never sent to third parties
- No data is collected or transmitted to external servers (except OpenAI for summaries)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Roberto Eustáquio**
- GitHub: [@robertoeb](https://github.com/robertoeb)
- LinkedIn: [/in/robertoeb](https://www.linkedin.com/in/robertoeb/)
- Website: [robertoeb.com](https://www.robertoeb.com/)

---

<p align="center">
  Made with ❤️ using Tauri, React, and Rust
</p>
