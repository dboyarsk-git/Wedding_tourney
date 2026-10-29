
const menu=document.querySelector(".mobile");
const nav=document.querySelector(".navlinks");
menu?.addEventListener("click",()=>nav?.classList.toggle("open"));
document.querySelectorAll(".navlinks a").forEach(a=>a.addEventListener("click",()=>nav?.classList.remove("open")));
const modal=document.getElementById("storyModal");
document.getElementById("storyMore")?.addEventListener("click",()=>modal?.classList.add("open"));
document.getElementById("storyClose")?.addEventListener("click",()=>modal?.classList.remove("open"));
modal?.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("open")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")modal?.classList.remove("open")});
