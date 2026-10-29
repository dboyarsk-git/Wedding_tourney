
const SUPABASE_URL="https://uygotksjyqusbdoepzft.supabase.co";
const SUPABASE_KEY="sb_publishable_7946Ght6J3pY2k9UcNbkhA_dDTwn89q";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const form=document.getElementById("rsvpForm");
const statusBox=document.getElementById("rsvpStatus");
const submitBtn=document.getElementById("submitRsvp");

function showStatus(message,type="ok"){
  statusBox.textContent=message;
  statusBox.className=`status show ${type}`;
}
function setBusy(busy){
  submitBtn.disabled=busy;
  submitBtn.textContent=busy?"Sending…":"Send RSVP";
}
function safeString(v){return String(v??"").trim()}

form?.addEventListener("submit",async(e)=>{
  e.preventDefault();
  if(safeString(document.getElementById("website").value))return;

  const payload={
    p_guest_name:safeString(document.getElementById("guestName").value),
    p_email:safeString(document.getElementById("email").value),
    p_phone:safeString(document.getElementById("phone").value),
    p_attendance:safeString(document.getElementById("attendance").value),
    p_party_size:Number(document.getElementById("partySize").value||1),
    p_guest_names:safeString(document.getElementById("guestNames").value),
    p_message:safeString(document.getElementById("message").value)
  };

  if(!payload.p_guest_name||!payload.p_email||!payload.p_attendance){
    showStatus("Please complete your name, email, and attendance response.","bad");
    return;
  }

  setBusy(true);
  try{
    const {data,error}=await supabaseClient.rpc("submit_wedding_rsvp",payload);
    if(error)throw error;

    const result=data||{};
    document.getElementById("previewGuest").textContent=payload.p_guest_name;
    document.getElementById("previewCode").textContent=`Confirmation · ${result.confirmation_code||"Saved"}`;

    let emailNote="";
    try{
      const response=await fetch(`${SUPABASE_URL}/functions/v1/send-rsvp-confirmation`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "apikey":SUPABASE_KEY,
          "Authorization":`Bearer ${SUPABASE_KEY}`
        },
        body:JSON.stringify({
          guest_name:payload.p_guest_name,
          email:payload.p_email,
          attendance:payload.p_attendance,
          party_size:payload.p_party_size,
          confirmation_code:result.confirmation_code||"",
          date:"TBD",
          location:"TBD",
          ceremony:"TBD"
        })
      });
      if(response.ok){
        emailNote=" A confirmation email was also sent.";
      }else{
        emailNote=" Your RSVP is saved; email delivery is not connected yet.";
      }
    }catch{
      emailNote=" Your RSVP is saved; email delivery is not connected yet.";
    }

    showStatus(`RSVP saved! Confirmation ${result.confirmation_code||""}.${emailNote}`,"ok");
    form.reset();
    document.getElementById("partySize").value=1;
  }catch(err){
    console.error(err);
    showStatus("Your RSVP could not be saved. Please try again or contact Tim & Dashia.","bad");
  }finally{
    setBusy(false);
  }
});
