
document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // 1. FOCUS TIMER
    // =========================================

    const clock = document.querySelector("#focus-clock");
    const status = document.querySelector("#focus-status");

    const startBtn = document.querySelector("#focus-start");
    const pauseBtn = document.querySelector("#focus-pause");
    const resetBtn = document.querySelector("#focus-reset");

    if (clock && status && startBtn && pauseBtn && resetBtn) {

        const FOCUS_TIME = 25 * 60;

        let remaining = FOCUS_TIME;
        let interval = null;

        function drawClock() {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;

            clock.textContent =
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }

        function stopTimer() {
            clearInterval(interval);
            interval = null;
        }

        startBtn.addEventListener("click", () => {

            if (interval) return;

            if (remaining <= 0) {
                remaining = FOCUS_TIME;
            }

            status.textContent =
                "You are in focus mode. You've got this! 💜";

            interval = setInterval(() => {

                remaining--;
                drawClock();

                if (remaining <= 0) {

                    stopTimer();

                    remaining = 0;
                    drawClock();

                    status.textContent =
                        "Session complete! Time for a little break. 🎉";

                }

            }, 1000);

        });

        pauseBtn.addEventListener("click", () => {

            if (!interval) return;

            stopTimer();

            status.textContent = "Timer paused. Take a breath. ☁️";

        });

        resetBtn.addEventListener("click", () => {

            stopTimer();

            remaining = FOCUS_TIME;

            drawClock();

            status.textContent = "Ready when you are! ✨";

        });

        drawClock();

    }


    // =========================================
    // 2. DAILY TASKS
    // =========================================

    const taskForm = document.querySelector("#task-form");
    const tasksEl = document.querySelector("#tasks");

    const taskProgress = document.querySelector("#task-progress");
    const taskCount = document.querySelector("#task-count");

    const taskInput = document.querySelector("#task-name");

    const TASK_KEY = "forma-space-tasks";

    function loadData(key, fallback) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data ?? fallback;
        } catch (error) {
            console.warn("Forma: Could not load saved data.", error);
            return fallback;
        }
    }

    let tasks = loadData(TASK_KEY, []);

    function saveTasks() {
        localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    }

    function renderTasks() {

        if (!tasksEl) return;

        tasksEl.innerHTML = "";

        tasks.forEach((task, index) => {

            const row = document.createElement("div");
            row.className = "task-row";

            if (task.done) {
                row.classList.add("done");
            }

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.checked = task.done;
            checkbox.setAttribute("aria-label", `Complete ${task.text}`);

            checkbox.addEventListener("change", () => {

                task.done = checkbox.checked;

                saveTasks();
                renderTasks();

            });

            const span = document.createElement("span");
            span.textContent = task.text;

            const deleteBtn = document.createElement("button");

            deleteBtn.type = "button";
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "soft-button";

            deleteBtn.addEventListener("click", () => {

                tasks.splice(index, 1);

                saveTasks();
                renderTasks();

            });

            row.append(checkbox, span, deleteBtn);

            tasksEl.appendChild(row);

        });

        const completed = tasks.filter(task => task.done).length;

        if (taskProgress) {

            const percentage = tasks.length
                ? completed / tasks.length * 100
                : 0;

            taskProgress.style.width = `${percentage}%`;

        }

        if (taskCount) {

            taskCount.textContent =
                `${completed} of ${tasks.length} tasks completed`;

        }

    }

    if (taskForm && taskInput) {

        taskForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const text = taskInput.value.trim();

            if (!text) return;

            tasks.push({
                text: text,
                done: false
            });

            saveTasks();

            taskInput.value = "";

            renderTasks();

        });

    }

    renderTasks();


    // =========================================
    // 3. TIMETABLE
    // =========================================

    const slotForm = document.querySelector("#slot-form");
    const timetableBody = document.querySelector("#timetable-body");

    const slotDay = document.querySelector("#slot-day");
    const slotTime = document.querySelector("#slot-time");
    const slotTitle = document.querySelector("#slot-title");

    const SLOT_KEY = "forma-timetable";

    let slots = loadData(SLOT_KEY, []);

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    function saveSlots() {

        localStorage.setItem(
            SLOT_KEY,
            JSON.stringify(slots)
        );

    }

    function renderSlots() {

        if (!timetableBody) return;

        timetableBody.innerHTML = "";

        slots.sort((a, b) => {

            const dayDifference =
                days.indexOf(a.day) - days.indexOf(b.day);

            return dayDifference || a.time.localeCompare(b.time);

        });

        slots.forEach((slot, index) => {

            const row = document.createElement("tr");

            [slot.day, slot.time, slot.title].forEach(value => {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);

            });

            const actionCell = document.createElement("td");

            const deleteBtn = document.createElement("button");

            deleteBtn.type = "button";
            deleteBtn.textContent = "×";
            deleteBtn.className = "soft-button";
            deleteBtn.setAttribute("aria-label", "Delete timetable entry");

            deleteBtn.addEventListener("click", () => {

                slots.splice(index, 1);

                saveSlots();
                renderSlots();

            });

            actionCell.appendChild(deleteBtn);

            row.appendChild(actionCell);

            timetableBody.appendChild(row);

        });

        if (slots.length === 0) {

            const row = document.createElement("tr");

            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.textContent = "No timetable entries yet. ✨";
            cell.className = "muted";

            row.appendChild(cell);

            timetableBody.appendChild(row);

        }

    }

    if (slotForm && slotDay && slotTime && slotTitle) {

        slotForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const day = slotDay.value;
            const time = slotTime.value;
            const title = slotTitle.value.trim();

            if (!day || !time || !title) return;

            slots.push({
                day: day,
                time: time,
                title: title
            });

            saveSlots();

            slotForm.reset();

            renderSlots();

        });

    }

    renderSlots();


    // =========================================
    // 4. DAILY HABITS
    // =========================================

    const habitList = document.querySelector("#habit-list");

    const habitProgress = document.querySelector("#habit-progress");

    const defaultHabits = [
        "Drink water 💧",
        "Read for 20 minutes 📖",
        "Move your body 🌷",
        "Review daily goals ✨",
        "Get enough sleep ☁️"
    ];

    // Use local calendar date rather than UTC
    function getToday() {

        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }

    const HABIT_KEY = "forma-space-habits-" + getToday();

    let checks = loadData(HABIT_KEY, {});

    function saveHabits() {

        localStorage.setItem(
            HABIT_KEY,
            JSON.stringify(checks)
        );

    }

    function renderHabits() {

        if (!habitList) return;

        habitList.innerHTML = "";

        defaultHabits.forEach((name, index) => {

            const row = document.createElement("label");

            row.className = "task-row";

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.checked = !!checks[index];

            const span = document.createElement("span");

            span.textContent = name;

            checkbox.addEventListener("change", () => {

                checks[index] = checkbox.checked;

                saveHabits();

                renderHabits();

            });

            row.append(checkbox, span);

            habitList.appendChild(row);

        });

        const completed = Object.values(checks)
            .filter(Boolean).length;

        if (habitProgress) {

            habitProgress.textContent =
                `${completed} of ${defaultHabits.length} habits completed today 🌸`;

        }

    }

    renderHabits();


    // =========================================
    // 5. FORMA INITIALIZATION
    // =========================================

    console.log("Forma Productivity Space loaded successfully! 💜");

});
