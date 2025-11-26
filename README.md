# 📘 School Portal Assignment

A full-stack school portal built with Node.js, Express, SQLite, Firebase Authentication, and Vanilla JS frontend.

This system includes:
- 👨‍🎓 **Student Portal** – login, courses, grades, filtering
- 👩‍💼 **Admin Portal** – manage students, courses, and grade logs
- 🔒 **JWT authentication** via Firebase Admin SDK
- 🗄️ **SQLite database** (better-sqlite3)
- 📚 **REST API** with Swagger documentation
- 🧪 **Automated Jest tests** + isolated test database
- ⚙️ **GitHub Actions CI** to run migrations, seed, and tests

## 📁 Project Structure

```
school-portal-assignment/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── server.ts
│   ├── database.sqlite
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/
│   ├── *.html
│   ├── css/
│   ├── js/
│   └── firebaseConfig.js
│
└── .github/workflows/ci.yml   (GitHub Actions)
```

## 🚀 Features

### ⭐ Student Portal
- Login with Firebase Auth
- View courses + grades
- Filter by year or course
- Session persists via local/session storage
- Logout

### ⭐ Admin Portal
- Admin login
- Register new grades
- Filter grades by course or year
- View complete grade log
- View and manage all students
- Delete students
- Edit student data
- Secure admin-only API routes

### ⭐ Backend API
- Express 5 router
- Zod validation
- Firebase Admin SDK authentication
- SQLite database
- Migrations + Seeding
- Swagger UI documentation

### ⭐ Testing
- Jest + ts-jest
- Separate test.sqlite so tests never touch real data
- Automatic migration + seed for test DB

## 🔧 Backend Setup

### 1️⃣ Go into backend folder
```bash
cd backend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create .env file

Inside `/backend`, create:

```env
FIREBASE_ADMIN_CRED={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"..."}
```

⚠️ **Make sure this is all on one line (stringified JSON).**

### 4️⃣ Run migrations
```bash
npm run migrate
```

### 5️⃣ Seed the database
```bash
npm run seed
```

### 6️⃣ Start the development server
```bash
npm run dev
```

Your backend runs at: **http://localhost:3000**

### 📘 Swagger API Docs

After running the backend, open: **http://localhost:3000/api/docs**

This displays all API endpoints including:
- `/api/health`
- `/api/students/me`
- `/api/students/me/courses`
- `/api/admin/students`
- `/api/admin/courses`
- `/api/admin/grades`

## 🖥 Frontend Setup

No build tools required. Just serve the frontend directory:

### Option A — VS Code Live Server
Right-click `index.html` → Open with Live Server

### Option B — Python dev server
```bash
cd frontend
python3 -m http.server
```

Visit: **http://localhost:8000**

## 🔐 Login Credentials

### Admin account (comes from seed script)
- **Email:** `admin@example.com`
- **Password:** (whatever you set in Firebase Authentication)

## 🔥 Firebase Authentication Setup

You must enable:
1. Email/password authentication
2. At least one student user
3. One admin user (same email as in seed data)

Then generate a Firebase Admin SDK private key, and paste it into `.env` as `FIREBASE_ADMIN_CRED`.

## 🧪 Running Tests

Tests run inside the backend only:

```bash
cd backend
npm test
```

During testing, Jest automatically:
- ✔ Deletes old `test.sqlite`
- ✔ Runs migrations
- ✔ Runs seed
- ✔ Runs all tests in `/tests`

Your development DB is never touched.

## 🤖 GitHub Actions — CI Pipeline

Your workflow file is at: `.github/workflows/ci.yml`

On every push to master, it:
1. Installs Node (18, 20, 22)
2. Installs SQLite
3. Installs backend dependencies
4. Applies migrations
5. Seeds the test DB
6. Runs Jest test suite

If all steps pass, the workflow succeeds.

## 🛠 Scripts Overview

### Backend (/backend)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API with ts-node-dev |
| `npm run migrate` | Apply DB migrations |
| `npm run seed` | Seed the SQLite DB |
| `npm test` | Run Jest test suite |
| `npm run start` | Run compiled server in production |
| `npm run build` | Compile TypeScript to /dist |

## 🧱 Technology Stack

### Backend
- Node.js / Express
- SQLite (better-sqlite3)
- TypeScript
- Firebase Admin SDK
- Zod validator
- Swagger UI
- Jest + ts-jest

### Frontend
- HTML / CSS / JavaScript
- Firebase Auth SDK
- Fetch API
- Vanilla routing

### DevOps
- GitHub Actions CI
- dotenv
- ESLint + Prettier

## 🎯 Summary

This project is a complete full-stack school portal with secure authentication, admin dashboards, database migrations, real API documentation, automated testing, and continuous integration.

You're ready to run, develop, test, and deploy the application!