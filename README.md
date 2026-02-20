# ERPify

ERPify is a multi-tenant academic ERP system focused on scalable student
onboarding and academic record management.

------------------------------------------------------------------------

## 🏗 Project Structure

    ERPify/
    │
    ├── backend/     # FastAPI + Supabase (Dockerized)
    └── frontend/    # React + Vite

------------------------------------------------------------------------

# 🐳 Backend Setup (Docker)

## 📁 Backend Structure

    backend/
    ├── app/
    │   └── main.py
    ├── requirements.txt
    ├── .env
    └── Dockerfile

------------------------------------------------------------------------

## ⚙️ Step 1: Create Environment File

Inside `backend/`, create a `.env` file:

    DATABASE_URL=YOUR_SUPABASE_DATABASE_URL

Replace `YOUR_SUPABASE_DATABASE_URL` with your Supabase PostgreSQL
connection string (preferably the connection pooler URL).

------------------------------------------------------------------------

## 🐳 Step 2: Create Dockerfile

Inside `backend/`, create a file named `Dockerfile` and add:

``` dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

------------------------------------------------------------------------

## 🏗 Step 3: Build Docker Image

From the project root:

``` bash
cd backend
docker build -t erpify-backend .
```

------------------------------------------------------------------------

## ▶️ Step 4: Run the Backend

### Windows (CMD)

``` bash
docker run -p 8000:8000 --env-file .env -v %cd%:/app erpify-backend
```

### Git Bash / Mac / Linux

``` bash
docker run -p 8000:8000 --env-file .env -v $(pwd):/app erpify-backend
```

------------------------------------------------------------------------

## 🌐 Access Backend API

    http://localhost:8000/docs

------------------------------------------------------------------------

# 🎨 Frontend Setup (React + Vite)

## 📁 Frontend Structure

    frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.ts

------------------------------------------------------------------------

## ⚙️ Step 1: Install Dependencies

``` bash
cd frontend
npm install
```

------------------------------------------------------------------------

## ▶️ Step 2: Run Development Server

``` bash
npm run dev
```

Open:

    http://localhost:5173/

------------------------------------------------------------------------

## 🔌 Backend Connection

Inside `frontend/`, create a `.env` file:

    VITE_API_URL=http://localhost:8000


------------------------------------------------------------------------

# 🚀 Production Build

``` bash
npm run build
```

Build output will be inside:

    frontend/dist/

------------------------------------------------------------------------

# ✅ Current Features

-   Multi-tenant Institution architecture
-   Department & Course management
-   Role-based Users (Admin / Faculty / Student)
-   Student Enrollment
-   Attendance Tracking
-   Attendance Summary
-   Grade structure (extendable to GPA system)

------------------------------------------------------------------------

# 🚀 Future Improvements

-   Enrollment validation logic
-   Automated attendance summary updates
-   GPA calculation endpoint
-   Role-based authentication (OAuth / JWT)
-   Full production deployment setup
