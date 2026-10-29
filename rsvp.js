
const SUPABASE_URL="https://uygotksjyqusbdoepzft.supabase.co";
const SUPABASE_KEY="sb_publishable_7946Ght6J3pY2k9UcNbkhA_dDTwn89q";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const form=document.getElementById("rsvpForm"),statusBox=document.getElementById("rsvpStatus"),submit=document.getElementById("submitRsvp");
const val=id=>String(document.getElementById(id)?.value||"").trim();
function status(msg,type="ok"){statusBox.textContent=msg;statusBox.className=`status show ${type}`;}
form?.addEventListener("submit",async e=>{
 e.preventDefault();if(val("website"))return;
 const args={p_guest_name:val("guestName"),p_email:val("email"),p_phone:val("phone"),p_attendance:val("attendance"),p_party_size:Number(document.getElementById("partySize").value||1),p_guest_names:val("guestNames"),p_message:val("message")};
 submit.disabled=true;submit.textContent="Sending…";
 try{
  const {data,error}=await sb.rpc("submit_wedding_rsvp",args);if(error)throw error;
  const code=data?.confirmation_code||"Saved";
  document.getElementById("previewGuest").textContent=args.p_guest_name;
  document.getElementById("previewCode").textContent=`Confirmation · ${code}`;
  let emailText=" Your RSVP is saved.";
  try{
   const res=await fetch(`${SUPABASE_URL}/functions/v1/send-rsvp-confirmation`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`},body:JSON.stringify({guest_name:args.p_guest_name,email:args.p_email,attendance:args.p_attendance,party_size:args.p_party_size,confirmation_code:code,date:"TBD",location:"TBD",ceremony:"TBD"})});
   emailText=res.ok?" A confirmation email was sent.":" Email delivery is not connected yet.";
  }catch{emailText=" Email delivery is not connected yet.";}
  status(`RSVP saved! Confirmation ${code}.${emailText}`,"ok");form.reset();document.getElementById("partySize").value=1;
 }catch(err){console.error(err);status("Your RSVP could not be saved. Please try again.","bad");}
 finally{submit.disabled=false;submit.textContent="Send RSVP";}
});
