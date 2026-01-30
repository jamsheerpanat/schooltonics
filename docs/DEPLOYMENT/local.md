# Local Deployment Instructions

## Docker Compose Setup

### Prerequisites
- Docker Engine
- Docker Compose

### Start Services

To bring up the local infrastructure stack (Postgres, Redis, MinIO, MailHog):

```bash
cd infra/local
cp .env.example .env
docker compose up -d
```

### Check Container Status

Use `docker ps` to verify services are running:

- **octo-postgres**: Database
- **octo-redis**: Cache/Queue
- **octo-minio**: Object Storage
- **octo-mailhog**: Email Capture

### Service Access & Validating

- **Postgres**:
  - Host: `localhost`
  - Port: `5432`
  - User: `octo`
  - Password: `octo123`
  - Database: `octoschoolengine`

- **Redis**:
  - Host: `localhost`
  - Port: `6379`

- **MinIO**:
  - Console: http://localhost:9001 (User/Pass: `minioadmin` / `minioadmin123`)
  - API: http://localhost:9000

- **MailHog**:
  - UI: http://localhost:8025
  - SMTP: `localhost:1025`

### Notes

- The `octo-createbuckets` service runs a one-time script to initialize the `octoschoolengine` bucket and make it public.
