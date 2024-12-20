# Automating Frontend Workflows

A comprehensive toolkit for automating frontend development workflows using modern DevOps practices and tools.

## 🚀 Features

- Automated CI/CD pipelines with GitHub Actions
- Standardized version management using Changesets
- Automated changelog generation
- Code quality enforcement
- Jira integration for project management
- Conventional commit standards

## 📋 Prerequisites

- Node.js
- GitHub account
- Jira account (for project management integration)
- AWS account (ECR and App Runner)

## 🛠️ Setup

1. Clone the repository:

```bash
git clone https://github.com/demir-utku/automating-workflows.git

cd automating-workflows
```

2. Install dependencies:

```bash
npm install
```

3. Define repository secrets in your GitHub repository settings. You should have the following secrets:

- `BOT_PAT`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `JIRA_USER`
- `JIRA_PASSWORD`
- `SLACK_WEBHOOK_URL`
- `APPRUNNER_SERVICE_ROLE_ARN`
