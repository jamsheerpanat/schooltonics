# GitHub Actions Deployment Guide

This guide explains how to set up automatic deployment using GitHub Actions and SSH.

## Prerequisites

1. A production server set up following the [Server Deployment Guide](./server.md).
2. The repository pushed to GitHub.

## 1. Required GitHub Secrets

Go to your repository settings on GitHub: **Settings > Secrets and variables > Actions** and add the following **Repository secrets**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SSH_HOST` | The IP address or domain of your server | `1.2.3.4` |
| `SSH_USER` | The user to login as (should have docker rights) | `deploy` |
| `SSH_KEY` | The private SSH key (RSA/ED25519) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_PORT` | The SSH port (optional, defaults to 22) | `22` |
| `DEPLOY_PATH`| The absolute path to the repo on the server | `/opt/octoschoolengine` |

## 2. Generating SSH Key

If you don't have a deploy key, generate one on your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./id_ed25519_deploy
```

- Add the content of `id_ed25519_deploy.pub` to the `~/.ssh/authorized_keys` file on your **server**.
- Add the content of `id_ed25519_deploy` (private key) to the `SSH_KEY` secret on **GitHub**.

## 3. How it Works

When you push code to the `main` branch:
1. GitHub starts the "CD - Deploy to Production" workflow.
2. It connects to your server via SSH using the provided secrets.
3. It navigates to `DEPLOY_PATH`.
4. It executes `./infra/server/deploy.sh`.
5. The deployment script pulls the code, builds images, and restarts services.
