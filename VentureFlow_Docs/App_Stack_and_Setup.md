# VentureFlow App Stack & Setup Guide

## Technology Stack

This project is a modern web application built with a **Monorepo** structure, separating the backend and frontend.

### Backend (`ventureflow-backend`)
- **Framework**: [Laravel 12.0](https://laravel.com/) (PHP)
- **Language**: PHP ^8.2
- **Database**: SQLite (Default)
  - *Note*: The default configuration uses SQLite, but Laravel supports MySQL, PostgreSQL, etc.
- **Authentication**: Laravel Sanctum
- **Key Dependencies**:
  - `spatie/laravel-permission`: Role & Permission management
  - `maatwebsite/excel`: Excel export/import
  - `opcodesio/log-viewer`: Log viewing utility

### Frontend (`ventureflow-frontend`)
- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: Zustand
- **UI Components**: Headless UI, Radix UI
- **Language**: TypeScript

---

## Database Status
- **Database Driver**: SQLite
- **Database File**: Found at `ventureflow-backend/database/database.sqlite` (Size: ~344KB)
- **Migrations**: The presence of the SQLite file and size suggests migrations have likely been run.

---

## How to Preview the App

To run the application locally, you need to start both the backend and frontend servers.

### 1. Start the Backend (Laravel)
Open a terminal and run:

```bash
cd "c:/Code Projects/VentureFlow/VentureFlow Codes/ventureflow-backend"

# If you haven't installed dependencies yet:
composer install

# Start the server
php artisan serve
```
The backend will usually run on `http://localhost:8000`.

### 2. Start the Frontend (React/Vite)
Open a **new** terminal window and run:

```bash
cd "c:/Code Projects/VentureFlow/VentureFlow Codes/ventureflow-frontend"

# If you haven't installed dependencies yet:
npm install

# Start the dev server
npm run dev
```
The frontend will usually run on `http://localhost:5173` (check the terminal output).

### 3. Access the App
Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

---

## Further Development Notes
- **API Communication**: The frontend likely communicates with the backend via API endpoints. Ensure `FRONTEND_URL` in backend `.env` and API base URLs in frontend are correctly configured if you experience CORS or connection issues.
- **Environment**: Check `.env` files in both directories for custom configurations.
