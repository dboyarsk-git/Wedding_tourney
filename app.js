
const menu=document.querySelector(".menu");
const nav=document.querySelector(".navlinks");
menu?.addEventListener("click",()=>nav?.classList.toggle("open"));
document.querySelectorAll(".navlinks a,.navlinks button").forEach(el=>el.addEventListener("click",()=>nav?.classList.remove("open")));

const story=document.getElementById("storyModal");
document.querySelectorAll("[data-story-open]").forEach(el=>el.addEventListener("click",()=>story?.classList.add("open")));
document.querySelectorAll("[data-story-close]").forEach(el=>el.addEventListener("click",()=>story?.classList.remove("open")));
story?.addEventListener("click",e=>{if(e.target===story)story.classList.remove("open")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")story?.classList.remove("open")});
