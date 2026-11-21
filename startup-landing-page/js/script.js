
// DARK MODE
const darkButton = document.getElementById("dark-mode");

darkButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const dark = document.body.classList.contains("dark");

    darkButton.textContent = dark ? "☀️" : "🌙";

    localStorage.setItem("forma-theme", dark ? "dark" : "light");
});

if (localStorage.getItem("forma-theme") === "dark") {
    document.body.classList.add("dark");
    darkButton.textContent = "☀️";
}


// TASK MANAGER
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("forma-tasks") || "[]");

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        if (task.completed) span.style.textDecoration = "line-through";

        const remove = document.createElement("button");
        remove.textContent = "×";
        remove.type = "button";

        remove.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
        });

        label.append(checkbox, span);
        li.append(label, remove);
        taskList.appendChild(li);
    });
}

function saveTasks() {
    localStorage.setItem("forma-tasks", JSON.stringify(tasks));
    renderTasks();
}

document.getElementById("add-task").addEventListener("click", () => {
    const value = taskInput.value.trim();

    if (!value) return;

    tasks.push({ text: value, completed: false });
    taskInput.value = "";
    saveTasks();
});

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        document.getElementById("add-task").click();
    }
});

renderTasks();


// POMODORO TIMER
let remaining = 25 * 60;
let timerInterval = null;

const timerDisplay = document.getElementById("timer");
const timerStatus = document.getElementById("timer-status");

function updateTimer() {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

document.getElementById("start-timer").addEventListener("click", () => {
    if (timerInterval) return;

    timerStatus.textContent = "Focus session in progress!";

    timerInterval = setInterval(() => {
        if (remaining > 0) {
            remaining--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            timerStatus.textContent = "Session complete! Take a break.";
            alert("Great job! Your focus session is complete.");
        }
    }, 1000);
});

document.getElementById("pause-timer").addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStatus.textContent = "Timer paused.";
});

document.getElementById("reset-timer").addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    remaining = 25 * 60;
    updateTimer();
    timerStatus.textContent = "Ready for another session?";
});

updateTimer();


// MATH GAME
document.getElementById("math-game").addEventListener("click", () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;

    const question = document.getElementById("math-question");
    const result = document.getElementById("math-result");
    const answer = document.getElementById("math-answer");

    if (question.dataset.answer) {
        result.textContent =
            Number(answer.value) === Number(question.dataset.answer)
            ? "Correct! Well done."
            : "Not quite! Try another question.";

        question.dataset.answer = "";
        answer.value = "";
        return;
    }

    question.textContent = `${a} + ${b} = ?`;
    question.dataset.answer = a + b;
    result.textContent = "";
    answer.focus();
});


// TYPING GAME
document.getElementById("typing-game").addEventListener("click", () => {
    const sentence = document.getElementById("typing-sentence").textContent;
    const input = document.getElementById("typing-input").value;
    const result = document.getElementById("typing-result");

    if (input === sentence) {
        result.textContent = "Perfect! Excellent accuracy.";
    } else {
        result.textContent = "Not quite. Check your spelling and try again.";
    }
});


// SIGNUP DEMO
document.getElementById("signup-form").addEventListener("submit", event => {
    event.preventDefault();

    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;

    if (password !== confirm) {
        alert("Your passwords do not match.");
        return;
    }

    alert("Signup interface working! A real account requires a backend.");
});


// LOGIN DEMO
document.getElementById("login-form").addEventListener("submit", event => {
    event.preventDefault();
    alert("Login interface working! Connect a backend for real authentication.");
});


// FORGOT PASSWORD DEMO
document.getElementById("forgot-form").addEventListener("submit", event => {
    event.preventDefault();
    alert("Password recovery requires a connected email service.");
});
