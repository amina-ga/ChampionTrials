document.addEventListener('DOMContentLoaded',()=>{
 const grid=document.querySelector('#calendar-grid'),label=document.querySelector('#month-label'),selectedLabel=document.querySelector('#selected-date'),form=document.querySelector('#event-form'),list=document.querySelector('#event-list');
 if(!grid)return;
 let view=new Date(),selected=new Date(),events=JSON.parse(localStorage.getItem('forma-calendar-events')||'{}');
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const save=()=>localStorage.setItem('forma-calendar-events',JSON.stringify(events));
 const notify=(title,body)=>{if('Notification'in window&&Notification.permission==='granted')new Notification(title,{body});else{let toast=document.createElement('div');toast.className='forma-reminder-toast';toast.textContent=`⏰ ${title}: ${body}`;document.body.append(toast);setTimeout(()=>toast.remove(),12000);}};
 let reminderTimers=[];
 function scheduleReminders(){
  reminderTimers.forEach(clearTimeout);reminderTimers=[];
  Object.entries(events).forEach(([date,items])=>items.forEach(ev=>{
   if(!ev.time||ev.reminder===-1)return;
   const when=new Date(`${date}T${ev.time}:00`).getTime()-(Number(ev.reminder??10)*60000),delay=when-Date.now();
   if(delay>0&&delay<2147480000)reminderTimers.push(setTimeout(()=>notify('Upcoming: '+ev.title,`${ev.time} · ${ev.type}`),delay));
  }));
 }
 function renderEvents(){
  const k=key(selected);selectedLabel.textContent=selected.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});list.innerHTML='';
  (events[k]||[]).forEach((ev,i)=>{let row=document.createElement('div');row.className='event-item';let info=document.createElement('span');info.textContent=`${ev.time?ev.time+' · ':''}${ev.title} (${ev.type})${ev.reminder===-1?' · no reminder':` · reminder ${ev.reminder??10}m before`}`;let del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Delete event');del.onclick=()=>{events[k].splice(i,1);if(!events[k].length)delete events[k];save();render();};row.append(info,del);list.append(row);});
  if(!(events[k]||[]).length){let p=document.createElement('p');p.className='muted';p.textContent='Nothing planned yet. Add an event above.';list.append(p);}
 }
 const preview=document.createElement('div');
 preview.className='calendar-hover-preview';
 preview.setAttribute('role','tooltip');
 preview.hidden=true;
 document.body.append(preview);
 function showDayPreview(anchor,date,items){
  preview.replaceChildren();
  const heading=document.createElement('strong');
  heading.textContent=date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  preview.append(heading);
  items.forEach(ev=>{
   const item=document.createElement('div');item.className='calendar-preview-event';
   const time=document.createElement('span');time.className='calendar-preview-time';time.textContent=ev.time||'Any time';
   const title=document.createElement('span');title.className='calendar-preview-title';title.textContent=ev.title;
   const category=document.createElement('small');category.textContent=ev.type||'Event';
   item.append(time,title,category);preview.append(item);
  });
  preview.hidden=false;
  const rect=anchor.getBoundingClientRect();
  const width=Math.min(280,window.innerWidth-24);
  let left=Math.min(Math.max(12,rect.left),window.innerWidth-width-12);
  let top=rect.bottom+8;
  if(top+preview.offsetHeight>window.innerHeight-12)top=Math.max(12,rect.top-preview.offsetHeight-8);
  preview.style.width=`${width}px`;preview.style.left=`${left}px`;preview.style.top=`${top}px`;
 }
 function hideDayPreview(){preview.hidden=true;}
 window.addEventListener('scroll',hideDayPreview,{passive:true});
 window.addEventListener('resize',hideDayPreview);
 function render(){
  grid.innerHTML='';label.textContent=view.toLocaleDateString(undefined,{month:'long',year:'numeric'});['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(x=>{let d=document.createElement('div');d.className='calendar-weekday';d.textContent=x;grid.append(d);});
  let first=new Date(view.getFullYear(),view.getMonth(),1),start=new Date(first);start.setDate(1-first.getDay());let today=key(new Date());
  for(let i=0;i<42;i++){
   let d=new Date(start);d.setDate(start.getDate()+i);
   let k=key(d),dayEvents=events[k]||[],b=document.createElement('button');
   b.className='calendar-day'+(d.getMonth()!==view.getMonth()?' outside':'')+(k===today?' today':'')+(k===key(selected)?' selected':'');
   b.type='button';
   b.setAttribute('aria-label',`${d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}${dayEvents.length?`: ${dayEvents.map(ev=>`${ev.time?ev.time+' ':''}${ev.title}`).join(', ')}`:', no events'}`);
   let num=document.createElement('span');num.textContent=d.getDate();b.append(num);
   if(dayEvents.length){
    let small=document.createElement('small');small.textContent=`✦ ${dayEvents.length} event${dayEvents.length>1?'s':''}`;b.append(small);
    b.classList.add('has-events');
    b.addEventListener('mouseenter',e=>showDayPreview(b,d,dayEvents));
    b.addEventListener('focus',()=>showDayPreview(b,d,dayEvents));
    b.addEventListener('mouseleave',hideDayPreview);
    b.addEventListener('blur',hideDayPreview);
   }
   b.onclick=()=>{selected=d;hideDayPreview();render();};
   grid.append(b);
  }
  renderEvents();
 }
 document.querySelector('#prev-month').onclick=()=>{view.setMonth(view.getMonth()-1);render();};
 document.querySelector('#next-month').onclick=()=>{view.setMonth(view.getMonth()+1);render();};
 form.onsubmit=async e=>{
  e.preventDefault();let title=document.querySelector('#event-title').value.trim();if(!title)return;
  if('Notification'in window&&Notification.permission==='default'){try{await Notification.requestPermission();}catch{}}
  let k=key(selected);(events[k]??=[]).push({title,time:document.querySelector('#event-time').value,type:document.querySelector('#event-type').value,reminder:Number(document.querySelector('#event-reminder')?.value??10)});
  save();form.reset();render();scheduleReminders();
 };
 scheduleReminders();
 render();
});