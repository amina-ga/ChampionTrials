
document.addEventListener("DOMContentLoaded", () => {
 const launcher=document.getElementById("chat-launcher"), win=document.getElementById("forma-chat-window"),
 close=document.getElementById("chat-close"), form=document.getElementById("forma-chat-form"),
 input=document.getElementById("forma-chat-input"), messages=document.getElementById("chat-messages");
 if(!launcher||!win||!form||!input||!messages)return;
 launcher.addEventListener("click",()=>win.classList.toggle("open"));
 close?.addEventListener("click",()=>win.classList.remove("open"));
 function addMessage(message,sender){const d=document.createElement("div");d.className=sender==="user"?"user-message-chat":"assistant-message";d.textContent=message;messages.appendChild(d);messages.scrollTop=messages.scrollHeight;}
 function reply(message){const t=message.toLowerCase();
  if(t.includes("focus")||t.includes("concentrate"))return "Try a 25-minute focus session, followed by a 5-minute break. 💜";
  if(t.includes("plan")||t.includes("organize"))return "Choose your three most important tasks and give each one a time slot. ✨";
  if(t.includes("motivat")||t.includes("sad"))return "You don't need to be perfect. Every small step counts! 🌷";
  if(t.includes("study")||t.includes("school"))return "Study one topic at a time, take short breaks and test yourself. 📚";
  if(t.includes("time"))return "Try time blocking: set aside time for work, breaks and yourself. ⏰";
  if(t.includes("hello")||t.includes("hey")||t.includes("hi"))return "Hey! 💜 What would you like to accomplish today?";
  if(t.includes("habit"))return "Start with one small habit and track it every day. 🌱";
  if(t.includes("break"))return "Stretch, drink water and give your mind a little rest. ☁️";
  return "Break your goal into smaller steps. What's one thing you can do right now? ✨";
 }
 function send(value){if(!value.trim())return;addMessage(value,"user");input.value="";setTimeout(()=>addMessage(reply(value),"assistant"),350);}
 form.addEventListener("submit",e=>{e.preventDefault();send(input.value);});
 document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>send(b.textContent)));
});
