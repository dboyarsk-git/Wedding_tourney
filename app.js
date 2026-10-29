
const menuBtn=document.querySelector(".mobile-menu");
const navLinks=document.querySelector(".nav-links");
menuBtn?.addEventListener("click",()=>navLinks?.classList.toggle("open"));
document.querySelectorAll(".nav-links a,.nav-links button").forEach(el=>{
  el.addEventListener("click",()=>navLinks?.classList.remove("open"));
});

const storyModal=document.getElementById("storyModal");
document.querySelectorAll("[data-open-story]").forEach(btn=>{
  btn.addEventListener("click",()=>storyModal?.classList.add("open"));
});
document.querySelectorAll("[data-close-story]").forEach(btn=>{
  btn.addEventListener("click",()=>storyModal?.classList.remove("open"));
});
storyModal?.addEventListener("click",e=>{
  if(e.target===storyModal)storyModal.classList.remove("open");
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape")storyModal?.classList.remove("open");
});
