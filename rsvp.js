
const SUPABASE_URL="https://uygotksjyqusbdoepzft.supabase.co";
const SUPABASE_KEY="sb_publishable_7946Ght6J3pY2k9UcNbkhA_dDTwn89q";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const form=document.getElementById("rsvpForm");
const statusBox=document.getElementById("rsvpStatus");
const submit=document.getElementById("submitRsvp");

function text(id){return String(document.getElementById(id)?.value||"").trim()}
function status(message,type="ok"){
  statusBox.textContent=message;
  statusBox.className=`status show ${type}`;
}

form?.addEventListener("submit",async e=>{
  e.preventDefault();
  if(text("website"))return;

  const args={
    p_guest_name:text("guestName"),
    p_email:text("email"),
    p_phone:text("phone"),
    p_attendance:text("attendance"),
    p_party_size:Number(document.getElementById("partySize").value||1),
    p_guest_names:text("guestNames"),
    p_message:text("message")
  };

  submit.disabled=true;submit.textContent="Sending…";

  try{
    const {data,error}=await sb.rpc("submit_wedding_rsvp",args);
    if(error)throw error;

    const code=data?.confirmation_code||"Saved";
    document.getElementById("previewGuest").textContent=args.p_guest_name;
    document.getElementById("previewCode").textContent=`Confirmation · ${code}`;

    let emailMsg=" Your RSVP is saved.";
    try{
      const response=await fetch(`${SUPABASE_URL}/functions/v1/send-rsvp-confirmation`,{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`},
        body:JSON.stringify({
          guest_name:args.p_guest_name,email:args.p_email,attendance:args.p_attendance,
          party_size:args.p_party_size,confirmation_code:code,date:"TBD",location:"TBD",ceremony:"TBD"
        })
      });
      emailMsg=response.ok?" A confirmation email was sent.":" Email delivery is not connected yet.";
    }catch{emailMsg=" Email delivery is not connected yet.";}

    status(`RSVP saved! Confirmation ${code}.${emailMsg}`,"ok");
    form.reset();document.getElementById("partySize").value=1;
  }catch(err){
    console.error(err);
    status("Your RSVP could not be saved. Please try again.","bad");
  }finally{
    submit.disabled=false;submit.textContent="Send RSVP";
  }
});
