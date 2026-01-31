# OctoSchoolEngine - V1.0.1 Polished

> Next-generation school operating system for modern education management.

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![Status](https://img.shields.io/badge/status-production_ready-green.svg)

## 🚀 Features

### Core Modules
- **Academic Management**: Years, Grades, Sections, Subjects.
- **People**: robust profiles for Students, Teachers, Guardians, and Staff.
- **Attendance**: Fast daily flows for teachers, real-time updates for parents.
- **Finance**: Fee structures, dues tracking, and receipt generation.

### Experience Polish (v1.0.1)
- **Teacher App**: 
  - "My Day" dashboard with skeletal loading.
  - Offline-first feel with smart caching.
- **Student/Parent App**: 
  - "Today" view for instant timetable access.
  - Clear fee status indicators ("Outstanding", "Paid").
- **Principal Dashboard**: 
  - High-level health metrics.
  - Actionable alerts for missing attendance.
- **Office Operations**:
  - Operational reports with intuitive empty states.

## 🛠 Getting Started

### Prerequisites
- Docker Desktop / Engine
- Node.js & NPM
- PHP 8.2+ & Composer

### 1. Infrastructure (Local)
Start database & cache:
```bash
cd infra/local
cp .env.example .env
docker compose up -d
```

### 2. Backend (API)
Initialize Laravel:
```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. Frontend (Web)
Launch Next.js dashboard:
```bash
cd apps/web
npm install
npm run dev
```

### 4. Mobile App
Launch Flutter app:
```bash
cd apps/mobile
flutter pub get
flutter run
```

## 🎮 Demo Mode

Want to try it out quickly? Reset the database to a clean demo state:

```bash
# In apps/api directory
php artisan demo:reset
```

**Demo Credentials:**
| Role      | Email                      | Password |
|-----------|----------------------------|----------|
| Principal | principal@octoschool.com   | password |
| Teacher   | teacher1@octoschool.com    | password |
| Student   | student1@octoschool.com    | password |
| Parent    | parent1@octoschool.com     | password |

## 📡 Notifications
The system triggers FCM push notifications for:
- Attendance (Absent alerts)
- Class Notes & Homework
- Announcements & Events

---
**Released**: 2026-01-31
