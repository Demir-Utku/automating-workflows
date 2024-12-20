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

## 🔄 Workflow Features

### GitHub Actions

Our CI/CD pipeline automatically:
- Runs tests on pull requests
- Checks code formatting and linting
- Builds and deploys on merge to main
- Generates and updates changelogs

### Changesets

We use [Changesets](https://github.com/changesets/changesets) for version management:
- Run `yarn changeset` to create a new changeset
- Commit the generated .md file
- Changesets bot will create a PR with version updates

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Conventional commits enforcement
