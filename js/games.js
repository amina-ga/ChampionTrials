
document.addEventListener('DOMContentLoaded',()=>{
// Memory match
const start=document.querySelector('#memory-start'),board=document.querySelector('#memory-board'),mout=document.querySelector('#memory-output');
if(start){start.onclick=()=>{board.innerHTML='';mout.textContent='Moves: 0';let vals=['🌸','⭐','💜','🌙','🍓','☁️','🌸','⭐','💜','🌙','🍓','☁️'].sort(()=>Math.random()-.5),first=null,lock=false,moves=0,found=0;
 vals.forEach(v=>{let b=document.createElement('button');b.className='memory-tile';b.textContent='?';b.onclick=()=>{if(lock||b.disabled||b===first)return;b.textContent=v;if(!first){first=b;return;}moves++;mout.textContent=`Moves: ${moves}`;if(first.textContent===v){first.disabled=b.disabled=true;first.classList.add('matched');b.classList.add('matched');first=null;found+=2;if(found===vals.length){mout.textContent=`You matched them all in ${moves} moves! 🎉`;window.FormaProfile?.recordGame('Memory Match',`${moves} moves`);}}else{lock=true;let old=first;first=null;setTimeout(()=>{old.textContent='?';b.textContent='?';lock=false;},650);}};board.appendChild(b);});};}
// Maths
let answer=null,round=0,score=0;const mq=document.querySelector('#math-q'),mi=document.querySelector('#math-input'),mb=document.querySelector('#math-check'),mo=document.querySelector('#math-out');
function nextMath(){let a=1+Math.floor(Math.random()*15),b=1+Math.floor(Math.random()*15),op=['+','−','×'][Math.floor(Math.random()*3)];answer=op==='+'?a+b:op==='−'?a-b:a*b;mq.textContent=`${a} ${op} ${b} = ?`;mi.value='';mb.textContent='Check answer';}
if(mb)mb.onclick=()=>{if(answer===null){round=score=0;nextMath();mo.textContent='Question 1 of 10';return;}if(mi.value===''){mo.textContent='Enter an answer first.';return;}if(Number(mi.value)===answer)score++;round++;answer=null;if(round===10){mq.textContent='Challenge complete!';mo.textContent=`Your score: ${score}/10 🏆`;mb.textContent='Play again';window.FormaProfile?.recordGame('Quick Maths',`${score}/10`);}else{mo.textContent=`Score: ${score} · Question ${round+1} of 10`;nextMath();}};
// Typing
let typingStarted=0;const ti=document.querySelector('#typing-text'),tp=document.querySelector('#typing-prompt'),tb=document.querySelector('#typing-check'),to=document.querySelector('#typing-out');
if(ti)ti.oninput=()=>{if(!typingStarted&&ti.value)typingStarted=Date.now();};
if(tb)tb.onclick=()=>{let target=tp.textContent;if(ti.value.trim()!==target){to.textContent='Not quite yet — match the sentence exactly.';return;}let mins=Math.max((Date.now()-typingStarted)/60000,.01),wpm=Math.round(target.split(/\s+/).length/mins);to.textContent=`${wpm} words per minute. Great work!`;window.FormaProfile?.recordGame('Typing Sprint',`${wpm} WPM`);typingStarted=0;ti.value='';};
// Scramble
const words=['PURPLE','FOCUS','PLANET','FLOWER','GARDEN','CREATE'];let word='';
const sw=document.querySelector('#scramble-word'),si=document.querySelector('#scramble-input'),sb=document.querySelector('#scramble-check'),so=document.querySelector('#scramble-out');
if(sb)sb.onclick=()=>{if(!word){word=words[Math.floor(Math.random()*words.length)];sw.textContent=word.split('').sort(()=>Math.random()-.5).join('');sb.textContent='Check word';so.textContent='';return;}if(si.value.trim().toUpperCase()===word){so.textContent='Correct! ✨';window.FormaProfile?.recordGame('Word Scramble','Solved');word='';sb.textContent='Next word';}else so.textContent='Try again!';};
// Sequence
const sq=document.querySelector('#sequence-q'),sqi=document.querySelector('#sequence-input'),sqb=document.querySelector('#sequence-check'),sqo=document.querySelector('#sequence-out');let seq=0;
if(sqb)sqb.onclick=()=>{if(!seq){seq=1+Math.floor(Math.random()*8);let step=seq%2?3:5,start=seq%2?2:4;sq.dataset.answer=String(start+step*4);sq.textContent=`${start}, ${start+step}, ${start+2*step}, ${start+3*step}, ?`;sqo.textContent='';sqb.textContent='Check';return;}sqo.textContent=Number(sqi.value)===Number(sq.dataset.answer)?'You got it! 🎉':`Not quite — the answer was ${sq.dataset.answer}.`;if(Number(sqi.value)===Number(sq.dataset.answer))window.FormaProfile?.recordGame('Number Sequence','Correct');seq=0;sqb.textContent='Try another';sqi.value='';};
// Reaction
const rb=document.querySelector('#reaction-start'),pad=document.querySelector('#reaction-pad'),ro=document.querySelector('#reaction-out');let ready=false,goAt=0,timeout=null;
if(rb){rb.onclick=()=>{clearTimeout(timeout);ready=false;pad.style.background='#f5e7df';pad.textContent='Wait for green…';ro.textContent='';timeout=setTimeout(()=>{ready=true;goAt=performance.now();pad.style.background='#dff3e4';pad.textContent='CLICK NOW!';},1200+Math.random()*3000);};pad.onclick=()=>{if(!ready){if(timeout){clearTimeout(timeout);timeout=null;ro.textContent='Too soon! Try again.';}return;}const ms=Math.round(performance.now()-goAt);ro.textContent=`Your reaction time: ${ms} ms ⚡`;window.FormaProfile?.recordGame('Reaction Test',`${ms} ms`);ready=false;pad.textContent='Nice reaction!';};}
});
