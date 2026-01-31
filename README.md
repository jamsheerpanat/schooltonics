# OctoSchoolEngine

# OctoSchoolEngine

Next-generation school operating system

## Getting Started

### Prerequisites

- Docker Desktop / Engine
- Node.js & NPM
- PHP 8.2+ & Composer

### 1. Infrastructure (Local)

Start the local database, cache, and storage services:

```bash
cd infra/local
cp .env.example .env
docker compose up -d
```

### 2. Backend (API)

Initialize the Laravel API:

```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Access the health check:
`GET http://localhost:8000/api/v1/health`

### 3. Frontend (Web)

*Coming soon*

### 4. Mobile

*Coming soon*
# deploy test
# runner online test
