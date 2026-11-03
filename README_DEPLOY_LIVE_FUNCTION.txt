LIVE RSVP CONFIRMATION FUNCTION
Function name MUST be exactly: send-rsvp-confirmation

Supabase Dashboard > Edge Functions > Deploy a new function > Via Editor
Paste index.ts and deploy.

For the live website call, JWT verification should be OFF because wedding guests are anonymous website visitors.
The function does NOT trust the browser blindly: it verifies invitation_id + the private invitation lookup_token before sending.

Required secrets:
- RESEND_API_KEY
- RSVP_FROM_EMAIL

Already has safe defaults, but you may also set:
- AMAZON_REGISTRY_URL = https://www.amazon.com/wedding/share/Tim_Dashia
- RSVP_PAGE_URL = https://dboyarsk-git.github.io/Wedding_tourney/rsvp.html
- INVITATION_IMAGE_URL = https://dboyarsk-git.github.io/Wedding_tourney/assets/tim-dashia-invitation.jpg

Health check body (no email is sent):
{"action":"health"}

Expected health response includes:
- resendConfigured: true
- supabaseAdminKeyAvailable: true
- invitationImageReachable: true AFTER the website asset is uploaded

NOTE: invitationImageReachable=false will NOT stop the email from sending in v33.
The image is no longer a Resend attachment, so an image-hosting delay cannot break the confirmation email itself.
