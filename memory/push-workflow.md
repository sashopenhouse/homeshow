---
name: push-workflow
description: On Homeshow, "push" means commit straight to main — solo repo, no branch/PR flow
metadata:
  type: feedback
---

When the user says "push" on the Homeshow project, commit directly to `main` and `git push origin main` — do not create a feature branch or PR.

**Why:** it's a solo project (owner: sashopenhouse) whose entire history is direct-to-main, and a push to main triggers the Vercel deploy. Branching would defeat the intent of "push".

**How to apply:** stage the relevant work, make one descriptive commit (with the `Co-Authored-By: Claude` trailer), push to origin/main. Always confirm `.env.local` stays gitignored so keys are never committed. Related: [[vercel-supabase-env]].
