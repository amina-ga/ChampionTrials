
/* =========================================
   FORMA — MY PROGRESS DASHBOARD
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEYS = {
        tasks: "forma-space-tasks",
        calendar: "forma-calendar-events",
        games: "forma-game-records",
        growth: "forma-growth-data"
    };

    /* -------------------------------------
       GENERAL HELPERS
    ------------------------------------- */

    function readStorage(key, fallback) {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (error) {
            console.warn(`Could not read ${key}:`, error);
            return fallback;
        }
    }

    function getDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function parseDate(value) {
        if (!value) return null;

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }

        // Handle date-only values in local time.
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            return new Date(year, month - 1, day);
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getRecordDate(record) {
        if (!record) return null;

        if (typeof record === "string") {
            return parseDate(record);
        }

        return parseDate(
            record.date ||
            record.completedOn ||
            record.completedAt ||
            record.createdAt ||
            record.timestamp ||
            record.day
        );
    }

    function getTodayKey() {
        return getDateKey(new Date());
    }

    function isToday(date) {
        return date && getDateKey(date) === getTodayKey();
    }

    function isWithinLastSevenDays(date) {
        if (!date) return false;

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 6);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return date >= start && date <= end;
    }

    function getArray(value) {
        if (Array.isArray(value)) return value;

        if (value && typeof value === "object") {
            return Object.values(value).flatMap(item =>
                Array.isArray(item) ? item : [item]
            );
        }

        return [];
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function formatMinutes(minutes) {
        const safeMinutes = Math.max(0, Math.round(minutes));

        if (safeMinutes < 60) {
            return `${safeMinutes} min`;
        }

        const hours = Math.floor(safeMinutes / 60);
        const remaining = safeMinutes % 60;

        return remaining
            ? `${hours}h ${remaining}m`
            : `${hours}h`;
    }

    /* -------------------------------------
       LOAD FORMA DATA
    ------------------------------------- */

    const taskData = readStorage(STORAGE_KEYS.tasks, []);
    const calendarData = readStorage(STORAGE_KEYS.calendar, {});
    const gameData = readStorage(STORAGE_KEYS.games, []);
    const growthData = readStorage(STORAGE_KEYS.growth, {});

    const tasks = getArray(taskData);
    const games = getArray(gameData);

    const habits = Array.isArray(growthData.habits)
        ? growthData.habits
        : [];

    const focusSessions = Array.isArray(growthData.focusSessions)
        ? growthData.focusSessions
        : [];

    const moods = Array.isArray(growthData.moods)
        ? growthData.moods
        : [];

    /* -------------------------------------
       PROFILE NAME
    ------------------------------------- */

    function loadProfileName() {
        const nameElement = document.getElementById("progress-user-name");

        if (!nameElement) return;

        if (
            window.FormaProfile &&
            typeof window.FormaProfile.current === "function"
        ) {
            const profile = window.FormaProfile.current();

            if (profile && profile.name) {
                nameElement.textContent = profile.name;
                return;
            }
        }

        nameElement.textContent = "you";
    }

    /* -------------------------------------
       TASK STATISTICS
    ------------------------------------- */

    function isTaskCompleted(task) {
        if (typeof task === "string") return false;
        if (!task || typeof task !== "object") return false;

        return (
            task.completed === true ||
            task.done === true ||
            task.completed === "true" ||
            task.status === "completed" ||
            task.status === "done"
        );
    }

    function renderTaskStats() {
        const completedTasks = tasks.filter(isTaskCompleted);

        setText("stat-tasks", completedTasks.length);
    }

    /* -------------------------------------
       HABIT STATISTICS
    ------------------------------------- */

    function isHabitCompletedToday(habit) {
        if (!habit || typeof habit !== "object") return false;

        // Growth Studio records the completion date on the habit.
        if (habit.completedOn) {
            return habit.completedOn === getTodayKey();
        }

        if (habit.completedDate) {
            return habit.completedDate === getTodayKey();
        }

        if (habit.completed === true || habit.done === true) {
            return true;
        }

        return false;
    }

    function renderHabitStats() {
        const completedHabits = habits.filter(isHabitCompletedToday);
        const total = habits.length;
        const completed = completedHabits.length;

        setText("stat-habits", completed);
        setText("habit-completion-count", `${completed} / ${total}`);

        const percentage = total > 0
            ? (completed / total) * 100
            : 0;

        document.getElementById("habit-progress-fill").style.width =
            `${percentage}%`;

        const list = document.getElementById("habit-progress-list");
        list.innerHTML = "";

        if (habits.length === 0) {
            list.innerHTML =
                '<p class="empty-progress">Your habits will appear here when you add them in Growth Studio.</p>';
            return;
        }

        habits.forEach(habit => {
            const name = habit.name || habit.title || habit.text || "Untitled habit";
            const done = isHabitCompletedToday(habit);

            const row = document.createElement("div");
            row.className = "habit-progress-item";

            const label = document.createElement("span");
            label.textContent = `🌱 ${name}`;

            const status = document.createElement("span");
            status.className = done ? "habit-status done" : "habit-status";
            status.textContent = done ? "Completed ✓" : "Not yet";

            row.append(label, status);
            list.appendChild(row);
        });
    }

    /* -------------------------------------
       FOCUS STATISTICS
    ------------------------------------- */

    function getSessionMinutes(session) {
        if (!session || typeof session !== "object") return 25;

        const value =
            Number(session.minutes) ||
            Number(session.durationMinutes) ||
            Number(session.duration) ||
            Number(session.length);

        // If duration is stored in seconds, convert it.
        if (value > 0) {
            return value > 180 ? value / 60 : value;
        }

        return 25;
    }

    function renderFocusStats() {
        const totalMinutes = focusSessions.reduce(
            (total, session) => total + getSessionMinutes(session),
            0
        );

        const weeklySessions = focusSessions.filter(session =>
            isWithinLastSevenDays(getRecordDate(session))
        );

        const weeklyMinutes = weeklySessions.reduce(
            (total, session) => total + getSessionMinutes(session),
            0
        );

        const average = focusSessions.length
            ? totalMinutes / focusSessions.length
            : 0;

        setText("stat-focus", focusSessions.length);
        setText("focus-total-minutes", formatMinutes(totalMinutes));
        setText("focus-week-minutes", formatMinutes(weeklyMinutes));
        setText("focus-average", `${Math.round(average)} min`);
    }

    /* -------------------------------------
       MOOD JOURNAL
    ------------------------------------- */

    const moodEmojis = {
        happy: "😊",
        excited: "🤩",
        calm: "😌",
        okay: "🙂",
        sad: "😔",
        stressed: "😣",
        tired: "😴",
        anxious: "😟",
        grateful: "🥰"
    };

    function renderMoodStats() {
        setText("mood-entry-count", moods.length);

        const container = document.getElementById("progress-mood-history");
        container.innerHTML = "";

        if (moods.length === 0) {
            container.innerHTML =
                '<p class="empty-progress">Your mood entries will appear here when you use your journal.</p>';
            return;
        }

        const recentMoods = [...moods]
            .sort((a, b) => {
                const dateA = getRecordDate(a);
                const dateB = getRecordDate(b);

                return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
            })
            .slice(0, 5);

        recentMoods.forEach(entry => {
            const mood = String(entry.mood || entry.feeling || "mood").toLowerCase();
            const date = getRecordDate(entry);

            const row = document.createElement("div");
            row.className = "mood-entry-row";

            const emoji = document.createElement("span");
            emoji.className = "mood-entry-emoji";
            emoji.textContent = moodEmojis[mood] || "♡";

            const info = document.createElement("div");
            info.className = "mood-entry-info";

            const title = document.createElement("strong");
            title.textContent = mood;

            const note = document.createElement("small");
            note.textContent =
                entry.note ||
                entry.text ||
                (date ? date.toLocaleDateString() : "Mood entry");

            info.append(title, note);
            row.append(emoji, info);
            container.appendChild(row);
        });
    }

    /* -------------------------------------
       CALENDAR EVENTS
    ------------------------------------- */

    function getCalendarEvents() {
        const events = [];

        if (Array.isArray(calendarData)) {
            calendarData.forEach(event => {
                if (!event || typeof event !== "object") return;

                events.push({
                    ...event,
                    date: event.date || event.day
                });
            });

            return events;
        }

        if (calendarData && typeof calendarData === "object") {
            Object.entries(calendarData).forEach(([dateKey, dayEvents]) => {
                if (!Array.isArray(dayEvents)) return;

                dayEvents.forEach(event => {
                    if (!event || typeof event !== "object") return;

                    events.push({
                        ...event,
                        date: event.date || dateKey
                    });
                });
            });
        }

        return events;
    }

    function renderCalendarStats() {
        const events = getCalendarEvents();

        setText("calendar-event-count", events.length);

        const container = document.getElementById("progress-upcoming-events");
        container.innerHTML = "";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = events
            .map(event => ({
                ...event,
                parsedDate: parseDate(event.date)
            }))
            .filter(event => event.parsedDate && event.parsedDate >= today)
            .sort((a, b) => a.parsedDate - b.parsedDate)
            .slice(0, 4);

        if (upcoming.length === 0) {
            container.innerHTML =
                '<p class="empty-progress">No upcoming events yet. Add something to your calendar!</p>';
            return;
        }

        upcoming.forEach(event => {
            const row = document.createElement("div");
            row.className = "upcoming-event";

            const dateBox = document.createElement("div");
            dateBox.className = "event-date-box";

            const day = document.createElement("strong");
            day.textContent = event.parsedDate.getDate();

            const month = document.createElement("small");
            month.textContent = event.parsedDate.toLocaleDateString(
                undefined,
                { month: "short" }
            );

            dateBox.append(day, month);

            const info = document.createElement("div");
            info.className = "event-info";

            const title = document.createElement("strong");
            title.textContent = event.title || event.name || "Untitled event";

            const details = document.createElement("small");
            details.textContent = event.time || "Scheduled event";

            info.append(title, details);
            row.append(dateBox, info);
            container.appendChild(row);
        });
    }

    /* -------------------------------------
       MINI GAME STATISTICS
    ------------------------------------- */

    function getGameScore(game) {
        if (!game || typeof game !== "object") return null;

        const score = Number(game.score);

        return Number.isFinite(score) ? score : null;
    }

    function renderGameStats() {
        setText("stat-games", games.length);
        setText("game-total", games.length);

        const scores = games
            .map(getGameScore)
            .filter(score => score !== null);

        const bestScore = scores.length
            ? Math.max(...scores)
            : null;

        setText(
            "game-best-score",
            bestScore === null ? "—" : bestScore
        );

        const container = document.getElementById("game-progress-list");
        container.innerHTML = "";

        if (games.length === 0) {
            container.innerHTML =
                '<p class="empty-progress">Play a mini game to start building your game history.</p>';
            return;
        }

        const groupedGames = {};

        games.forEach(game => {
            const name = game.game || game.name || game.title || "Mini game";
            const score = getGameScore(game);

            if (!groupedGames[name]) {
                groupedGames[name] = {
                    plays: 0,
                    best: null
                };
            }

            groupedGames[name].plays += 1;

            if (score !== null) {
                groupedGames[name].best =
                    groupedGames[name].best === null
                        ? score
                        : Math.max(groupedGames[name].best, score);
            }
        });

        Object.entries(groupedGames).forEach(([name, details]) => {
            const row = document.createElement("div");
            row.className = "game-progress-item";

            const title = document.createElement("span");
            title.textContent = `🎮 ${name} · ${details.plays} played`;

            const score = document.createElement("strong");
            score.textContent =
                details.best === null
                    ? "No score"
                    : `Best: ${details.best}`;

            row.append(title, score);
            container.appendChild(row);
        });
    }

    /* -------------------------------------
       WEEKLY ACTIVITY CHART
    ------------------------------------- */

    function getActivityForDate(date) {
        const key = getDateKey(date);

        const habitCount = habits.filter(habit => {
            if (!habit || typeof habit !== "object") return false;

            return (
                habit.completedOn === key ||
                habit.completedDate === key
            );
        }).length;

        const focusCount = focusSessions.filter(session => {
            const sessionDate = getRecordDate(session);
            return sessionDate && getDateKey(sessionDate) === key;
        }).length;

        const moodCount = moods.filter(mood => {
            const moodDate = getRecordDate(mood);
            return moodDate && getDateKey(moodDate) === key;
        }).length;

        return {
            habits: habitCount,
            focus: focusCount,
            moods: moodCount
        };
    }

    function renderWeeklyChart() {
        const chart = document.getElementById("activity-chart");
        chart.innerHTML = "";

        const days = [];

        for (let offset = 6; offset >= 0; offset--) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - offset);

            days.push({
                date,
                activity: getActivityForDate(date)
            });
        }

        const maxTotal = Math.max(
            1,
            ...days.map(day =>
                day.activity.habits +
                day.activity.focus +
                day.activity.moods
            )
        );

        let weeklyTotal = 0;
        let bestDay = null;
        let bestCount = 0;

        days.forEach(day => {
            const activity = day.activity;
            const total = activity.habits + activity.focus + activity.moods;

            weeklyTotal += total;

            if (total > bestCount) {
                bestCount = total;
                bestDay = day.date;
            }

            const column = document.createElement("div");
            column.className = "activity-day";

            const bars = document.createElement("div");
            bars.className = "activity-bars";

            const categories = [
                { value: activity.habits, className: "habit-bar", label: "Habits" },
                { value: activity.focus, className: "focus-bar", label: "Focus" },
                { value: activity.moods, className: "mood-bar", label: "Mood entries" }
            ];

            categories.forEach(category => {
                const bar = document.createElement("div");
                bar.className = `activity-bar ${category.className}`;

                const height = category.value > 0
                    ? Math.max(7, (category.value / maxTotal) * 115)
                    : 0;

                bar.style.height = `${height}px`;
                bar.title = `${category.label}: ${category.value}`;

                bars.appendChild(bar);
            });

            const dayName = document.createElement("strong");
            dayName.textContent = day.date.toLocaleDateString(
                undefined,
                { weekday: "short" }
            );

            const dayCount = document.createElement("small");
            dayCount.textContent = total;

            column.append(bars, dayName, dayCount);
            chart.appendChild(column);
        });

        setText("weekly-total", weeklyTotal);

        setText(
            "weekly-best-day",
            bestDay
                ? bestDay.toLocaleDateString(undefined, { weekday: "long" })
                : "—"
        );
    }

    /* -------------------------------------
       INITIALISE DASHBOARD
    ------------------------------------- */

    loadProfileName();

    renderTaskStats();
    renderHabitStats();
    renderFocusStats();
    renderMoodStats();
    renderCalendarStats();
    renderGameStats();
    renderWeeklyChart();

});
