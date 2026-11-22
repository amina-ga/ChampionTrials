
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // FORMA THEME SYSTEM
    // =====================================

    const themeButton = document.getElementById("dark-mode");

    const THEME_KEY = "forma-theme";

    // Get saved theme
    function getTheme() {

        try {
            return localStorage.getItem(THEME_KEY) || "light";
        } catch (error) {
            return "light";
        }

    }

    // Apply theme
    function applyTheme(theme) {

        const isDark = theme === "dark";

        document.body.classList.toggle("dark-mode", isDark);

        // Update button icon
        if (themeButton) {

            themeButton.textContent = isDark ? "☀️" : "🌙";

            themeButton.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );

            themeButton.setAttribute(
                "title",
                isDark ? "Light mode" : "Dark mode"
            );

        }

    }

    // Save theme
    function saveTheme(theme) {

        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (error) {
            console.warn("Forma could not save your theme.");
        }

    }

    // Load saved theme when page opens
    applyTheme(getTheme());

    // Toggle theme
    if (themeButton) {

        themeButton.addEventListener("click", () => {

            const currentTheme = getTheme();

            const newTheme =
                currentTheme === "dark" ? "light" : "dark";

            saveTheme(newTheme);

            applyTheme(newTheme);

        });

    }

});
