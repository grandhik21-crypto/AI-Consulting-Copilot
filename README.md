# AI Consulting Copilot

## Prerequisites

- Python 3.11+
- Node.js 18+

---

## Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### Health Check

```bash
curl http://localhost:8000/api/health
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

The Vite dev server proxies `/api` requests to the backend at `http://localhost:8000`.

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic layer
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── database/            # DB connection & session
│   │   └── utils/               # Utility functions
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Frontend  | React 18 + Vite + Tailwind CSS |
| Backend   | Python FastAPI                 |
| Database  | SQLite (via SQLAlchemy + aiosqlite) |
