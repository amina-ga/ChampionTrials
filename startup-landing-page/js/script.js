
document.addEventListener("DOMContentLoaded", () => {

    // DARK MODE

    const darkModeButton = document.getElementById("dark-mode");

    if (darkModeButton) {

        const savedTheme = localStorage.getItem("forma-theme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
        }

        function updateThemeButton() {
            const isDark = document.body.classList.contains("dark-mode");

            darkModeButton.textContent = isDark ? "☀️" : "🌙";
        }

        updateThemeButton();

        darkModeButton.addEventListener("click", () => {

            document.body.classList.toggle("dark-mode");

            const theme = document.body.classList.contains("dark-mode")
                ? "dark"
                : "light";

            localStorage.setItem("forma-theme", theme);

            updateThemeButton();

        });
    }

});


document.addEventListener("DOMContentLoaded", () => {

    // WEEKLY PLANNER

    const taskInput = document.getElementById("task-input");
    const addTask = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");

    let selectedDay = "monday";

    const savedTasks = JSON.parse(
        localStorage.getItem("forma-tasks") || "{}"
    );

    function saveTasks() {
        localStorage.setItem(
            "forma-tasks",
            JSON.stringify(savedTasks)
        );
    }

    function renderTasks() {

        taskList.innerHTML = "";

        const tasks = savedTasks[selectedDay] || [];

        tasks.forEach((task, index) => {

            const li = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;

            const text = document.createElement("span");
            text.textContent = task.text;

            if (task.completed) {
                text.style.textDecoration = "line-through";
            }

            checkbox.addEventListener("change", () => {
                task.completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "×";
            deleteButton.type = "button";

            deleteButton.addEventListener("click", () => {
                savedTasks[selectedDay].splice(index, 1);
                saveTasks();
                renderTasks();
            });

            li.append(checkbox, text, deleteButton);
            taskList.appendChild(li);

        });
    }

    addTask.addEventListener("click", () => {

        const value = taskInput.value.trim();

        if (!value) {
            alert("Please enter a task!");
            return;
        }

        if (!savedTasks[selectedDay]) {
            savedTasks[selectedDay] = [];
        }

        savedTasks[selectedDay].push({
            text: value,
            completed: false
        });

        saveTasks();
        renderTasks();

        taskInput.value = "";

    });

    taskInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            addTask.click();
        }
    });

    // WEEKDAY SELECTION

    document.querySelectorAll(".week-days .day").forEach(day => {

        day.addEventListener("click", () => {

            selectedDay = day.getAttribute("href").substring(1);

            document.querySelectorAll(".day-content").forEach(content => {
                content.style.display =
                    content.id === selectedDay ? "block" : "none";
            });

            document.querySelectorAll(".week-days .day").forEach(link => {
                link.classList.toggle("active", link === day);
            });

            renderTasks();

        });

    });

    document.querySelectorAll(".day-content").forEach(content => {
        content.style.display =
            content.id === "monday" ? "block" : "none";
    });

    renderTasks();

});


    // POMODORO TIMER

    const timer = document.getElementById("timer");
    const start = document.getElementById("start-timer");
    const pause = document.getElementById("pause-timer");
    const reset = document.getElementById("reset-timer");
    const status = document.getElementById("timer-status");

    let seconds = 25 * 60;
    let interval = null;

    function updateTimer() {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;

        timer.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(remainingSeconds).padStart(2, "0");
    }

    start.addEventListener("click", () => {

        if (interval !== null) return;

        if (seconds === 0) seconds = 25 * 60;

        status.textContent = "Stay focused! ✨";

        interval = setInterval(() => {

            seconds--;
            updateTimer();

            if (seconds <= 0) {

                clearInterval(interval);
                interval = null;

                status.textContent = "Session completed! 🎉";

                alert("Your focus session is complete!");

            }

        }, 1000);

    });

    pause.addEventListener("click", () => {

        clearInterval(interval);
        interval = null;

        status.textContent = "Timer paused.";

    });

    reset.addEventListener("click", () => {

        clearInterval(interval);
        interval = null;

        seconds = 25 * 60;

        updateTimer();

        status.textContent = "Ready for a productive session?";

    });

    updateTimer();

    
    // HABIT TRACKER

    const habits = document.querySelectorAll(
        ".habits-card input[type='checkbox']"
    );

    const today = new Date().toLocaleDateString("en-CA");

    habits.forEach((habit, index) => {

        const key = `forma-habit-${today}-${index}`;

        habit.checked = localStorage.getItem(key) === "true";

        habit.addEventListener("change", () => {

            localStorage.setItem(key, habit.checked);

        });

    });

    // =====================================
// MEMORY CHALLENGE
// =====================================

const memoryButton = document.getElementById("memory-game");
const memoryResult = document.getElementById("memory-result");

if (memoryButton && memoryResult) {

    memoryButton.addEventListener("click", () => {

        const symbols = ["🌸", "⭐", "💜", "🌙", "🌸", "⭐", "💜", "🌙"];

        // Shuffle symbols
        symbols.sort(() => Math.random() - 0.5);

        memoryResult.innerHTML = "";

        let firstCard = null;
        let locked = false;
        let matches = 0;
        let moves = 0;

        const gameGrid = document.createElement("div");

        gameGrid.style.display = "grid";
        gameGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
        gameGrid.style.gap = "10px";
        gameGrid.style.marginTop = "20px";

        const movesText = document.createElement("p");
        movesText.textContent = "Moves: 0";

        const resultText = document.createElement("p");

        symbols.forEach(symbol => {

            const card = document.createElement("button");

            card.type = "button";
            card.textContent = "?";
            card.style.fontSize = "25px";
            card.style.padding = "20px 5px";
            card.style.borderRadius = "12px";
            card.style.border = "1px solid #ddd";
            card.style.background = "#eee8ff";
            card.style.cursor = "pointer";

            card.addEventListener("click", () => {

                if (
                    locked ||
                    card.dataset.matched === "true" ||
                    card === firstCard
                ) return;

                card.textContent = symbol;

                if (!firstCard) {
                    firstCard = card;
                    return;
                }

                moves++;
                movesText.textContent = `Moves: ${moves}`;

                if (firstCard.textContent === card.textContent) {

                    firstCard.dataset.matched = "true";
                    card.dataset.matched = "true";

                    firstCard.style.background = "#c9f7d5";
                    card.style.background = "#c9f7d5";

                    matches++;
                    firstCard = null;

                    if (matches === 4) {
                        resultText.textContent =
                            `🎉 You won in ${moves} moves! Amazing work!`;
                    }

                } else {

                    locked = true;

                    const previousCard = firstCard;
                    firstCard = null;

                    setTimeout(() => {

                        previousCard.textContent = "?";
                        card.textContent = "?";

                        locked = false;

                    }, 800);

                }

            });

            gameGrid.appendChild(card);

        });

        memoryResult.appendChild(movesText);
        memoryResult.appendChild(gameGrid);
        memoryResult.appendChild(resultText);

    });
}

// =====================================
// QUICK MATHS GAME
// =====================================

const mathButton = document.getElementById("math-game");
const mathQuestion = document.getElementById("math-question");
const mathAnswer = document.getElementById("math-answer");
const mathResult = document.getElementById("math-result");

let correctAnswer = null;
let mathScore = 0;
let mathRound = 0;

if (mathButton) {

    function generateQuestion() {

        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;

        const operations = ["+", "-", "×"];

        const operation =
            operations[Math.floor(Math.random() * operations.length)];

        if (operation === "+") {
            correctAnswer = num1 + num2;
        }

        else if (operation === "-") {
            correctAnswer = num1 - num2;
        }

        else {
            correctAnswer = num1 * num2;
        }

        mathQuestion.textContent =
            `${num1} ${operation} ${num2} = ?`;

        mathAnswer.value = "";
        mathAnswer.focus();

        mathResult.textContent = `Score: ${mathScore}`;

        mathButton.textContent = "Check answer";

    }

    mathButton.addEventListener("click", () => {

        // Start a new game
        if (correctAnswer === null) {

            mathScore = 0;
            mathRound = 0;

            generateQuestion();
            return;

        }

        if (mathAnswer.value.trim() === "") {
            mathResult.textContent = "Please enter your answer!";
            return;
        }

        const userAnswer = Number(mathAnswer.value);

        if (userAnswer === correctAnswer) {

            mathScore++;
            mathResult.textContent = "Correct! 🎉";

        }

        else {

            mathResult.textContent =
                `Incorrect! The correct answer was ${correctAnswer}.`;

        }

        mathRound++;
        correctAnswer = null;

        if (mathRound >= 10) {

            mathQuestion.textContent = "Game completed!";

            mathResult.textContent =
                `🏆 Final score: ${mathScore}/10`;

            mathButton.textContent = "Play again";

        }

        else {

            mathButton.textContent = "Next question";

        }

    });

}

// =====================================
// TYPING SPEED GAME
// =====================================

const typingButton = document.getElementById("typing-game");
const typingInput = document.getElementById("typing-input");
const typingSentence = document.getElementById("typing-sentence");
const typingResult = document.getElementById("typing-result");

let typingStartTime = null;
let typingStarted = false;

if (typingButton && typingInput) {

    // Start timer when user begins typing
    typingInput.addEventListener("input", () => {

        if (!typingStarted && typingInput.value.length > 0) {

            typingStartTime = Date.now();
            typingStarted = true;

        }

    });

    typingButton.addEventListener("click", () => {

        const originalText = typingSentence.textContent.trim();
        const userText = typingInput.value.trim();

        if (!userText) {

            typingResult.textContent = "Start typing first! ⌨️";
            return;

        }

        if (userText !== originalText) {

            typingResult.textContent =
                "Keep going! Your text doesn't match yet.";

            return;

        }

        const endTime = Date.now();

        const timeInMinutes =
            (endTime - typingStartTime) / 60000;

        const words = originalText.split(/\s+/).length;

        const wpm = Math.round(words / timeInMinutes);

        // Calculate accuracy
        let correctCharacters = 0;

        const typedText = typingInput.value;

        for (let i = 0; i < originalText.length; i++) {

            if (typedText[i] === originalText[i]) {
                correctCharacters++;
            }

        }

        const accuracy = Math.round(
            (correctCharacters / originalText.length) * 100
        );

        typingResult.innerHTML = `
            🎉 Test completed!<br>
            ⚡ Speed: ${wpm} WPM<br>
            🎯 Accuracy: ${accuracy}%
        `;

        typingButton.textContent = "Try again";

        typingButton.onclick = () => {

            typingInput.value = "";
            typingResult.textContent = "";

            typingStarted = false;
            typingStartTime = null;

            typingButton.textContent = "Check speed";

            typingInput.focus();

        };

    });

}
