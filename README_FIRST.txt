TIM & DASHIA — WEDDING + VOLLEYBALL SITE v1

GITHUB STRUCTURE
/
  index.html                  <- Wedding home page
  styles.css
  app.js
  /wedding/
    details.html
    rsvp.html
    rsvp.js
  /volleyball/
    index.html                <- Existing ONE WAY v60 tournament site
  /supabase/
    RUN_THIS_IN_SUPABASE_WEDDING_RSVP.sql
    /functions/send-rsvp-confirmation/index.ts

WHAT TO UPLOAD TO GITHUB
Upload index.html, styles.css, app.js, the wedding folder, and the volleyball folder.
The supabase folder can stay in GitHub too, but its SQL must also be run in Supabase.

SUPABASE
1. Open your existing ONE WAY Supabase project.
2. SQL Editor -> New query.
3. Run:
   supabase/RUN_THIS_IN_SUPABASE_WEDDING_RSVP.sql
4. The ceremony RSVP form will now save privately.

EMAIL CONFIRMATIONS
The RSVP works WITHOUT email setup; the response is still saved and a confirmation
number is shown immediately.

To actually send the matching confirmation email:
1. Create a Resend account/domain or use its test sender.
2. Add RESEND_API_KEY as a Supabase Edge Function secret.
3. Optional: add RSVP_FROM_EMAIL.
4. Deploy the function in:
   supabase/functions/send-rsvp-confirmation/index.ts

The website will automatically attempt to call that function after saving an RSVP.
If email is not configured yet, the RSVP still succeeds.

DESIGN
- Warm cream/beige vintage paper look
- NO real photos yet
- Blank photo placeholders
- Doodle construction cones
- Caution tape throughout
- Our Story opens as a popup
- “From Chestnut Parkway to forever.”
- Wedding Details: TBD
- Ceremony RSVP: separate page
- Volleyball Tournament: existing v60 site
- RSVP Your Team: jumps directly to tournament registration
