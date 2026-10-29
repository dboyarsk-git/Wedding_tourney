
const menuButton=document.getElementById("menuButton");
const navLinks=document.getElementById("navLinks");
menuButton?.addEventListener("click",()=>navLinks?.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a=>{
  a.addEventListener("click",()=>navLinks?.classList.remove("open"));
});
