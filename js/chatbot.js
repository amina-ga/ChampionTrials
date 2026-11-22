
document.addEventListener("DOMContentLoaded", () => {

    // Get chat elements
    const launcher = document.getElementById("chat-launcher");
    const chatWindow = document.getElementById("forma-chat-window");
    const closeButton = document.getElementById("chat-close");
    const form = document.getElementById("forma-chat-form");
    const input = document.getElementById("forma-chat-input");
    const messages = document.getElementById("chat-messages");

    // Make sure all essential elements exist
    if (!launcher || !chatWindow || !form || !input || !messages) {
        console.warn("Forma Chat: Some HTML elements are missing.");
        return;
    }

    // Open chat
    launcher.addEventListener("click", () => {
        chatWindow.classList.toggle("open");

        if (chatWindow.classList.contains("open")) {
            input.focus();
        }
    });

    // Close chat
    closeButton?.addEventListener("click", () => {
        chatWindow.classList.remove("open");
    });

    // Add messages to chat
    function addMessage(message, sender) {
        const div = document.createElement("div");

        div.className = sender === "user"
            ? "user-message-chat"
            : "assistant-message";

        div.textContent = message;

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    // Forma assistant responses
    function reply(message) {
        const text = message.toLowerCase();

        if (text.includes("hello") || text.includes("hey") || text.includes("hi")) {
            return "Hey lovely! 💜 Welcome back to Forma. What would you like to work on today?";
        }

        if (text.includes("focus") || text.includes("concentrate")) {
            return "Let's focus together! ✨ Try working for 25 minutes, then take a 5-minute break. You've got this!";
        }

        if (text.includes("plan") || text.includes("organize")) {
            return "Let's get organized! 🌷 Write down your three biggest priorities and give each one a time slot.";
        }

        if (text.includes("motivat") || text.includes("sad")) {
            return "Remember, you don't have to have everything figured out. Small steps are still progress. Be proud of yourself! 💗";
        }

        if (text.includes("study") || text.includes("school")) {
            return "Time to study! 📚 Choose one topic, put away distractions, and use short study sessions with breaks.";
        }

        if (text.includes("time")) {
            return "Try time blocking! ⏰ Set aside specific moments for studying, working, relaxing and taking care of yourself.";
        }

        if (text.includes("habit")) {
            return "New habits start small! 🌱 Choose one easy habit, connect it to something you already do, and track your progress.";
        }

        if (text.includes("break") || text.includes("tired")) {
            return "Take a little moment for yourself. ☁️ Stretch, drink some water, breathe deeply and give your mind a rest.";
        }

        if (text.includes("goal") || text.includes("dream")) {
            return "Your dreams deserve a plan! ✨ Break your goal into tiny steps and focus on completing just the first one.";
        }

        if (text.includes("thank")) {
            return "Always happy to help! 💜 Keep growing at your own pace.";
        }

        return "That's something we can work on together! 🌸 Try breaking it into smaller steps. What's one little thing you can do right now?";
    }

    // Send a message
    function sendMessage(value) {

        const message = value.trim();

        if (!message) return;

        addMessage(message, "user");

        input.value = "";

        // Show assistant response
        setTimeout(() => {
            const response = reply(message);
            addMessage(response, "assistant");
        }, 400);
    }

    // Handle form submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        sendMessage(input.value);
    });

    // Handle suggestion buttons
    document.querySelectorAll(".suggestion").forEach(button => {

        button.addEventListener("click", () => {
            sendMessage(button.textContent);
        });

    });

    // Close chat with Escape key
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            chatWindow.classList.remove("open");
        }
    });

});

