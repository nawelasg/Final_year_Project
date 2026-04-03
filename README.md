# Legal AI Assistant

Legal AI Assistant is a final year project built to help users draft and review common legal documents used in India through a guided web interface.

The application allows users to:
- sign up and log in
- choose a legal document template
- enter required details
- generate a structured draft
- review summary, validation, and risk feedback
- explain selected clauses in simpler language
- use a legal assistance chatbot
- export the final draft as a print-ready PDF

---

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- React Query
- Axios
- React Hook Form
- Zod

### Backend
- FastAPI
- Python 3.11
- Supabase
- Groq
- Sentence Transformers
- PyTorch CPU

---

## Features

- User authentication
- Guided legal document drafting
- Multiple legal document templates
- Clause explanation
- Validation report
- Risk analysis
- Legal chatbot
- Recent template history
- Print / Save PDF support

---

## Available Document Types

- Rent Agreement
- Non-Disclosure Agreement
- General Affidavit
- Employment Agreement
- Service Agreement
- Power of Attorney
- Sale Agreement
- Loan Agreement

---

## Project Structure

```text
final_year_project_v2/
├── frontend/
├── backend/
└── README.md
```

---

## Requirements

Make sure the following are installed:
- Node.js v22.21.0
- npm 10.8.3
- Python 3.11.9

Recommended environment:
- Windows
- Git Bash

**Important:**
- Do not use Python 3.14 for the backend.
- Backend virtual environment path is `backend/.venv`.

---

## Backend Setup

Open Git Bash and move to the backend folder:

```bash
cd backend
```

### 1. Create virtual environment
If `.venv` does not already exist:
```bash
python -m venv .venv
```

### 2. Activate virtual environment
On Windows Git Bash, use:
```bash
source .venv/Scripts/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create backend environment file
Create `backend/.env` with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET_KEY=your_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["http://localhost:3000"]
```

---

## Supabase Setup

This project requires Supabase for:
- authentication
- vector storage
- recent template history

Use the Supabase SQL editor and run the following:

### 1. Enable vector extension
```sql
create extension if not exists vector;
```

### 2. Create documents table
```sql
create table if not exists documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(384) not null
);
```

### 3. Create vector match function
```sql
create or replace function match_documents(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
```

### 4. Create recent template history table
```sql
create table if not exists user_template_history (
  id bigserial primary key,
  user_id uuid not null,
  template_id text not null,
  template_name text not null,
  used_at timestamptz not null default now()
);
```

---

## Load Legal Data into Supabase

With the backend virtual environment activated, run:
```bash
python scripts/load_vectors_to_supabase.py
```

This will:
- read the dataset files from `backend/data/`
- generate embeddings locally
- upload them to Supabase

To verify the number of inserted rows:
```bash
python -c "from app.core.supabase import supabase_client; res=supabase_client.table('documents').select('*', count='exact').limit(0).execute(); print(res.count)"
```

---

## Run Backend

From the backend folder with the virtual environment activated:
```bash
uvicorn app.main:app --reload
```

Backend will run at:
`http://127.0.0.1:8000`

Health check:
`http://127.0.0.1:8000/api/v1/health`

---

## Frontend Setup

Open another terminal and move to the frontend folder:
```bash
cd frontend
```

### 1. Install dependencies
```bash
npm install
```

### 2. Optional frontend environment variable
Create `frontend/.env.local` if you want to define the backend URL explicitly:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
If this file is not created, the frontend already falls back to that local backend URL.

### 3. Run frontend
```bash
npm run dev
```

Frontend will run at:
`http://localhost:3000`

---

## How to Use

1. Start the backend
2. Start the frontend
3. Open `http://localhost:3000`
4. Sign up or log in
5. Open the dashboard
6. Choose a document template
7. Fill in the required fields
8. Generate the document
9. Review:
   - AI Analysis
   - Risk Analyzer
   - Validation Report
10. Use clause explanation if needed
11. Print or save the document as PDF
12. Use the chatbot for legal drafting help

---

## Production Build Check

### Frontend
```bash
cd frontend
npm run build
```

### Backend startup check
```bash
cd backend
source .venv/Scripts/activate
uvicorn app.main:app
```

If both work, the project is in a deployment-ready state.

---

## Notes

- The project is intended for Windows with Git Bash.
- Use `source .venv/Scripts/activate`, not `bin/activate`.
- Full generated legal documents are not auto-saved by default.
- Only lightweight recent template history is stored.
- The backend uses Groq for generation and review tasks.
- Sentence Transformers are used for embeddings.
- PyTorch is CPU-based in this project.

---

## Suggested Deployment Stack

Free-tier friendly option:
- Frontend: Vercel
- Backend: Render
- Database/Auth: Supabase
