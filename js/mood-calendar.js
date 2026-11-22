
/* =========================================
   FORMA — MOOD CALENDAR
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "forma-growth-data";

    const calendarGrid = document.getElementById("mood-calendar-grid");
    const monthLabel = document.getElementById("mood-month-label");

    const previousButton = document.getElementById("mood-prev-month");
    const nextButton = document.getElementById("mood-next-month");
    const todayButton = document.getElementById("mood-today");

    const selectedDateHeading = document.getElementById("selected-mood-date");
    const selectedEmoji = document.getElementById("selected-mood-emoji");
    const selectedContent = document.getElementById("selected-mood-content");

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

    const moodColors = {
        happy: "mood-happy",
        excited: "mood-excited",
        calm: "mood-calm",
        okay: "mood-okay",
        sad: "mood-sad",
        stressed: "mood-stressed",
        tired: "mood-tired",
        anxious: "mood-anxious",
        grateful: "mood-grateful"
    };

    const moodNames = {
        happy: "Happy",
        excited: "Excited",
        calm: "Calm",
        okay: "Okay",
        sad: "Sad",
        stressed: "Stressed",
        tired: "Tired",
        anxious: "Anxious",
        grateful: "Grateful"
    };

    let currentDate = new Date();
    currentDate.setDate(1);

    let selectedDate = getDateKey(new Date());

    let moods = loadMoods();

    /* -------------------------------------
       STORAGE
    ------------------------------------- */

    function loadMoods() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) return [];

            const data = JSON.parse(saved);

            return Array.isArray(data.moods)
                ? data.moods
                : [];
        } catch (error) {
            console.error("Could not load mood entries:", error);
            return [];
        }
    }

    /* -------------------------------------
       DATE HELPERS
    ------------------------------------- */

    function getDateKey(date) {
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

        // Date-only strings are interpreted in local time.
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            return new Date(year, month - 1, day);
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getMoodDate(entry) {
        return parseDate(
            entry.date ||
            entry.day ||
            entry.createdAt ||
            entry.timestamp
        );
    }

    function formatDate(date) {
        return date.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function getMonthEntries() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        return moods.filter(entry => {
            const date = getMoodDate(entry);

            return date &&
                date.getFullYear() === year &&
                date.getMonth() === month;
        });
    }

    function getEntriesForDay(dateKey) {
        return moods.filter(entry => {
            const date = getMoodDate(entry);

            return date && getDateKey(date) === dateKey;
        });
    }

    function normaliseMood(entry) {
        return String(
            entry.mood ||
            entry.feeling ||
            "okay"
        ).toLowerCase().trim();
    }

    function getMoodEmoji(mood) {
        return moodEmojis[mood] || "♡";
    }

    /* -------------------------------------
       MONTH NAVIGATION
    ------------------------------------- */

    previousButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);

        renderCalendar();
        renderStatistics();
        renderBreakdown();
    });

    nextButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);

        renderCalendar();
        renderStatistics();
        renderBreakdown();
    });

    todayButton.addEventListener("click", () => {
        const today = new Date();

        currentDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        selectedDate = getDateKey(today);

        renderCalendar();
        renderStatistics();
        renderBreakdown();
        renderSelectedDay();
    });

    /* -------------------------------------
       CALENDAR RENDERING
    ------------------------------------- */

    function renderCalendar() {
        // Keep the seven existing weekday headings.
        const weekdayHeadings = Array.from(
            calendarGrid.querySelectorAll(".calendar-weekday")
        );

        calendarGrid.innerHTML = "";

        weekdayHeadings.forEach(heading => {
            calendarGrid.appendChild(heading);
        });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthLabel.textContent = currentDate.toLocaleDateString(
            undefined,
            {
                month: "long",
                year: "numeric"
            }
        );

        // Monday-based calendar.
        const firstDay = new Date(year, month, 1);
        const startOffset = (firstDay.getDay() + 6) % 7;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const totalCells = Math.ceil(
            (startOffset + daysInMonth) / 7
        ) * 7;

        const todayKey = getDateKey(new Date());

        for (let index = 0; index < totalCells; index++) {
            const dayNumber = index - startOffset + 1;

            const date = new Date(year, month, dayNumber);
            const dateKey = getDateKey(date);

            const isCurrentMonth = date.getMonth() === month;
            const entries = isCurrentMonth
                ? getEntriesForDay(dateKey)
                : [];

            const dayButton = document.createElement("button");

            dayButton.type = "button";
            dayButton.className = "mood-day";

            dayButton.setAttribute(
                "aria-label",
                `${formatDate(date)}${entries.length ? `, ${entries.length} mood entries` : ", no mood entry"}`
            );

            if (!isCurrentMonth) {
                dayButton.classList.add("other-month");
            }

            if (dateKey === todayKey) {
                dayButton.classList.add("today");
            }

            if (dateKey === selectedDate) {
                dayButton.classList.add("selected");
            }

            const dayNumberElement = document.createElement("span");
            dayNumberElement.className = "mood-day-number";
            dayNumberElement.textContent = date.getDate();

            const emojiElement = document.createElement("span");
            emojiElement.className = "mood-day-emoji";

            if (entries.length > 0) {
                const latestEntry = entries[entries.length - 1];
                const mood = normaliseMood(latestEntry);

                emojiElement.textContent = getMoodEmoji(mood);

                if (moodColors[mood]) {
                    dayButton.classList.add(moodColors[mood]);
                }

                if (entries.length > 1) {
                    dayButton.classList.add("multiple-entries");
                }
            } else {
                dayButton.classList.add("no-entry");
                emojiElement.textContent = "·";
            }

            dayButton.append(dayNumberElement, emojiElement);

            dayButton.addEventListener("click", () => {
                selectedDate = dateKey;

                // If another month's day is clicked, move to that month.
                currentDate = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1
                );

                renderCalendar();
                renderSelectedDay();
            });

            calendarGrid.appendChild(dayButton);
        }
    }

    /* -------------------------------------
       SELECTED DAY DETAILS
    ------------------------------------- */

    function renderSelectedDay() {
        const [year, month, day] = selectedDate.split("-").map(Number);

        const date = new Date(year, month - 1, day);

        selectedDateHeading.textContent = formatDate(date);

        const entries = getEntriesForDay(selectedDate);

        selectedEmoji.textContent = entries.length
            ? getMoodEmoji(normaliseMood(entries[entries.length - 1]))
            : "♡";

        selectedContent.innerHTML = "";

        if (entries.length === 0) {
            const empty = document.createElement("p");

            empty.className = "mood-empty";
            empty.textContent =
                "You didn't record a mood on this day. That's completely okay. Every day doesn't need an entry.";

            selectedContent.appendChild(empty);
            return;
        }

        entries.forEach(entry => {
            const mood = normaliseMood(entry);

            const row = document.createElement("div");
            row.className = "selected-mood-entry";

            const emoji = document.createElement("span");
            emoji.className = "selected-entry-emoji";
            emoji.textContent = getMoodEmoji(mood);

            const details = document.createElement("div");
            details.className = "selected-entry-details";

            const heading = document.createElement("strong");
            heading.textContent = moodNames[mood] || mood;

            const note = document.createElement("p");
            note.textContent =
                entry.note ||
                entry.text ||
                "No journal note was added for this check-in.";

            details.append(heading, note);

            const timeValue = entry.createdAt || entry.timestamp;
            const timeDate = parseDate(timeValue);

            if (timeDate && !Number.isNaN(timeDate.getTime())) {
                const time = document.createElement("span");

                time.className = "selected-entry-time";
                time.textContent = timeDate.toLocaleTimeString(
                    undefined,
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

                details.appendChild(time);
            }

            row.append(emoji, details);
            selectedContent.appendChild(row);
        });
    }

    /* -------------------------------------
       MONTHLY STATISTICS
    ------------------------------------- */

    function renderStatistics() {
        const entries = getMonthEntries();

        const uniqueDays = new Set(
            entries
                .map(entry => {
                    const date = getMoodDate(entry);
                    return date ? getDateKey(date) : null;
                })
                .filter(Boolean)
        );

        const counts = {};

        entries.forEach(entry => {
            const mood = normaliseMood(entry);

            counts[mood] = (counts[mood] || 0) + 1;
        });

        let mostCommonMood = "—";

        if (entries.length > 0) {
            const sortedMoods = Object.entries(counts)
                .sort((a, b) => b[1] - a[1]);

            mostCommonMood =
                moodNames[sortedMoods[0][0]] || sortedMoods[0][0];
        }

        document.getElementById("month-entry-count").textContent =
            entries.length;

        document.getElementById("most-common-mood").textContent =
            mostCommonMood;

        document.getElementById("days-checked-in").textContent =
            uniqueDays.size;
    }

    /* -------------------------------------
       MOOD BREAKDOWN
    ------------------------------------- */

    function renderBreakdown() {
        const container = document.getElementById("mood-breakdown");
        const entries = getMonthEntries();

        container.innerHTML = "";

        if (entries.length === 0) {
            const empty = document.createElement("p");

            empty.className = "mood-empty";
            empty.textContent =
                "No mood entries recorded this month yet. Your check-ins will appear here.";

            container.appendChild(empty);
            return;
        }

        const counts = {};

        entries.forEach(entry => {
            const mood = normaliseMood(entry);

            counts[mood] = (counts[mood] || 0) + 1;
        });

        const sortedMoods = Object.entries(counts)
            .sort((a, b) => b[1] - a[1]);

        sortedMoods.forEach(([mood, count]) => {
            const percentage = (count / entries.length) * 100;

            const row = document.createElement("div");
            row.className = "breakdown-row";

            const label = document.createElement("div");
            label.className = "breakdown-label";

            const emoji = document.createElement("span");
            emoji.textContent = getMoodEmoji(mood);

            const name = document.createElement("span");
            name.textContent = moodNames[mood] || mood;

            label.append(emoji, name);

            const track = document.createElement("div");
            track.className = "breakdown-track";

            const fill = document.createElement("div");
            fill.className = "breakdown-fill";

            if (moodColors[mood]) {
                fill.classList.add(moodColors[mood]);
            }

            fill.style.width = `${percentage}%`;

            track.appendChild(fill);

            const countElement = document.createElement("span");
            countElement.className = "breakdown-count";
            countElement.textContent = count;

            row.append(label, track, countElement);
            container.appendChild(row);
        });
    }

    /* -------------------------------------
       REFRESH WHEN PAGE RETURNS TO VIEW
    ------------------------------------- */

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            moods = loadMoods();

            renderCalendar();
            renderStatistics();
            renderBreakdown();
            renderSelectedDay();
        }
    });

    /* -------------------------------------
       INITIALISE
    ------------------------------------- */

    renderCalendar();
    renderStatistics();
    renderBreakdown();
    renderSelectedDay();

});
