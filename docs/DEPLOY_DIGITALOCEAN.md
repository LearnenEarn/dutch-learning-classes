# 🚀 Dutch Learning App — DigitalOcean Deployment Guide

> **Audience:** Engineer deploying the full-stack Dutch Learning App (React + Rust/Axum + PostgreSQL) to DigitalOcean.
>
> **Estimated time:** 30–45 minutes for first deployment.
>
> **Repository:** https://github.com/LearnenEarn/dutch-learning-classes

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Architecture Overview](#2-architecture-overview)
3. [Option A: Droplet + Docker Compose (Recommended)](#3-option-a-droplet--docker-compose-recommended)
4. [Option B: App Platform (Managed)](#4-option-b-app-platform-managed)
5. [DNS & Domain Setup](#5-dns--domain-setup)
6. [SSL/TLS with Let's Encrypt](#6-ssltls-with-lets-encrypt)
7. [Database Backups](#7-database-backups)
8. [CI/CD Integration](#8-cicd-integration)
9. [Monitoring & Alerting](#9-monitoring--alerting)
10. [Scaling](#10-scaling)
11. [Troubleshooting](#11-troubleshooting)
12. [Cost Estimate](#12-cost-estimate)

---

## 1. Prerequisites

Before starting, ensure you have:

- [ ] A [DigitalOcean account](https://cloud.digitalocean.com/registrations/new) (with billing configured)
- [ ] A domain name (e.g., `dutchapp.learnearn.nl`) — optional but recommended
- [ ] `git` installed on your local machine
- [ ] An SSH key pair (`ssh-keygen -t ed25519` if you don't have one)
- [ ] The repository cloned locally:
  ```bash
  git clone https://github.com/LearnenEarn/dutch-learning-classes.git
  cd dutch-learning-classes/dutch-app
  ```

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   DigitalOcean Droplet                    │
│                   (Ubuntu 24.04 LTS)                     │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │   Nginx     │──▶│  Rust/Axum   │──▶│ PostgreSQL   │  │
│  │  (Frontend) │   │  (Backend)   │   │   16-alpine  │  │
│  │  Port 80/443│   │  Port 3000   │   │  Port 5432   │  │
│  └─────────────┘   └──────────────┘   └──────────────┘  │
│        ▲                                                 │
│        │          Docker Compose Network                  │
│        │            (dutch-net)                           │
└────────┼─────────────────────────────────────────────────┘
         │
    Internet (HTTPS)
```

**Three Docker containers** managed by `docker-compose.yml`:
- **Frontend**: React SPA served by Nginx (ports 80/443)
- **Backend**: Rust/Axum API server (port 3000, internal only)
- **Database**: PostgreSQL 16 (port 5432, internal only)

---

## 3. Option A: Droplet + Docker Compose (Recommended)

This is the most cost-effective and gives you full control.

### Step 3.1 — Create the Droplet

1. Go to **DigitalOcean Console** → **Create** → **Droplets**
2. Configure:

   | Setting          | Value                                          |
   |------------------|------------------------------------------------|
   | **Region**       | `AMS3` (Amsterdam) — closest to Haarlem        |
   | **Image**        | Ubuntu 24.04 LTS                               |
   | **Size**         | Basic → Regular → **$12/mo** (2 GB / 1 vCPU)   |
   | **Auth**         | SSH Key (add your public key)                  |
   | **Hostname**     | `dutch-app-prod`                               |
   | **Tags**         | `learn-earn`, `production`                     |

   > ⚠️ For production with >50 concurrent users, choose **$24/mo** (4 GB / 2 vCPU).

3. Click **Create Droplet** and note the public IP (e.g., `164.92.xxx.xxx`).

### Step 3.2 — Initial Server Setup

SSH into the droplet:

```bash
ssh root@164.92.xxx.xxx
```

Run the following setup script:

```bash
# ── Update system ──────────────────────────────────────────
apt update && apt upgrade -y

# ── Create a deploy user (never deploy as root) ───────────
adduser --disabled-password --gecos "" deploy
usermod -aG sudo docker deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy

# ── Copy SSH key to deploy user ───────────────────────────
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# ── Install Docker ────────────────────────────────────────
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# ── Add deploy user to docker group ──────────────────────
usermod -aG docker deploy

# ── Install Docker Compose plugin ────────────────────────
apt install -y docker-compose-plugin

# ── Configure firewall ───────────────────────────────────
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── Enable automatic security updates ───────────────────
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# ── Set timezone ─────────────────────────────────────────
timedatectl set-timezone Europe/Amsterdam

echo "✅ Server setup complete. Log out and reconnect as deploy user."
```

Now disconnect and reconnect as the deploy user:

```bash
exit
ssh deploy@164.92.xxx.xxx
```

Verify Docker works:

```bash
docker --version
docker compose version
```

### Step 3.3 — Clone the Repository

```bash
cd ~
git clone https://github.com/LearnenEarn/dutch-learning-classes.git
cd dutch-learning-classes/dutch-app
```

### Step 3.4 — Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit with your production values
nano .env
```

**Required changes for production** (update these values):

```env
# ── Environment ──────────────────────────────────────────
ENVIRONMENT=production

# ── Database ─────────────────────────────────────────────
# Generate a strong password:  openssl rand -base64 32
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD_HERE
DATABASE_URL=postgres://dutch_admin:YOUR_STRONG_DB_PASSWORD_HERE@postgres:5432/dutch_app
DB_MAX_CONNECTIONS=20
DB_MIN_CONNECTIONS=5

# ── Auth / JWT ───────────────────────────────────────────
# Generate a secret:  openssl rand -base64 64
JWT_SECRET=YOUR_64_CHAR_SECRET_HERE
JWT_EXPIRY_HOURS=24

# ── Server ───────────────────────────────────────────────
HOST=0.0.0.0
PORT=3000
FRONTEND_ORIGIN=https://your-domain.com    # or http://164.92.xxx.xxx

# ── Security ─────────────────────────────────────────────
BCRYPT_COST=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINS=15
RATE_LIMIT_PER_SECOND=10
RATE_LIMIT_BURST=30

# ── Feature Flags ────────────────────────────────────────
ENABLE_REGISTRATION=true
ENABLE_DEMO_MODE=false

# ── Frontend ─────────────────────────────────────────────
VITE_API_URL=/api                          # Nginx proxies /api to backend
VITE_DEMO_MODE=false                       # IMPORTANT: false for production
```

Generate the secrets right on the server:

```bash
echo "DB_PASSWORD: $(openssl rand -base64 32)"
echo "JWT_SECRET: $(openssl rand -base64 64)"
```

### Step 3.5 — Update Frontend Environment

The frontend `.env` must also be updated (it's baked into the Docker image at build time):

```bash
cat > frontend/.env << 'EOF'
VITE_API_URL=/api
VITE_DEMO_MODE=false
EOF
```

### Step 3.6 — Build and Launch

```bash
# Build all containers (first time takes ~5-10 minutes for Rust compilation)
docker compose up -d --build

# Watch the build progress
docker compose logs -f

# Verify all 3 containers are healthy
docker compose ps
```

Expected output:

```
NAME                 STATUS                    PORTS
dutch-app-db         Up (healthy)              5432/tcp
dutch-app-backend    Up (healthy)              3000/tcp
dutch-app-frontend   Up (healthy)              0.0.0.0:80->80/tcp
```

### Step 3.7 — Run Database Migrations

The backend runs SQLx migrations on startup. Verify they completed:

```bash
docker compose logs backend | grep -i migration
```

If you need to run migrations manually:

```bash
# Connect to the running backend container
docker compose exec backend /bin/sh

# Or connect directly to PostgreSQL
docker compose exec postgres psql -U dutch_admin -d dutch_app

# List tables to verify
\dt
```

### Step 3.8 — Verify the Deployment

```bash
# Health check
curl http://localhost/api/health

# Should return:
# {"status":"ok","timestamp":"..."}

# Check readiness (includes DB connectivity)
curl http://localhost/api/health/ready

# Test from your browser
# Navigate to http://164.92.xxx.xxx
```

---

## 4. Option B: App Platform (Managed)

DigitalOcean's App Platform can auto-deploy from GitHub, but requires splitting into separate services.

> ⚠️ App Platform is easier to manage but **more expensive** (~$29/mo minimum). Use this if you prefer zero-ops.

### Step 4.1 — Create a Managed Database

1. Go to **Databases** → **Create** → **PostgreSQL**
2. Choose:
   - Engine: **PostgreSQL 16**
   - Region: **AMS3** (Amsterdam)
   - Plan: **Basic ($15/mo)** — 1 GB RAM, 10 GB disk
   - Name: `dutch-app-db`
3. Note the connection string from the dashboard.

### Step 4.2 — Create an App

1. Go to **App Platform** → **Create App**
2. Connect your GitHub repo: `LearnenEarn/dutch-learning-classes`
3. Configure **two components**:

**Component 1: Backend (Web Service)**
| Setting             | Value                                     |
|---------------------|-------------------------------------------|
| Source Directory     | `/dutch-app/backend`                     |
| Build Command        | (leave empty — Dockerfile handles it)     |
| Dockerfile Path      | `Dockerfile`                             |
| HTTP Port            | `3000`                                   |
| Route                | `/api`                                   |
| Instance Size        | Basic ($5/mo)                            |

**Component 2: Frontend (Static Site)**
| Setting             | Value                                     |
|---------------------|-------------------------------------------|
| Source Directory     | `/dutch-app/frontend`                    |
| Build Command        | `npm ci && npm run build`                |
| Output Directory     | `dist`                                   |

4. Add environment variables from `.env.example` in the App Settings.
5. Attach the managed database under **Add Resource** → **Database**.

### Step 4.3 — Deploy

Click **Deploy** and wait for the build to complete. App Platform automatically:
- Builds on every push to `main`
- Manages SSL certificates
- Handles zero-downtime deployments

---

## 5. DNS & Domain Setup

### If you have a domain (recommended):

1. In DigitalOcean, go to **Networking** → **Domains**
2. Add your domain (e.g., `learnearn.nl`)
3. Create DNS records:

   | Type  | Hostname              | Value               | TTL   |
   |-------|-----------------------|---------------------|-------|
   | A     | `dutchapp`            | `164.92.xxx.xxx`    | 3600  |
   | CNAME | `www.dutchapp`        | `dutchapp.learnearn.nl` | 3600 |

4. At your domain registrar, update nameservers to:
   ```
   ns1.digitalocean.com
   ns2.digitalocean.com
   ns3.digitalocean.com
   ```

5. Wait for DNS propagation (5 min – 48 hours):
   ```bash
   dig dutchapp.learnearn.nl +short
   ```

---

## 6. SSL/TLS with Let's Encrypt

### Install Certbot on the Droplet

SSH in as `deploy` and run:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop the Docker frontend temporarily
cd ~/dutch-learning-classes/dutch-app
docker compose stop frontend
```

### Update Nginx for SSL

Create a new production Nginx config with SSL support:

```bash
cat > frontend/nginx-ssl.conf << 'NGINX'
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name dutchapp.learnearn.nl www.dutchapp.learnearn.nl;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name dutchapp.learnearn.nl www.dutchapp.learnearn.nl;

    # ── SSL certificates (managed by Certbot) ─────────────────
    ssl_certificate /etc/letsencrypt/live/dutchapp.learnearn.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dutchapp.learnearn.nl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ── HSTS ──────────────────────────────────────────────────
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    root /usr/share/nginx/html;
    index index.html;

    # ── Security headers ──────────────────────────────────────
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # ── Compression ───────────────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # ── SPA routing ───────────────────────────────────────────
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── API reverse proxy ─────────────────────────────────────
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }

    # ── Static asset caching ──────────────────────────────────
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ── Block dotfiles ────────────────────────────────────────
    location ~ /\. { deny all; }
}
NGINX
```

### Update docker-compose for SSL

```bash
cat > docker-compose.prod.yml << 'YAML'
# Production override — adds SSL volume mounts
services:
  frontend:
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./frontend/nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "80:80"
      - "443:443"
YAML
```

### Obtain the SSL Certificate

```bash
# Temporarily run a plain Nginx for the ACME challenge
sudo certbot certonly --standalone -d dutchapp.learnearn.nl -d www.dutchapp.learnearn.nl --email your-email@learnearn.nl --agree-tos --non-interactive

# Restart with SSL
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Auto-Renew Certificate

```bash
# Add cron job for auto-renewal
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet && docker compose -C /home/deploy/dutch-learning-classes/dutch-app restart frontend
```

---

## 7. Database Backups

### Automated Daily Backups

Create a backup script:

```bash
sudo mkdir -p /opt/backups/dutch-app
sudo chown deploy:deploy /opt/backups/dutch-app

cat > ~/backup-db.sh << 'SCRIPT'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/backups/dutch-app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="dutch_app_${TIMESTAMP}.sql.gz"

# Dump and compress
docker compose -f /home/deploy/dutch-learning-classes/dutch-app/docker-compose.yml \
  exec -T postgres pg_dump -U dutch_admin dutch_app | gzip > "${BACKUP_DIR}/${FILENAME}"

# Keep only last 14 days of backups
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +14 -delete

echo "✅ Backup complete: ${FILENAME} ($(du -h ${BACKUP_DIR}/${FILENAME} | cut -f1))"
SCRIPT

chmod +x ~/backup-db.sh
```

Schedule it daily at 2 AM:

```bash
crontab -e
# Add:
0 2 * * * /home/deploy/backup-db.sh >> /opt/backups/dutch-app/backup.log 2>&1
```

### Optional: Upload Backups to DigitalOcean Spaces

```bash
# Install s3cmd
sudo apt install -y s3cmd

# Configure (use your Spaces access key)
s3cmd --configure

# Add to backup script before the "Keep only last 14 days" line:
# s3cmd put "${BACKUP_DIR}/${FILENAME}" s3://dutch-app-backups/
```

### Restore from Backup

```bash
# Decompress and restore
gunzip -c /opt/backups/dutch-app/dutch_app_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U dutch_admin -d dutch_app
```

---

## 8. CI/CD Integration

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`. To enable automated deployment:

### Step 8.1 — Add GitHub Secrets

Go to **GitHub → Settings → Secrets and variables → Actions** and add:

| Secret Name          | Value                                        |
|----------------------|----------------------------------------------|
| `DO_SSH_KEY`         | Private SSH key for `deploy` user            |
| `DO_HOST`            | Droplet IP (`164.92.xxx.xxx`)                |
| `DO_USERNAME`        | `deploy`                                     |
| `DOCKER_USERNAME`    | Your Docker Hub username (optional)          |
| `DOCKER_PASSWORD`    | Your Docker Hub token (optional)             |

### Step 8.2 — Add Deploy Job to CI/CD

Add this job to `.github/workflows/ci.yml`:

```yaml
  # ── Deploy to DigitalOcean ────────────────────────────────
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [frontend-lint-build, backend-check, docker-build]
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd ~/dutch-learning-classes/dutch-app
            git pull origin main
            docker compose down
            docker compose up -d --build
            docker compose ps
            echo "✅ Deploy complete at $(date)"
```

Now every push to `main` that passes CI will auto-deploy to DigitalOcean.

### Step 8.3 — Zero-Downtime Deployments (Advanced)

For zero downtime, use a rolling strategy:

```bash
# Build new images without stopping current containers
docker compose build

# Recreate one service at a time
docker compose up -d --no-deps --build frontend
sleep 5
docker compose up -d --no-deps --build backend

# Verify health
curl -sf http://localhost/api/health || echo "⚠️ Health check failed"
```

---

## 9. Monitoring & Alerting

### Built-in Health Checks

The app exposes two health endpoints:

```bash
# Basic health (is the server running?)
curl https://dutchapp.learnearn.nl/api/health
# → {"status":"ok","timestamp":"2026-03-26T..."}

# Readiness (can it serve requests, DB connected?)
curl https://dutchapp.learnearn.nl/api/health/ready
# → {"status":"ok","database":"connected"}
```

### DigitalOcean Monitoring

1. Go to **Monitoring** → **Create Alert**
2. Set up alerts:

   | Metric               | Threshold            | Action              |
   |----------------------|----------------------|---------------------|
   | CPU > 80%            | 5 minutes            | Email + Slack       |
   | Memory > 85%         | 5 minutes            | Email + Slack       |
   | Disk > 80%           | 1 hour               | Email               |

### UptimeRobot (Free Uptime Monitoring)

1. Create a free account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitors:
   - **HTTP(s)** → `https://dutchapp.learnearn.nl` (check every 5 min)
   - **HTTP(s)** → `https://dutchapp.learnearn.nl/api/health` (check every 5 min)
3. Configure email/Slack/Telegram notifications on downtime.

### Docker Log Monitoring

```bash
# View live logs
docker compose logs -f --tail=100

# View specific service
docker compose logs -f backend

# Check for errors
docker compose logs backend 2>&1 | grep -i error

# Resource usage
docker stats
```

---

## 10. Scaling

### Vertical Scaling (Quick)

Resize the Droplet:
1. Go to **Droplets** → `dutch-app-prod` → **Resize**
2. Choose a larger plan → **Resize** (requires 1-2 min downtime)

### Horizontal Scaling (Advanced)

When you outgrow a single Droplet:

```
                    ┌──────────────────────┐
                    │  DigitalOcean LB      │
                    │  ($12/mo)             │
                    └──────┬───────────────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
        ┌──────────┐ ┌──────────┐    ┌──────────┐
        │ Droplet 1│ │ Droplet 2│    │ Droplet 3│
        │ Frontend │ │ Frontend │    │ Frontend │
        │ Backend  │ │ Backend  │    │ Backend  │
        └──────────┘ └──────────┘    └──────────┘
              │            │                │
              └────────────┼────────────────┘
                           ▼
                  ┌──────────────────┐
                  │ Managed Postgres │
                  │ ($15/mo)         │
                  └──────────────────┘
```

Steps:
1. Migrate to a **Managed Database** (separate PostgreSQL)
2. Create a **Load Balancer** ($12/mo)
3. Duplicate Droplets behind the LB
4. Use shared/external storage for any file uploads (DigitalOcean Spaces)

---

## 11. Troubleshooting

### Container won't start

```bash
# Check build logs
docker compose logs backend

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database connection failed

```bash
# Check postgres is healthy
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U dutch_admin -d dutch_app -c "SELECT 1"

# Check backend can reach postgres
docker compose exec backend curl -v postgres:5432 || echo "Connection test complete"
```

### Frontend shows blank page

```bash
# Check if assets were built
docker compose exec frontend ls /usr/share/nginx/html

# Check nginx config
docker compose exec frontend nginx -t

# Check browser console for errors (likely API URL issue)
# Ensure VITE_API_URL=/api in frontend/.env before building
```

### Rust build fails (out of memory)

If the Droplet has only 2 GB RAM and Rust compilation runs out of memory:

```bash
# Create a swap file
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Retry the build
docker compose up -d --build
```

### Port 80 already in use

```bash
# Find what's using port 80
sudo lsof -i :80

# If it's Apache, stop and disable it
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### View database tables

```bash
docker compose exec postgres psql -U dutch_admin -d dutch_app -c "\dt"
```

### Reset everything (nuclear option)

```bash
docker compose down -v    # -v removes volumes (DESTROYS DATABASE)
docker system prune -af   # Remove all unused images
docker compose up -d --build
```

---

## 12. Cost Estimate

### Minimum Viable (Droplet)

| Resource                  | Monthly Cost |
|---------------------------|-------------|
| Droplet (2 GB / 1 vCPU)  | $12         |
| Backups (20% of Droplet)  | $2.40       |
| Domain (optional)         | ~$1         |
| **Total**                 | **~$15/mo** |

### Recommended Production

| Resource                      | Monthly Cost |
|-------------------------------|-------------|
| Droplet (4 GB / 2 vCPU)      | $24         |
| Backups (20% of Droplet)      | $4.80       |
| Managed DB (1 GB, optional)   | $15         |
| DigitalOcean Spaces (optional)| $5          |
| Domain                        | ~$1         |
| **Total**                     | **~$50/mo** |

### Free Tier / Credits

- New DigitalOcean accounts get **$200 in free credits for 60 days**
- GitHub Student Developer Pack includes **$200 DO credit**

---

## Quick Reference Commands

```bash
# SSH into server
ssh deploy@164.92.xxx.xxx

# Navigate to project
cd ~/dutch-learning-classes/dutch-app

# Start/stop/restart
docker compose up -d
docker compose down
docker compose restart

# Rebuild after code changes
git pull origin main
docker compose up -d --build

# View logs
docker compose logs -f
docker compose logs -f backend --tail=50

# Check health
curl localhost/api/health
curl localhost/api/health/ready

# Database shell
docker compose exec postgres psql -U dutch_admin -d dutch_app

# Container status
docker compose ps
docker stats

# Manual backup
~/backup-db.sh

# SSL certificate renewal
sudo certbot renew
docker compose restart frontend
```

---

## Deployment Checklist

Before going live, verify:

- [ ] `.env` has strong `DB_PASSWORD` and `JWT_SECRET` (generated with `openssl rand`)
- [ ] `VITE_DEMO_MODE=false` in `frontend/.env`
- [ ] `ENVIRONMENT=production` in `.env`
- [ ] `FRONTEND_ORIGIN` matches your actual domain
- [ ] All 3 containers show `Up (healthy)` in `docker compose ps`
- [ ] `curl /api/health` returns `{"status":"ok"}`
- [ ] `curl /api/health/ready` returns `{"status":"ok","database":"connected"}`
- [ ] SSL certificate is valid (`https://` works in browser)
- [ ] UFW firewall is enabled (only ports 22, 80, 443 open)
- [ ] Database backup cron job is configured
- [ ] Monitoring alerts are set up
- [ ] Swap file is configured (for Rust builds on small Droplets)

---

*Last updated: March 2026 · Dutch Learning App v0.2.0*
