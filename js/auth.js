/* Forma local profile prototype.
   Important: this is browser-local profile selection, not secure server authentication. */
(()=>{
 const PROFILE_KEY='forma-profiles', SESSION_KEY='forma-active-profile';
 const nativeGet=Storage.prototype.getItem, nativeSet=Storage.prototype.setItem, nativeRemove=Storage.prototype.removeItem;
 const active=()=>nativeGet.call(localStorage,SESSION_KEY);
 const scoped=k=>k.startsWith('forma-')&&!['forma-profiles','forma-active-profile','forma-theme'].includes(k)&&active()?`forma-user:${active()}:${k}`:k;
 Storage.prototype.getItem=function(k){return nativeGet.call(this,scoped(String(k)));};
 Storage.prototype.setItem=function(k,v){return nativeSet.call(this,scoped(String(k)),v);};
 Storage.prototype.removeItem=function(k){return nativeRemove.call(this,scoped(String(k)));};
 window.FormaProfile={
  current(){const id=active();return id?(JSON.parse(nativeGet.call(localStorage,PROFILE_KEY)||'{}')[id]||null):null;},
  signIn(name,email){const id=email.trim().toLowerCase();const profiles=JSON.parse(nativeGet.call(localStorage,PROFILE_KEY)||'{}');profiles[id]={id,name:name.trim(),email:id};nativeSet.call(localStorage,PROFILE_KEY,JSON.stringify(profiles));nativeSet.call(localStorage,SESSION_KEY,id);},
  signOut(){nativeRemove.call(localStorage,SESSION_KEY);},
  recordGame(game,score){const rows=JSON.parse(localStorage.getItem('forma-game-records')||'[]');rows.push({game,score,at:new Date().toISOString()});localStorage.setItem('forma-game-records',JSON.stringify(rows));},
  summary(){const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return []}};
   const events=read('forma-calendar-events');return {tasks:read('forma-space-tasks').length,events:Object.values(events).reduce((n,a)=>n+a.length,0),games:read('forma-game-records').length};}
 };
 document.addEventListener('DOMContentLoaded',()=>{
  const signup=document.querySelector('#signup-form'),login=document.querySelector('#login-form');
  if(signup)signup.addEventListener('submit',e=>{e.preventDefault();const pass=document.querySelector('#password')?.value||'',confirm=document.querySelector('#confirm-password')?.value||'';if(pass!==confirm){alert('Your passwords do not match.');return;}FormaProfile.signIn(document.querySelector('#fullname').value,document.querySelector('#email').value);location.href='profile.html';});
  if(login)login.addEventListener('submit',e=>{e.preventDefault();const email=document.querySelector('#login-email').value.trim().toLowerCase();const profiles=JSON.parse(nativeGet.call(localStorage,PROFILE_KEY)||'{}');if(!profiles[email]){alert('No local Forma profile was found for that email. Create a profile first.');return;}nativeSet.call(localStorage,SESSION_KEY,email);location.href='profile.html';});
  const form=document.querySelector('#profile-form');if(!form)return;
  const signedOut=document.querySelector('#profile-signed-out'),signedIn=document.querySelector('#profile-signed-in');
  const refresh=()=>{const p=FormaProfile.current();signedOut.hidden=!!p;signedIn.hidden=!p;if(p){document.querySelector('#profile-avatar').textContent=(p.name[0]||'F').toUpperCase();document.querySelector('#profile-display-name').textContent=`Welcome, ${p.name}!`;document.querySelector('#profile-display-email').textContent=p.email;const s=FormaProfile.summary();document.querySelector('#profile-task-count').textContent=s.tasks;document.querySelector('#profile-event-count').textContent=s.events;document.querySelector('#profile-game-count').textContent=s.games;}};
  form.addEventListener('submit',e=>{e.preventDefault();FormaProfile.signIn(document.querySelector('#profile-name').value,document.querySelector('#profile-email').value);refresh();});
  document.querySelector('#profile-switch').addEventListener('click',()=>{FormaProfile.signOut();refresh();});
  refresh();
 });
})();