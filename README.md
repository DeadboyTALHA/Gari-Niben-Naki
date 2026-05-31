# Gari Niben Naki - Car Rental System

A full-stack car rental web application built with FastAPI, PostgreSQL, and Next.js.

## Tech Stack
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Auth:** JWT (JSON Web Tokens)
- **Storage:** Cloudinary (images)

## User Roles
- **Customer** – Browse and book cars
- **Owner** – List cars for rent
- **Admin** – Manage the entire platform

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your values
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Access
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

## License
MIT