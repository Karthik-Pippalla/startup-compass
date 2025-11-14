# Startup Compass

A MERN + Firebase multi-agent workspace that validates a founder prompt, gathers missing context via a questionnaire, and routes a refined brief through marketing, developer, funding, competitor, and checklist agents.

## Architecture

- **Backend (`backend/`)** – Node/Express API with MongoDB, Firebase Admin bootstrap, and a modular agent pipeline. Validation collects structured data, then the orchestrator runs the four domain-specific agents followed by the checklist/timeline builder.
- **Frontend (`frontend/`)** – React + Vite dashboard to submit prompts, complete questionnaires, and monitor agent output in real time. Firebase client config is stubbed for future auth/hosting work.

### Agent Flow
1. **Validation Agent** – Ensures required brief fields exist; produces questionnaire prompts when context is missing.
2. **Marketing / Developer / Funding / Competitor Agents** – Generate insights using heuristics + funder keyword matching (Mongo model, seeded sample data, FB similarity placeholder).
3. **Checklist Agent** – Consolidates prior outputs into a structured project timeline.

All agent runs are persisted on the `Job` document (`agentOutputs`, `history`) plus an `AgentRun` log for observability.

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB (local or Atlas)
- Firebase project (optional until you wire auth/storage)

### Backend
```bash
cd backend
cp .env.example .env   # update Mongo URI, OpenAI key, Firebase creds
npm install
npm run dev            # requires MongoDB running locally
```
Key endpoints:
- `POST /api/jobs` – create prompt workspace.
- `POST /api/jobs/:id/answers` – submit questionnaire answers.
- `GET /api/jobs/:id` – poll status + outputs.
- `POST /api/funders` / `GET /api/funders` – manage funder knowledge base.

### Frontend
```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL to backend URL
npm install
npm run dev
```
The UI shows prompt creation, outstanding questions, agent results, and the generated timeline.

## Firebase Touchpoints
- `backend/src/config/firebase.js` initializes Admin SDK when credentials are provided.
- `frontend/src/lib/firebase.ts` exposes a helper to initialize the Firebase client SDK for hosting/auth.

## Project Structure Highlights
```
backend/
  src/config      # env/db/firebase setup
  src/models      # Job, AgentRun, Funder schemas
  src/services    # agent implementations + orchestrator
  src/routes      # Express routers
frontend/
  src/components  # Prompt form, questionnaire, outputs, timeline
  src/lib         # API + firebase helpers
  src/types       # Shared front-end types
```

## Next Steps
1. Swap heuristic agents with actual LLM/tool integrations (LangChain, function-calling OpenAI, web scraping workers).
2. Persist job state in Firestore for realtime UI updates or hook into Firebase Auth.
3. Add automated tests (unit + integration) covering validation loops and funder matching.
4. Containerize services and wire CI for lint/test/build.
