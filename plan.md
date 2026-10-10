# PathPilot implementation plan

## Outcome
Build a demo-ready career roadmapping web app that reverse-engineers a student's path from a target role and deadline, with honest Demo Mode, adaptive local state, and a polished Career Galaxy interface. Optimize for the three-minute judge flow and stay within a 1k-credit budget by using deterministic local demo data and no generated imagery.

## Implementation approach
- **Frontend:** React + Vite + TypeScript with a compact feature-oriented structure. Use CSS tokens rather than a large UI dependency tree. The app is a single-page experience with route-like views for Dashboard, Career Galaxy, Analytics, Weekly Mission, Mentor, Settings, and Onboarding.
- **State:** a small Zustand-like store implemented with React context/reducer and localStorage persistence. The roadmap engine is pure TypeScript in `src/lib/engine.ts`; it computes status, progress, readiness, feasibility, deadlines, weekly plan, skill gaps, and change history from profile + roadmap + progress.
- **Demo data:** hand-authored Full-Stack product-company, Data Analyst, and ML Engineer scenarios. All AI/demo outputs are visibly labelled. The landing page and demo controls load a real sample profile rather than a fake network response.
- **Server:** a minimal Express-compatible Node server exposes `/api/health`, `/api/roadmap/generate`, and `/api/mentor/chat` with deterministic Demo Mode responses. The client safely falls back to local generation if the server is unavailable. No API keys are shipped to the browser.
- **Validation:** shared TypeScript guard functions validate milestone IDs, prerequisites, positive effort, phase membership, and acyclic dependencies before rendering. The app never presents an unvalidated roadmap.
- **Budget discipline:** no image generation, no external search, no paid provider calls, no database requirement, and no unnecessary animation or library weight. Provider status is honest and the current experience is fully useful without a key.

## Design direction
- **Design Movement:** dark “mission control” dashboard meets a tactile skill-tree game board—Linear-level precision with a little cosmic wonder.
- **Core Principles:** (1) show the path, not a wall of advice; (2) make every estimate explainable; (3) keep the student in control; (4) use personality in microcopy, not decoration.
- **Color Philosophy:** deep navy creates focus and reduces visual noise; electric mint is the ownable “forward motion” color; violet marks machine assistance; amber marks trade-offs without panic.
- **Layout Paradigm:** a persistent left rail and wide working canvas. The graph is the central spatial model; supporting cards orbit it rather than replacing it with a dense grid.
- **Signature Elements:** compass/paper-plane mark, glowing galaxy nodes with orbital phase bands, and the Offer Horizon deadline line.
- **Interaction Philosophy:** each action produces a visible consequence—progress, unlocked work, changed feasibility, or a “What changed and why” entry. Panels preserve graph context.
- **Animation:** 150–250ms ease-out transitions; calm node glow and one-time completion pulse; no looping motion except the active-path flow. Respect reduced motion.
- **Typography:** Inter for interface hierarchy; JetBrains Mono for dates, hours, and data labels. Headlines are compact and declarative, body copy is conversational.
- **Brand Essence:** “A reverse-engineered career plan for students who want an honest next step.” Personality: candid, energetic, grounded.
- **Brand Voice:** headlines say “Start at the offer. Work backwards.” and “Your next best move is smaller than you think.” Avoid guarantees and label estimates.
- **Wordmark & logo:** a custom inline SVG path shaped like a compass needle/paper plane with a terminal node; wordmark is paired with a small “PATH / PILOT” mono label.
- **Signature Brand Color:** `#20D6C2` mint, used only for progress, focus, and forward motion.

## Project structure
```
pathpilot/
  plan.md, TODO.md, package.json, tsconfig.json, vite.config.ts, index.html
  public/manus-routes.json
  src/
    main.tsx, App.tsx, styles.css
    types.ts, demoData.ts, store.tsx, lib/engine.ts
    components/{BrandMark,Shell,Galaxy,StatCard,VoiceMentor,Modal}.tsx
    pages/{Landing,Onboarding,Dashboard,Roadmap,Analytics,Planner,Mentor,Settings}.tsx
  server/index.mjs
  .env.example, README.md, app.config.ts
```

## Frontend/backend serving
The Vite dev server serves the client on the managed preview port. A lightweight Node server is started by the same `npm run dev` command on an adjacent port for health, generation, and mentor endpoints; the client uses relative `/api/*` calls in production and local deterministic fallbacks in Demo Mode. A production build emits `dist/` for static hosting; the demo remains functional if API calls are unavailable.

## Required behavior carried into the build
Onboarding is resumable and sample-profile friendly. The roadmap graph is touch/keyboard usable, searchable and filterable, with a detail panel and status actions. Backward scheduling uses the deadline and T-minus phase markers. Time Machine and JD Decoder update local state with explicit diffs. Analytics uses real progress/logged time only. Weekly planner derives tasks from prerequisites and priority. Voice falls back to text when browser speech APIs are unavailable. Every AI/demo/estimate claim is labelled, no employment guarantee is implied, and destructive settings actions are confirmed.
