
document.addEventListener('DOMContentLoaded',()=>{
 const b=document.getElementById('dark-mode'); if(!b)return;
 const apply=()=>{const dark=localStorage.getItem('forma-theme')==='dark';document.body.classList.toggle('dark-mode',dark);b.textContent=dark?'☀️':'🌙';};
 apply();b.addEventListener('click',()=>{localStorage.setItem('forma-theme',document.body.classList.contains('dark-mode')?'light':'dark');apply();});
});
