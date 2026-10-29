TIM & DASHIA — WEDDING + TOURNAMENT WEBSITE v2

THIS VERSION CHANGES THE ARCHITECTURE:

ROOT WEBSITE
  /index.html
  This is the actual Tim & Dashia homepage and matches the beige paper/construction concept.

WEDDING FOLDER
  /wedding/details.html
  /wedding/rsvp.html
  Wedding information and ceremony RSVP.

VOLLEYBALL FOLDER
  /volleyball/index.html
  This is the full ONE WAY v60 tournament engine, but visually redesigned to match the wedding site.
  Scoring, Admin, registration, standings, bracket and auto-advance logic are preserved.

  /volleyball/theme.css
  The wedding-theme override for the tournament sub-site.

NAVIGATION
  Volleyball Tournament -> /volleyball/index.html
  RSVP Your Team -> /volleyball/index.html?view=register
  Tournament sub-site has a permanent "Tim & Dashia Home" link back to the wedding site.

IMPORTANT
The tournament sub-site still points to the SAME existing Supabase project and does NOT reset tournament data.
Its v60 scoring/backend behavior is preserved.

GITHUB
Upload the CONTENTS of this ZIP to the ROOT of the Wedding_tourney repository.
Do not upload the outer TIM_DASHIA_WEDDING_TOURNEY_v2 folder as one nested folder.

SUPABASE — CEREMONY RSVP
Run:
  /supabase/RUN_THIS_IN_SUPABASE_WEDDING_RSVP.sql

This creates the private wedding_rsvps table and submit_wedding_rsvp RPC.

EMAIL
Ceremony RSVP saving works without email.
For automatic confirmation emails, deploy:
  /supabase/functions/send-rsvp-confirmation/index.ts
and add RESEND_API_KEY as an Edge Function secret.

TOURNAMENT BACKEND
The package contains BACKUP_v60_TOURNAMENT_BACKEND.sql only as a backup.
If your existing v60 Supabase backend is already working, DO NOT rerun/reset anything for the tournament just to deploy this visual redesign.
