# ERPify

ERPify is a multi-tenant academic ERP system focused on scalable student onboarding and academic record management.

---

# 🐳 Backend Setup (Docker)

## 📁 Project Structure

```
ERPify/
│
└── backend/
    ├── app/
    │   └── main.py
    ├── requirements.txt
    ├── .env
    └── Dockerfile
```

---

## ⚙️ Step 1: Create Environment File

Inside `backend/`, create a `.env` file:

```
DATABASE_URL=YOUR_SUPABASE_DATABASE_URL
```

Replace `YOUR_SUPABASE_DATABASE_URL` with your Supabase PostgreSQL connection string.

---

## 🐳 Step 2: Create Dockerfile

Inside `backend/`, create a file named:

```
Dockerfile
```

Add the following content:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

## 🏗 Step 3: Build Docker Image

From the project root:

```
cd backend
docker build -t erpify-backend .
```

---

## ▶️ Step 4: Run the Backend

### Windows (CMD)

```
docker run -p 8000:8000 --env-file .env -v %cd%:/app erpify-backend
```

### Git Bash

```
docker run -p 8000:8000 --env-file .env -v $(pwd):/app erpify-backend
```

---

## 🌐 Access API

Open:

```
http://localhost:8000/docs
```

---

## 🔄 Development Notes

- Code changes auto-reload (`--reload` enabled).
- No need to install dependencies locally.
- Supabase database remains external (no database container needed).

---

## 🚀 Production Changes

For production:

1. Remove `--reload` from Dockerfile
2. Add `COPY . .` after installing requirements
3. Remove `-v` volume mount when running container