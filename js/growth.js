
document.addEventListener('DOMContentLoaded', () => {

    // ==============================================
    // FORMA GROWTH STUDIO
    // ==============================================

    const STORAGE_KEY = 'forma-growth-data';

    const today = () => {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-');
    };

    const getDefaultData = () => ({
        name: '',
        habits: [],
        focusSessions: [],
        moods: [],
        studyTasks: [],
        theme: 'lavender',
        focusTask: '',
        surprises: []
    });

    let data;

    try {
        data = {
            ...getDefaultData(),
            ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        };
    } catch {
        data = getDefaultData();
    }

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const escapeHTML = (value) => {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[character]);
    };


    // ==============================================
    // TODAY'S DATE
    // ==============================================

    const dateElement = document.querySelector('#today-date');

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            undefined,
            {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }
        );
    }


    // ==============================================
    // PERSONAL DASHBOARD
    // ==============================================

    const nameInput = document.querySelector('#growth-name');
    const saveNameButton = document.querySelector('#save-name');
    const nameMessage = document.querySelector('#name-message');

    if (nameInput) {
        nameInput.value = data.name;
    }

    if (saveNameButton) {
        saveNameButton.addEventListener('click', () => {

            const name = nameInput.value.trim();

            if (!name) {
                nameMessage.textContent = 'Please enter your name first.';
                return;
            }

            data.name = name;
            save();

            nameMessage.textContent = `This little space is yours, ${name}! ♡`;

        });
    }


    // ==============================================
    // HABIT GARDEN
    // ==============================================

    const habitForm = document.querySelector('#habit-form');
    const habitInput = document.querySelector('#habit-input');
    const habitList = document.querySelector('#habit-list');

    function renderHabits() {

        if (!habitList) return;

        habitList.replaceChildren();

        data.habits.forEach((habit, index) => {

            const item = document.createElement('div');
            item.className = 'habit-item';

            const label = document.createElement('label');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = habit.completedOn === today();

            const name = document.createElement('span');
            name.textContent = habit.name;

            if (checkbox.checked) {
                name.classList.add('completed');
            }

            checkbox.addEventListener('change', () => {

                habit.completedOn = checkbox.checked ? today() : '';

                save();
                renderHabits();
                updateDashboard();
                renderAchievements();
                renderWeeklyWrapped();

            });

            label.append(checkbox, name);


            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.textContent = '×';
            removeButton.setAttribute('aria-label', 'Delete habit');

            removeButton.addEventListener('click', () => {

                data.habits.splice(index, 1);

                save();
                renderHabits();
                updateDashboard();
                renderAchievements();
                renderWeeklyWrapped();

            });

            item.append(label, removeButton);
            habitList.append(item);

        });

        const completed = data.habits.filter(
            habit => habit.completedOn === today()
        ).length;

        const habitStat = document.querySelector('#habit-stat');

        if (habitStat) {
            habitStat.textContent = completed;
        }

    }

    if (habitForm) {
        habitForm.addEventListener('submit', event => {

            event.preventDefault();

            const name = habitInput.value.trim();

            if (!name) return;

            data.habits.push({
                name,
                completedOn: ''
            });

            save();

            habitInput.value = '';

            renderHabits();
            updateDashboard();
            renderAchievements();

        });
    }


    // ==============================================
    // FOCUS ROOM
    // ==============================================

    const timerDisplay = document.querySelector('#focus-timer');
    const startButton = document.querySelector('#focus-start');
    const resetButton = document.querySelector('#focus-reset');
    const focusMessage = document.querySelector('#focus-message');
    const focusTask = document.querySelector('#focus-task');
    const timerModes = document.querySelectorAll('.timer-mode');

    let selectedMinutes = 25;
    let remainingSeconds = selectedMinutes * 60;
    let timerInterval = null;
    let timerRunning = false;
    let currentMode = 'focus';

    if (focusTask) {
        focusTask.value = data.focusTask || '';

        focusTask.addEventListener('input', () => {
            data.focusTask = focusTask.value;
            save();
        });
    }

    function displayTimer() {

        if (!timerDisplay) return;

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        timerDisplay.textContent =
            `${String(minutes).padStart(2, '0')}:` +
            `${String(seconds).padStart(2, '0')}`;

    }

    function stopTimer() {

        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;

        if (startButton) {
            startButton.textContent = 'Start';
        }

    }

    function completeFocusSession() {

        stopTimer();

        if (currentMode === 'focus') {

            data.focusSessions.push({
                date: today(),
                completedAt: new Date().toISOString(),
                task: data.focusTask || ''
            });

            save();

            if (focusMessage) {
                focusMessage.textContent =
                    'Amazing work! You completed a focus session. ✨';
            }

            updateDashboard();
            renderAchievements();
            renderWeeklyWrapped();

        } else if (focusMessage) {

            focusMessage.textContent =
                'Your break is complete. Ready for another round? 🌷';

        }

    }

    if (startButton) {

        startButton.addEventListener('click', () => {

            if (timerRunning) {
                return;
            }

            timerRunning = true;
            startButton.textContent = 'Running...';

            if (focusMessage) {
                focusMessage.textContent =
                    'You are doing great. Keep going! 🌱';
            }

            timerInterval = setInterval(() => {

                remainingSeconds--;

                displayTimer();

                if (remainingSeconds <= 0) {
                    completeFocusSession();
                }

            }, 1000);

        });

    }

    if (resetButton) {

        resetButton.addEventListener('click', () => {

            stopTimer();

            remainingSeconds = selectedMinutes * 60;

            displayTimer();

            if (focusMessage) {
                focusMessage.textContent =
                    'Fresh start. Take it one step at a time.';
            }

        });

    }

    timerModes.forEach(button => {

        button.addEventListener('click', () => {

            stopTimer();

            timerModes.forEach(mode => {
                mode.classList.remove('active');
            });

            button.classList.add('active');

            selectedMinutes = Number(button.dataset.minutes);
            currentMode = selectedMinutes === 25 ? 'focus' : 'break';

            remainingSeconds = selectedMinutes * 60;

            displayTimer();

            if (focusMessage) {
                focusMessage.textContent =
                    currentMode === 'focus'
                        ? 'Time to focus. One thing at a time.'
                        : 'Relax, breathe and recharge. ♡';
            }

        });

    });

    displayTimer();


    // ==============================================
    // MOOD JOURNAL
    // ==============================================

    const moodOptions = document.querySelectorAll(
        '#mood-options button'
    );

    const moodNote = document.querySelector('#mood-note');
    const saveMoodButton = document.querySelector('#save-mood');
    const moodMessage = document.querySelector('#mood-message');
    const moodHistory = document.querySelector('#mood-history');

    let selectedMood = '';

    function renderMoodHistory() {

        if (!moodHistory) return;

        moodHistory.replaceChildren();

        const recentMoods = [...data.moods].reverse().slice(0, 5);

        if (recentMoods.length === 0) {

            const empty = document.createElement('p');
            empty.textContent = 'Your check-ins will appear here.';
            empty.className = 'muted';

            moodHistory.append(empty);
            return;

        }

        recentMoods.forEach(entry => {

            const item = document.createElement('div');
            item.className = 'mood-entry';

            const emoji = document.createElement('strong');
            emoji.textContent = entry.mood;

            const details = document.createElement('div');

            const date = document.createElement('small');
            date.textContent = entry.date;

            const note = document.createElement('p');
            note.textContent = entry.note || 'No note added.';

            details.append(date, note);
            item.append(emoji, details);

            moodHistory.append(item);

        });

    }

    moodOptions.forEach(button => {

        button.addEventListener('click', () => {

            selectedMood = button.dataset.mood;

            moodOptions.forEach(option => {
                option.classList.remove('selected');
            });

            button.classList.add('selected');

        });

    });

    if (saveMoodButton) {

        saveMoodButton.addEventListener('click', () => {

            if (!selectedMood) {

                moodMessage.textContent =
                    'Choose a mood before saving your check-in.';

                return;

            }

            const existingIndex = data.moods.findIndex(
                entry => entry.date === today()
            );

            const entry = {
                date: today(),
                mood: selectedMood,
                note: moodNote.value.trim()
            };

            if (existingIndex >= 0) {
                data.moods[existingIndex] = entry;
            } else {
                data.moods.push(entry);
            }

            save();

            moodMessage.textContent =
                'Your check-in has been saved. Thank you for taking a moment for yourself. ♡';

            renderMoodHistory();
            updateDashboard();
            renderAchievements();
            renderWeeklyWrapped();

        });

    }

    const todaysMood = data.moods.find(
        entry => entry.date === today()
    );

    if (todaysMood) {

        selectedMood = todaysMood.mood;

        const selectedButton = [...moodOptions].find(
            button => button.dataset.mood === selectedMood
        );

        if (selectedButton) {
            selectedButton.classList.add('selected');
        }

        if (moodNote) {
            moodNote.value = todaysMood.note || '';
        }

    }

    renderMoodHistory();


    // ==============================================
    // ACHIEVEMENTS
    // ==============================================

    const achievementList = document.querySelector('#achievement-list');

    const achievements = [
        {
            id: 'first-habit',
            emoji: '🌱',
            title: 'First Seed',
            description: 'Complete your first habit.',
            unlocked: () => data.habits.some(habit => habit.completedOn)
        },
        {
            id: 'five-habits',
            emoji: '🌷',
            title: 'Growing Strong',
            description: 'Complete five habits.',
            unlocked: () => data.habits.filter(habit => habit.completedOn).length >= 5
        },
        {
            id: 'first-focus',
            emoji: '⏳',
            title: 'Finding Focus',
            description: 'Complete your first focus session.',
            unlocked: () => data.focusSessions.length >= 1
        },
        {
            id: 'five-focus',
            emoji: '✨',
            title: 'Focus Star',
            description: 'Complete five focus sessions.',
            unlocked: () => data.focusSessions.length >= 5
        },
        {
            id: 'first-mood',
            emoji: '☁️',
            title: 'Checking In',
            description: 'Write your first mood check-in.',
            unlocked: () => data.moods.length >= 1
        },
        {
            id: 'five-moods',
            emoji: '💗',
            title: 'Self-Awareness',
            description: 'Save five mood check-ins.',
            unlocked: () => data.moods.length >= 5
        },
        {
            id: 'first-study',
            emoji: '📚',
            title: 'Ready to Learn',
            description: 'Complete your first study task.',
            unlocked: () => data.studyTasks.some(task => task.completed)
        }
    ];

    function renderAchievements() {

        if (!achievementList) return;

        achievementList.replaceChildren();

        let unlockedCount = 0;

        achievements.forEach(achievement => {

            const unlocked = achievement.unlocked();

            if (unlocked) unlockedCount++;

            const card = document.createElement('article');

            card.className = unlocked
                ? 'achievement-card unlocked'
                : 'achievement-card locked';

            const emoji = document.createElement('span');
            emoji.textContent = unlocked ? achievement.emoji : '🔒';

            const title = document.createElement('h3');
            title.textContent = achievement.title;

            const description = document.createElement('p');
            description.textContent = achievement.description;

            const status = document.createElement('small');
            status.textContent = unlocked ? 'Unlocked ✓' : 'Not unlocked yet';

            card.append(emoji, title, description, status);

            achievementList.append(card);

        });

        const achievementStat = document.querySelector('#achievement-stat');

        if (achievementStat) {
            achievementStat.textContent = unlockedCount;
        }

    }


    // ==============================================
    // WEEKLY WRAPPED
    // ==============================================

    function getWeekStart() {

        const date = new Date();

        date.setHours(0, 0, 0, 0);

        const day = date.getDay();

        date.setDate(
            date.getDate() - (day === 0 ? 6 : day - 1)
        );

        return date;

    }

    function isThisWeek(dateString) {

        const date = new Date(`${dateString}T00:00:00`);
        const start = getWeekStart();

        return date >= start && date <= new Date();
    }

    function renderWeeklyWrapped() {

        const habits = data.habits.reduce((total, habit) => {
            return total + (habit.completedOn && isThisWeek(habit.completedOn) ? 1 : 0);
        }, 0);

        const focus = data.focusSessions.filter(session => {
            return isThisWeek(session.date);
        }).length;

        const moods = data.moods.filter(entry => {
            return isThisWeek(entry.date);
        }).length;

        document.querySelector('#weekly-habits').textContent = habits;
        document.querySelector('#weekly-focus').textContent = focus;
        document.querySelector('#weekly-moods').textContent = moods;

        const note = document.querySelector('#weekly-note');

        if (note) {

            if (habits + focus + moods === 0) {
                note.textContent =
                    'Your week is a fresh page. Start with one little step. 🌱';
            } else {
                note.textContent =
                    'Look at you showing up for yourself. Every little effort counts! ♡';
            }

        }

    }


    // ==============================================
    // CUSTOMISE YOUR FORMA
    // ==============================================

const themeButtons = document.querySelectorAll(".theme-choice");

themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedTheme = button.dataset.theme;

        document.body.dataset.growthTheme = selectedTheme;

        themeButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        data.theme = selectedTheme;
        save();
    });
});

// Restore saved theme
if (data.theme) {
    document.body.dataset.growthTheme = data.theme;

    themeButtons.forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.theme === data.theme
        );
    });
}


    // ==============================================
    // INSPIRATION CORNER
    // ==============================================

    const quotes = [
        'You are allowed to grow at your own pace.',
        'Small steps still move you forward.',
        'You do not need to have everything figured out.',
        'Progress is progress, no matter how small.',
        'Give yourself the same kindness you give others.',
        'You are becoming someone you can be proud of.',
        'Rest is part of the process, too.',
        'A fresh start can happen at any moment.',
        'You are doing better than you think.',
        'Make today count in your own little way.'
    ];

    const quoteElement = document.querySelector('#inspiration-quote');
    const quoteButton = document.querySelector('#new-quote');

    function newQuote() {

        const currentQuote = quoteElement.textContent;

        let availableQuotes = quotes.filter(
            quote => quote !== currentQuote
        );

        const quote = availableQuotes[
            Math.floor(Math.random() * availableQuotes.length)
        ];

        quoteElement.textContent = quote;

    }

    if (quoteButton) {
        quoteButton.addEventListener('click', newQuote);
    }


    // ==============================================
    // STUDY PLANNER
    // ==============================================

    const studyForm = document.querySelector('#study-form');
    const studyInput = document.querySelector('#study-input');
    const studyList = document.querySelector('#study-list');

    function renderStudyTasks() {

        if (!studyList) return;

        studyList.replaceChildren();

        data.studyTasks.forEach((task, index) => {

            const item = document.createElement('div');
            item.className = 'study-item';

            const label = document.createElement('label');

            const checkbox = document.createElement('input');

            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;

            const title = document.createElement('span');

            title.textContent = task.title;

            if (task.completed) {
                title.classList.add('completed');
            }

            checkbox.addEventListener('change', () => {

                task.completed = checkbox.checked;

                save();

                renderStudyTasks();
                renderAchievements();

            });

            label.append(checkbox, title);


            const removeButton = document.createElement('button');

            removeButton.type = 'button';
            removeButton.textContent = '×';
            removeButton.setAttribute('aria-label', 'Delete study task');

            removeButton.addEventListener('click', () => {

                data.studyTasks.splice(index, 1);

                save();
                renderStudyTasks();
                renderAchievements();

            });

            item.append(label, removeButton);

            studyList.append(item);

        });

    }

    if (studyForm) {

        studyForm.addEventListener('submit', event => {

            event.preventDefault();

            const title = studyInput.value.trim();

            if (!title) return;

            data.studyTasks.push({
                title,
                completed: false
            });

            save();

            studyInput.value = '';

            renderStudyTasks();
            renderAchievements();

        });

    }


    // ==============================================
    // DAILY SURPRISE
    // ==============================================

    const surpriseButton = document.querySelector('#reveal-surprise');
    const surpriseMessage = document.querySelector('#surprise-message');

    const surprises = [
        '🌷 You deserve a moment of peace. Take a deep breath and let your shoulders relax.',
        '💌 A reminder: You are enough, even on the days when you do very little.',
        '✨ Your future self will thank you for the little effort you make today.',
        '🌸 Take five minutes to do something that makes you happy.',
        '☀️ You have made it through difficult days before. You can do it again.',
        '💗 Send a kind message to someone you appreciate today.',
        '🌿 Step outside, stretch and enjoy a little fresh air.',
        '🦋 You do not need to compare your journey with anyone else.',
        '🎀 Give yourself permission to rest without feeling guilty.',
        '🌼 Write down one thing you are proud of yourself for.',
        '☁️ Not every day has to be productive to be meaningful.',
        '💫 Something good can begin with one small decision.'
    ];

    if (surpriseButton && surpriseMessage) {

        const alreadyOpened = data.surprises.includes(today());

        if (alreadyOpened) {

            surpriseButton.textContent = 'Already opened today ✓';

            surpriseMessage.textContent =
                'Your little reminder for today has already been revealed. Come back tomorrow for another! ♡';

            surpriseButton.disabled = true;

        }

        surpriseButton.addEventListener('click', () => {

            if (data.surprises.includes(today())) {
                return;
            }

            const randomIndex = Math.floor(
                Math.random() * surprises.length
            );

            surpriseMessage.textContent = surprises[randomIndex];

            data.surprises.push(today());

            save();

            surpriseButton.textContent = 'Surprise opened ✓';
            surpriseButton.disabled = true;

        });

    }


    // ==============================================
    // UPDATE DASHBOARD STATISTICS
    // ==============================================

    function updateDashboard() {

        const completedHabits = data.habits.filter(
            habit => habit.completedOn === today()
        ).length;

        const habitStat = document.querySelector('#habit-stat');
        const focusStat = document.querySelector('#focus-stat');

        if (habitStat) {
            habitStat.textContent = completedHabits;
        }

        if (focusStat) {
            focusStat.textContent = data.focusSessions.length;
        }

    }


    // ==============================================
    // INITIALISE GROWTH STUDIO
    // ==============================================

    renderHabits();

    renderStudyTasks();

    renderAchievements();

    renderWeeklyWrapped();

    updateDashboard();

    save();

});
