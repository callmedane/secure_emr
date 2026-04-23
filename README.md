<<<<<<< HEAD
# Secure EMR Zero-Trust Project

This repository is now split into:

- `frontend/` - React + Vite client
- `backend/` - Flask API with JWT auth, MFA, RBAC, audit logging, and database models

## Quick start

### Option A: local student setup

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### Option B: docker-compose

```bash
docker compose up --build
```

## Demo seeded accounts

All demo passwords are `ChangeMe123!`

- Admin: `admin` (MFA secret seeded)
- Doctor: `dr.chen` (MFA secret seeded)
- Nurse: `nurse.lee` (MFA disabled by default)

For users with MFA enabled, generate the 6-digit code using the seeded secret in `backend/.env.example` or after first startup by checking the seeded database values. In a real deployment, the QR provisioning flow in the backend should be used instead of sharing secrets.
=======

  # Secure EMR System UI

  This is a code bundle for Secure EMR System UI. The original project is available at https://www.figma.com/design/o3UnNmtY3h544Ad274uVHW/Secure-EMR-System-UI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

#For committing changes
git status
git add .
git commit -m "Updated project files"
git push origin main
>>>>>>> 8e899da023205f6398a73e226588170c1658e88f
