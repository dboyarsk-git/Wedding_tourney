TEST FUNCTION — RUN THIS BEFORE A REAL RSVP
Function name: test-rsvp-confirmation

Purpose:
- Tests Resend API key
- Tests sender address
- Tests the invitation image URL
- Tests the Amazon Registry link
- Tests the Back to RSVP link
- Does NOT read or change a wedding RSVP

TEMPORARY TEST SECRET:
CONFIRMATION_TEST_EMAIL = your own email address

Use the email address associated with your Resend account for the first test if you are still using onboarding@resend.dev.
For production emails to guests, use a sender address on a verified domain.

Deploy this function from Supabase Dashboard > Edge Functions > Via Editor.
For easiest testing, JWT verification can be OFF temporarily because this function can ONLY send to the fixed CONFIRMATION_TEST_EMAIL secret.
Delete this test function after testing is complete.

STEP 1 — CONFIG CHECK (sends nothing)
Request body:
{"action":"check"}

STEP 2 — SEND TEST EMAIL
Request body:
{"action":"send"}

Your registry button should open:
https://www.amazon.com/wedding/share/Tim_Dashia

Your RSVP button should open:
https://dboyarsk-git.github.io/Wedding_tourney/rsvp.html

The function will still send if invitationImageReachable=false; that check only tells us whether the image is already live on GitHub.
