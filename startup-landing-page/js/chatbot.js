
const launcher = document.getElementById("chat-launcher");
const chatWindow = document.getElementById("forma-chat-window");
const closeChat = document.getElementById("chat-close");
const chatForm = document.getElementById("forma-chat-form");
const chatInput = document.getElementById("forma-chat-input");
const messages = document.getElementById("chat-messages");

launcher.addEventListener("click", () => {
    chatWindow.classList.toggle("open");
});

closeChat.addEventListener("click", () => {
    chatWindow.classList.remove("open");
});

function addMessage(message, sender) {
    const div = document.createElement("div");

    div.className = sender === "user"
        ? "user-message-chat"
        : "assistant-message";

    div.textContent = message;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function getReply(message) {
    const text = message.toLowerCase();

    if (text.includes("focus") || text.includes("concentrate")) {
        return "Try the 25-minute rule! 💜 Work without distractions for 25 minutes, then take a 5-minute break.";
    }

    if (text.includes("plan") || text.includes("organize")) {
        return "Let's organize your day! ✨ Write down your 3 most important tasks, prioritize them and give each one a time slot.";
    }

    if (text.includes("motivat") || text.includes("sad")) {
        return "Remember: You don't need to be perfect. You just need to start. Every small step counts! 🌷";
    }

    if (text.includes("study") || text.includes("school")) {
        return "Here's a study tip! 📚 Study one topic at a time, take short breaks and test yourself instead of only rereading notes.";
    }

    if (text.includes("time")) {
        return "Try time blocking! Divide your day into blocks for studying, work, breaks and personal time. Protect your free time too. ⏰";
    }

    if (text.includes("hello") || text.includes("hey") || text.includes("hi")) {
        return "Hey! 💜 So happy you're here. What would you like to accomplish today?";
    }

    if (text.includes("habit")) {
        return "Start small! Choose one habit, connect it to something you already do, and track your progress every day. 🌱";
    }

    if (text.includes("thank")) {
        return "You're very welcome! Keep making progress. You've got this! 💜";
    }

    if (text.includes("break")) {
        return "Take a little break! Stretch, drink some water, look away from your screen and give your mind a rest. ☁️";
    }

    return "That's interesting! ✨ Try breaking your goal into smaller steps. What's the first small thing you can do today?";
}

function sendMessage(message) {
    if (!message.trim()) return;

    addMessage(message, "user");

    chatInput.value = "";

    setTimeout(() => {
        addMessage(getReply(message), "assistant");
    }, 500);
}

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
});

document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        sendMessage(button.textContent);
    });
});
