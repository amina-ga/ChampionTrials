
/* =========================================
   FORMA — LETTERS TO FUTURE ME
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "forma-future-letters";

    const form = document.getElementById("future-letter-form");
    const titleInput = document.getElementById("letter-title");
    const messageInput = document.getElementById("letter-message");
    const dateInput = document.getElementById("letter-open-date");
    const characterCount = document.getElementById("letter-char-count");
    const formMessage = document.getElementById("letter-form-message");

    const letterList = document.getElementById("future-letter-list");

    const modal = document.getElementById("letter-modal");
    const closeModalButton = document.getElementById("close-letter-modal");

    let activeFilter = "all";
    let letters = loadLetters();

    /* -------------------------------------
       STORAGE
    ------------------------------------- */

    function loadLetters() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : [];

            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Could not load your letters:", error);
            return [];
        }
    }

    function saveLetters() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
            return true;
        } catch (error) {
            console.error("Could not save your letters:", error);

            formMessage.textContent =
                "Your letter couldn't be saved. Check your browser storage and try again.";

            return false;
        }
    }

    /* -------------------------------------
       DATE HELPERS
    ------------------------------------- */

    function getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return getLocalDateString(tomorrow);
    }

    function isReady(letter) {
        return letter.openDate <= getLocalDateString();
    }

    function formatDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);

        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function getDaysUntil(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);

        const target = new Date(year, month - 1, day);
        const today = new Date();

        target.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return Math.round((target - today) / 86400000);
    }

    /* -------------------------------------
       PROFILE NAME
    ------------------------------------- */

    function getProfileName() {
        if (
            window.FormaProfile &&
            typeof window.FormaProfile.current === "function"
        ) {
            const profile = window.FormaProfile.current();

            if (profile && profile.name) {
                return profile.name;
            }
        }

        return "you";
    }

    /* -------------------------------------
       CHARACTER COUNTER
    ------------------------------------- */

    messageInput.addEventListener("input", () => {
        characterCount.textContent = messageInput.value.length;
    });

    /* -------------------------------------
       FORM SETUP
    ------------------------------------- */

    dateInput.min = getTomorrowDate();

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    dateInput.value = getLocalDateString(defaultDate);

    /* -------------------------------------
       CREATE A LETTER
    ------------------------------------- */

    form.addEventListener("submit", event => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const message = messageInput.value.trim();
        const openDate = dateInput.value;

        formMessage.textContent = "";

        if (!title || !message || !openDate) {
            formMessage.textContent =
                "Please complete all the fields before sealing your letter.";
            return;
        }

        if (openDate <= getLocalDateString()) {
            formMessage.textContent =
                "Choose a date in the future for your letter.";
            return;
        }

        const newLetter = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title,
            message,
            openDate,
            createdAt: new Date().toISOString(),
            author: getProfileName()
        };

        letters.unshift(newLetter);

        if (!saveLetters()) {
            letters.shift();
            return;
        }

        form.reset();

        characterCount.textContent = "0";
        dateInput.min = getTomorrowDate();
        dateInput.value = getLocalDateString(defaultDate);

        formMessage.textContent =
            "Your letter has been sealed. Your future self will love this! ♡";

        activeFilter = "all";
        updateFilterButtons();
        renderLetters();
    });

    /* -------------------------------------
       FILTERS
    ------------------------------------- */

    const filterButtons = document.querySelectorAll(".letter-filter");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;

            updateFilterButtons();
            renderLetters();
        });
    });

    function updateFilterButtons() {
        filterButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === activeFilter
            );
        });
    }

    function getFilteredLetters() {
        if (activeFilter === "waiting") {
            return letters.filter(letter => !isReady(letter));
        }

        if (activeFilter === "ready") {
            return letters.filter(isReady);
        }

        return letters;
    }

    /* -------------------------------------
       STATISTICS
    ------------------------------------- */

    function updateStatistics() {
        const waiting = letters.filter(letter => !isReady(letter)).length;
        const ready = letters.filter(isReady).length;

        document.getElementById("letter-total").textContent =
            letters.length;

        document.getElementById("letter-locked").textContent =
            waiting;

        document.getElementById("letter-opened").textContent =
            ready;
    }

    /* -------------------------------------
       RENDER LETTERS
    ------------------------------------- */

    function renderLetters() {
        letterList.innerHTML = "";

        updateStatistics();

        const filteredLetters = getFilteredLetters();

        if (filteredLetters.length === 0) {
            const empty = document.createElement("div");
            empty.className = "future-empty-state";

            const emoji = document.createElement("span");
            emoji.textContent = activeFilter === "waiting"
                ? "🌷"
                : activeFilter === "ready"
                    ? "💌"
                    : "✉️";

            const heading = document.createElement("h3");
            const description = document.createElement("p");

            if (activeFilter === "waiting") {
                heading.textContent = "No letters are waiting.";
                description.textContent =
                    "All your letters have reached their opening dates!";
            } else if (activeFilter === "ready") {
                heading.textContent = "Nothing to open just yet.";
                description.textContent =
                    "Your future messages will appear here when their dates arrive.";
            } else {
                heading.textContent = "Your first letter is waiting to be written.";
                description.textContent =
                    "Write something today that your future self will love reading.";
            }

            empty.append(emoji, heading, description);
            letterList.appendChild(empty);

            return;
        }

        filteredLetters.forEach(letter => {
            const ready = isReady(letter);
            const card = document.createElement("article");

            card.className = "future-letter-card";

            // Top section
            const top = document.createElement("div");
            top.className = "letter-card-top";

            const envelope = document.createElement("span");
            envelope.className = "letter-envelope";
            envelope.textContent = ready ? "💌" : "✉️";

            const status = document.createElement("span");
            status.className = ready
                ? "letter-status ready"
                : "letter-status waiting";

            status.textContent = ready ? "Ready to open" : "Sealed";

            top.append(envelope, status);

            // Title
            const heading = document.createElement("h3");
            heading.textContent = letter.title;

            // Description
            const description = document.createElement("p");

            if (ready) {
                description.textContent =
                    "Your future message is ready. Take a moment and read what past you wanted to say.";
            } else {
                const days = getDaysUntil(letter.openDate);

                description.textContent = days === 1
                    ? "Only one more day until you can open this letter!"
                    : `${days} days until this letter is ready to open.`;
            }

            // Date
            const date = document.createElement("div");
            date.className = "letter-card-date";

            date.textContent = `Open date: ${formatDate(letter.openDate)}`;

            // Buttons
            const actions = document.createElement("div");
            actions.className = "letter-card-actions";

            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.className = "letter-card-button";
            openButton.textContent = ready ? "Open letter ♡" : "Still sealed";
            openButton.disabled = !ready;

            if (ready) {
                openButton.addEventListener("click", () => {
                    openLetter(letter.id);
                });
            }

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "letter-delete-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteLetter(letter.id);
            });

            actions.append(openButton, deleteButton);

            card.append(top, heading, description, date, actions);
            letterList.appendChild(card);
        });
    }

    /* -------------------------------------
       OPEN A LETTER
    ------------------------------------- */

    function openLetter(id) {
        const letter = letters.find(item => item.id === id);

        if (!letter || !isReady(letter)) {
            return;
        }

        document.getElementById("modal-letter-title").textContent =
            letter.title;

        document.getElementById("modal-letter-date").textContent =
            `Written by past you · ${formatDate(
                letter.createdAt.slice(0, 10)
            )}`;

        document.getElementById("modal-letter-message").textContent =
            letter.message;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        closeModalButton.focus();
        document.body.style.overflow = "hidden";
    }

    function closeLetter() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    closeModalButton.addEventListener("click", closeLetter);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeLetter();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeLetter();
        }
    });

    /* -------------------------------------
       DELETE A LETTER
    ------------------------------------- */

    function deleteLetter(id) {
        const letter = letters.find(item => item.id === id);

        if (!letter) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${letter.title}"?`
        );

        if (!confirmed) return;

        const previousLetters = [...letters];

        letters = letters.filter(item => item.id !== id);

        if (!saveLetters()) {
            letters = previousLetters;
            return;
        }

        renderLetters();
    }

    /* -------------------------------------
       INITIALISE PAGE
    ------------------------------------- */

    renderLetters();

});
