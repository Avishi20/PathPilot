# PathPilot

**Don't just dream of a job. Discover the path to it.**

PathPilot is a student-first career roadmap that starts from the offer horizon and works backwards. It combines a validated onboarding profile, an adaptive milestone engine, a Career Galaxy, feasibility math, a daily planner, analytics, an educational AI Mentor, study resources, and honest Demo Mode.

## What works in this build

- **Educational AI Mentor:** text chat, Enter-to-send, quick prompts, browser microphone input when supported, Read Aloud, loading/error states, clear chat, learning level, and answers across programming, AI/ML, mathematics, college subjects, career preparation, and general study assistance.
- **Live AI + honest fallback:** `/api/mentor/chat` uses the server-side OpenAI-compatible configuration when available. If it is missing, times out, or errors, the UI labels the response **DEMO FALLBACK** and uses a lightweight educational responder.
- **Shared skills:** Voice Mentor, Study Resources, and Daily Planner use one searchable, grouped multi-select with removable chips, custom skills, duplicate prevention, and clear-all behavior.
- **Skill-aware resources:** recommendations combine selected skills and target role. Cards show title, provider/source, skill, career path, difficulty, type, access label, description, progress, and a working external link. Filters include target role, selected skill, difficulty, type, free-only, search, and clear filters.
- **Personalized planner:** Generate My Study Plan uses role, selected skills, education, preferred language, daily study hours, role resources, and a learn/practice/revise rhythm. Each generated task includes objective, duration, practice, expected outcome, and a direct resource link. Tasks can be completed, logged, filtered, and regenerated.
- **Persistence and privacy:** valid legacy storage is restored safely; invalid values fall back without crashing. Authenticated accounts use account-scoped browser keys. When **Keep data on this device** is disabled, new preferences, chats, and progress are not written locally.
- Existing PathPilot functionality remains available: onboarding, dashboard, Career Galaxy, skill checks, analytics, interview prep, settings, feasibility, readiness, and adaptive milestone status.

## Architecture

```mermaid
flowchart LR
  A[Onboarding and shared profile] --> B[Deterministic roadmap engine]
  B --> C[Career Galaxy + dashboard]
  B --> D[Planner + analytics]
  A --> E[Shared preferred skills]
  E --> F[Educational Mentor]
  E --> G[Role-aware resources]
  E --> D
  H[Server AI config] --> I[/api/mentor/chat]
  I --> F
  I --> J[Honest Demo Fallback]
  K[Account-scoped local storage] --> A
```

## Setup

```bash
npm install
npm run dev
```

The Vite client runs on port `3000` and the lightweight Express API on `8787`. Useful checks:

```bash
npm run typecheck
npm run build
npm test
```

## Live AI configuration

Copy `.env.example` to `.env` and configure a server-side OpenAI-compatible provider if desired:

```bash
OPENAI_API_KEY=your-server-only-key
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_MODEL=gpt-5-mini
```

The frontend never receives provider secrets. The live request uses a short timeout and minimal reasoning to keep the demo fast and within the 1k-credit budget. The current sandbox can also inject a compatible provider configuration without putting it in source control.

## Demo Mode and limitations

With no valid provider response, the app explicitly displays **DEMO FALLBACK**. The fallback is useful for common educational examples but is not a general model and does not guarantee correctness. Resource access labels describe the catalog metadata and should still be checked by the user. Roadmap durations, feasibility, skill gaps, and readiness are planning estimates—not hiring predictions. Account records are process-local and browser storage is not a production database.

## Manual smoke test

1. Open `/`, sign in or create a local demo account, and navigate to **Voice Mentor**.
2. Open the Skills selector, search by category, select multiple skills, remove one chip, and try a custom skill.
3. Select a learning level and ask a programming, AI/ML, mathematics, or career question. Confirm the answer is marked live or fallback.
4. Open **Study Resources** and confirm the selected skills, target role, filters, provider/source metadata, progress selector, and external links update the catalog.
5. Click **Generate My Study Plan**, open **Daily Planner**, and confirm objectives, duration, practice, outcome, and resource links appear. Mark a task complete and check the activity signal.
6. Disable **Keep data on this device**, change a skill, send a chat, and complete a task. Confirm the app remains usable without writing new local records.
7. Change the theme in Settings and inspect the selector, Mentor, resources, and planner in several of the 10 palettes.

## Future roadmap

Durable database-backed accounts, strict schema validation for provider JSON, richer JD extraction/revision diffs, a graph canvas with deeper zoom controls, printable placement-plan export, and live speech streaming can be added without changing the engine contract.

## Team credits

Built as a hackathon-ready student team prototype. Replace this line with your team name and GitHub link before submission.
