TIM & DASHIA WEDDING SITE v3

THIS IS THE RESTARTED STRUCTURE YOU ASKED FOR.

ROOT HOMEPAGE
  index.html
  Tim & Dashia cover page = the actual main website.
  Home, Our Story, Details, RSVP, Volleyball Tournament all belong to this same design.

OUR STORY
  Lives on the homepage.
  Learn More opens a popup.

DETAILS
  Lives on the homepage for now.
  Date / Location / Ceremony / Attire are TBD.

RSVP
  rsvp.html
  Separate wedding ceremony RSVP page.
  Supabase SQL is included in /supabase.

VOLLEYBALL TOURNAMENT
  /volleyball/index.html
  The working v60 tournament engine is embedded as the tournament side of the wedding website.
  Clicking Volleyball Tournament lands directly on REGISTER TEAM.
  Teams, Schedule, Standings, Bracket, Admin and protected scoring remain available.
  The entire public interface is reskinned to match the Tim & Dashia cover page.

WEDDING BRAND CLEANUP
  Public Christian church / ONE WAY Conference / Church of New Hope / John 14:6 language was removed.
  Old editable rule text still stored in Supabase is automatically sanitized at display time.
  Old ONE WAY / conference prize text is automatically displayed as Wedding Bash prize language.
  Internal technical identifiers and legacy admin reset compatibility remain untouched where changing
  them could break the existing backend.

GITHUB
Upload the CONTENTS of this ZIP to the ROOT of the Wedding_tourney repository.

SUPABASE
Tournament:
  No changes required if your v60 tournament backend is already working.

Ceremony RSVP:
  Run /supabase/RUN_THIS_IN_SUPABASE_WEDDING_RSVP.sql once.

Email confirmations:
  RSVP saving works without email.
  To send emails, deploy /supabase/functions/send-rsvp-confirmation/index.ts
  and configure RESEND_API_KEY.


MARK 10:9
Integrated into:
- Main Tim & Dashia homepage hero
- Homepage footer
- Ceremony RSVP confirmation card preview
- RSVP confirmation email template
- Wedding Bash tournament hero as a subtle wedding tie-in

Verse:
“Therefore what God has joined together, let no one separate.”
— Mark 10:9
