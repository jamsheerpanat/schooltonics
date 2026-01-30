# Server Deployment Guide

This guide explains how to deploy OctoSchoolEngine to a production Ubuntu server.

## Prerequisites

- **Ubuntu Server** (22.04 LTS recommended)
- **Root/Sudo Access**
- **Domain Name** (DNS pointing to server IP)

## 1. Initial Server Setup

Update system and install basic tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip
```

## 2. Install Docker & Docker Compose

```bash
# Install Docker Repository
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Repo
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable Service
sudo systemctl enable docker
sudo systemctl start docker

# Add User to Docker Group (avoid sudo for docker commands)
sudo usermod -aG docker $USER
newgrp docker
```

## 3. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/your-org/octoschoolengine.git
sudo chown -R $USER:$USER octoschoolengine
cd octoschoolengine
```

## 4. Configuration

Set up the production environment variables:

```bash
cd infra/server
cp .env.example .env
nano .env
```

**Critical: Update the following values:**
- `APP_KEY`: Generate one locally with `php artisan key:generate --show` and paste it.
- `DB_PASSWORD`: Set a strong password.
- `AWS_SECRET_ACCESS_KEY`: If using MinIO or S3.
- `APP_URL` and `NEXT_PUBLIC_API_URL`: Your domain (e.g., `https://school.example.com`).

## 5. Deployment

Run the included deployment script. This script handles pulling code, building images, and running migrations.

```bash
chmod +x deploy.sh
./deploy.sh
```

## 6. SSL Configuration (Important)

The provided Nginx configuration listens on port 80. For production, you **MUST** set up SSL.

**Option A: Cloudflare (Easiest)**
1. Point DNS to Cloudflare.
2. Enable "Flexible" or "Full" SSL in Cloudflare.
3. Allow port 80 traffic to reach your server.

**Option B: Certbot (LetsEncrypt)**
1. Modify `infra/server/docker-compose.yml` to share a volume for certificates.
2. Run Certbot on the host or in a container to generate certs.
3. Update `infra/server/nginx/default.conf` to listen on 443 and specify ssl_certificate paths.
