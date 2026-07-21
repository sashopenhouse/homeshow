---
name: vercel-supabase-env
description: Homeshow deploys to Vercel; Supabase NEXT_PUBLIC env vars must be set there too or auth fails with "Failed to fetch"
metadata:
  type: project
---

The Homeshow site (GitHub: sashopenhouse/homeshow) deploys to Vercel. The Supabase creds (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) live only in the local, gitignored `.env.local`. Because `NEXT_PUBLIC_*` vars are inlined at build time, they must ALSO be set in Vercel's Environment Variables and the site redeployed — otherwise `src/lib/supabase.ts` falls back to a placeholder URL and every Supabase call (login, password reset, vendor feed) fails in the browser with "Failed to fetch".

This bit the deployed admin login and the password-reset flow; fixed 2026-07-21 by adding the two vars in Vercel and redeploying. The Supabase project also requires email confirmation (`mailer_autoconfirm=false`), so admin users must be created/confirmed in the Supabase dashboard (Authentication → Users, "Auto Confirm User"). See [[push-workflow]].
