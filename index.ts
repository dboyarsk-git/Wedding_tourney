import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSupabaseSecretKey() {
  // Current hosted Supabase Edge Functions expose SUPABASE_SECRET_KEYS as JSON.
  // Keep the legacy service-role fallback too, so this survives older projects.
  try {
    const raw = Deno.env.get("SUPABASE_SECRET_KEYS") || "{}";
    const parsed = JSON.parse(raw);
    if (parsed?.default) return String(parsed.default);
  } catch (_) {
    // Fall through to the legacy injected key.
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function buildPlainText(invitation: any, attending: string[], declined: string[], registryUrl: string, rsvpPageUrl: string) {
  return [
    "Tim & Dashia",
    "",
    "We received your RSVP ♡",
    "Thank you for letting us know. We're so excited to celebrate with you.",
    "",
    "ATTENDING",
    attending.length ? attending.map((n) => `- ${n}`).join("\n") : "None",
    "",
    "UNABLE TO ATTEND",
    declined.length ? declined.map((n) => `- ${n}`).join("\n") : "None",
    "",
    `Confirmation code: ${invitation.confirmation_code || "Saved"}`,
    "",
    `Amazon Registry: ${registryUrl}`,
    `View / Update RSVP: ${rsvpPageUrl}`,
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "POST required" }, 405);

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
  const RSVP_FROM_EMAIL = Deno.env.get("RSVP_FROM_EMAIL") || "Tim & Dashia <onboarding@resend.dev>";
  const AMAZON_REGISTRY_URL = Deno.env.get("AMAZON_REGISTRY_URL") || "https://www.amazon.com/wedding/share/Tim_Dashia";
  const RSVP_PAGE_URL = Deno.env.get("RSVP_PAGE_URL") || "https://dboyarsk-git.github.io/Wedding_tourney/rsvp.html";
  const INVITATION_IMAGE_URL = Deno.env.get("INVITATION_IMAGE_URL") || "https://dboyarsk-git.github.io/Wedding_tourney/assets/tim-dashia-invitation.jpg";

  let body: any = {};
  try { body = await req.json(); } catch (_) { return json({ ok: false, error: "Invalid JSON body" }, 400); }

  // Safe config/health check. Does not expose secret values and does not send an email.
  if (body?.action === "health") {
    let imageReachable = false;
    let imageStatus = 0;
    try {
      const imageCheck = await fetch(INVITATION_IMAGE_URL, { method: "GET" });
      imageStatus = imageCheck.status;
      imageReachable = imageCheck.ok;
      try { await imageCheck.body?.cancel(); } catch (_) {}
    } catch (_) {}

    return json({
      ok: true,
      resendConfigured: Boolean(RESEND_API_KEY),
      fromConfigured: Boolean(RSVP_FROM_EMAIL),
      registryConfigured: Boolean(AMAZON_REGISTRY_URL),
      rsvpPageConfigured: Boolean(RSVP_PAGE_URL),
      invitationImageReachable: imageReachable,
      invitationImageStatus: imageStatus,
      supabaseAdminKeyAvailable: Boolean(getSupabaseSecretKey()),
      note: "Health check only — no email was sent.",
    });
  }

  if (!RESEND_API_KEY) return json({ ok: false, error: "RESEND_API_KEY is not configured" }, 500);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const secretKey = getSupabaseSecretKey();
  if (!supabaseUrl || !secretKey) return json({ ok: false, error: "Supabase admin key is unavailable" }, 500);

  const invitationId = String(body?.invitation_id || "");
  const lookupToken = String(body?.lookup_token || "");
  if (!invitationId || !lookupToken) return json({ ok: false, error: "Invitation verification is required" }, 400);

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: invitation, error: invitationError } = await admin
    .from("wedding_invitations")
    .select("id,household_name,primary_contact_name,contact_email,confirmation_code,lookup_token,confirmation_email_status,rsvp_submitted_at")
    .eq("id", invitationId)
    .eq("lookup_token", lookupToken)
    .maybeSingle();

  if (invitationError || !invitation) return json({ ok: false, error: "Invitation verification failed" }, 403);
  if (!invitation.rsvp_submitted_at) return json({ ok: false, error: "RSVP has not been submitted" }, 409);

  const email = String(invitation.contact_email || "").trim().toLowerCase();
  if (!email) return json({ ok: true, sent: false, skipped: true, reason: "no_email" });

  if (invitation.confirmation_email_status === "sent") {
    return json({ ok: true, sent: false, skipped: true, reason: "already_sent", email });
  }

  const [{ data: guests, error: guestsError }, { data: plusOnes, error: plusError }] = await Promise.all([
    admin.from("wedding_invited_guests").select("full_name,attendance,guest_order").eq("invitation_id", invitation.id).order("guest_order"),
    admin.from("wedding_plus_one_guests").select("slot_number,guest_name,attendance").eq("invitation_id", invitation.id).order("slot_number"),
  ]);

  if (guestsError || plusError) return json({ ok: false, error: "Could not load RSVP details" }, 500);

  const attending: string[] = [];
  const declined: string[] = [];
  for (const guest of guests || []) {
    const name = String(guest.full_name || "Guest");
    if (guest.attendance === "yes") attending.push(name);
    if (guest.attendance === "no") declined.push(name);
  }
  for (const guest of plusOnes || []) {
    const name = String(guest.guest_name || `Plus-One ${guest.slot_number}`);
    if (guest.attendance === "yes") attending.push(name);
    if (guest.attendance === "no") declined.push(name);
  }

  const listHtml = (names: string[]) => names.length
    ? `<ul style="margin:8px 0 0;padding-left:20px">${names.map((name) => `<li style="margin:5px 0">${escapeHtml(name)}</li>`).join("")}</ul>`
    : `<div style="margin-top:8px;color:#7b6b5f">None</div>`;

  // IMPORTANT DEBUG FIX:
  // The invitation is a normal remote <img>, not a Resend attachment.
  // If GitHub's image is temporarily unavailable, the EMAIL STILL SENDS.
  // The image can load later when the client retries it.
  const emailHtml = `
  <div style="margin:0;padding:28px 12px;background:#efe4d3">
    <div style="max-width:650px;margin:0 auto;background:#fbf5ea;border:1px solid #d8c6ad">
      <div style="padding:30px 24px 12px;text-align:center;color:#3c2a21">
        <div style="font-family:Georgia,serif;font-size:12px;letter-spacing:.22em;text-transform:uppercase">Tim &amp; Dashia</div>
        <h1 style="font-family:Georgia,serif;font-size:34px;font-weight:normal;margin:12px 0 4px">We received your RSVP ♡</h1>
        <p style="font-family:Georgia,serif;font-size:18px;line-height:1.55;margin:10px auto;max-width:520px">Thank you for letting us know. We’re so excited to celebrate with you.</p>
      </div>

      <div style="padding:12px 22px;text-align:center">
        <img src="${escapeHtml(INVITATION_IMAGE_URL)}" alt="Tim and Dashia wedding invitation" style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto;border:0">
        <div style="margin-top:8px;font-family:Georgia,serif;font-size:12px;color:#78685b">
          <a href="${escapeHtml(INVITATION_IMAGE_URL)}" style="color:#6b1f2a">View invitation image</a>
        </div>
      </div>

      <div style="padding:20px 32px;color:#3c2a21;font-family:Georgia,serif;font-size:17px;line-height:1.5">
        <div style="margin-bottom:18px"><strong>Attending</strong>${listHtml(attending)}</div>
        <div style="margin-bottom:18px"><strong>Unable to attend</strong>${listHtml(declined)}</div>
        <div style="padding:14px 0;border-top:1px solid #d8c6ad;border-bottom:1px solid #d8c6ad">Confirmation code: <strong>${escapeHtml(invitation.confirmation_code)}</strong></div>
        <div style="text-align:center;padding:24px 0 8px">
          <a href="${escapeHtml(AMAZON_REGISTRY_URL)}" style="display:inline-block;margin:6px;padding:14px 20px;background:#6b1f2a;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold;letter-spacing:.04em">View Amazon Registry</a>
          <a href="${escapeHtml(RSVP_PAGE_URL)}" style="display:inline-block;margin:6px;padding:14px 20px;background:#6b1f2a;color:#fff;text-decoration:none;font-family:Georgia,serif;font-weight:bold;letter-spacing:.04em">View / Update RSVP</a>
        </div>
        <p style="text-align:center;color:#78685b;font-size:14px;line-height:1.5;margin-top:18px">If your plans change, use the RSVP button above to update your party.</p>
      </div>
    </div>
  </div>`;

  const textBody = buildPlainText(invitation, attending, declined, AMAZON_REGISTRY_URL, RSVP_PAGE_URL);

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RSVP_FROM_EMAIL,
        to: [email],
        subject: "We received your RSVP ♡ | Tim & Dashia",
        html: emailHtml,
        text: textBody,
      }),
    });

    const raw = await resendResponse.text();
    let resendData: any = {};
    try { resendData = raw ? JSON.parse(raw) : {}; } catch (_) { resendData = { message: raw }; }

    if (!resendResponse.ok) {
      const message = resendData?.message || resendData?.error || `Resend returned HTTP ${resendResponse.status}`;
      await admin.from("wedding_invitations").update({
        confirmation_email_status: "failed",
        confirmation_email_last_error: String(message).slice(0, 1000),
      }).eq("id", invitation.id);
      return json({ ok: false, error: message, resend_status: resendResponse.status }, 502);
    }

    const providerId = String(resendData?.id || "");
    await admin.from("wedding_invitations").update({
      confirmation_email_status: "sent",
      confirmation_email_sent_at: new Date().toISOString(),
      confirmation_email_provider_id: providerId || null,
      confirmation_email_last_error: null,
    }).eq("id", invitation.id);

    return json({ ok: true, sent: true, email, provider_id: providerId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await admin.from("wedding_invitations").update({
      confirmation_email_status: "failed",
      confirmation_email_last_error: message.slice(0, 1000),
    }).eq("id", invitation.id);
    return json({ ok: false, error: message }, 500);
  }
});
