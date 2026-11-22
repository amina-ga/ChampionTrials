
/*
==================================================
FORMA — LOCAL PROFILE SYSTEM
==================================================

This is a browser-based profile prototype.

Important:
- Profiles are stored in the browser's localStorage.
- This is not secure server-side authentication.
- Passwords are not securely stored or verified.
- Profiles are only available in this browser.
*/

(() => {

    // ==============================================
    // STORAGE KEYS
    // ==============================================

    const PROFILE_KEY = 'forma-profiles';
    const SESSION_KEY = 'forma-active-profile';


    // ==============================================
    // ORIGINAL STORAGE METHODS
    // ==============================================

    const nativeGet = Storage.prototype.getItem;
    const nativeSet = Storage.prototype.setItem;
    const nativeRemove = Storage.prototype.removeItem;


    // ==============================================
    // ACTIVE PROFILE
    // ==============================================

    const getActiveProfile = () => {
        return nativeGet.call(localStorage, SESSION_KEY);
    };


    // ==============================================
    // PROFILE-SPECIFIC STORAGE
    // ==============================================

    const getScopedKey = (key) => {

        const excludedKeys = [
            'forma-profiles',
            'forma-active-profile',
            'forma-theme'
        ];

        const profile = getActiveProfile();

        if (
            key.startsWith('forma-') &&
            !excludedKeys.includes(key) &&
            profile
        ) {
            return `forma-user:${profile}:${key}`;
        }

        return key;
    };


    // Keep each profile's data separate.
    Storage.prototype.getItem = function (key) {
        return nativeGet.call(this, getScopedKey(String(key)));
    };

    Storage.prototype.setItem = function (key, value) {
        return nativeSet.call(this, getScopedKey(String(key)), value);
    };

    Storage.prototype.removeItem = function (key) {
        return nativeRemove.call(this, getScopedKey(String(key)));
    };


    // ==============================================
    // FORMA PROFILE FUNCTIONS
    // ==============================================

    window.FormaProfile = {

        // Get the currently active profile.
        current() {

            const id = getActiveProfile();

            if (!id) {
                return null;
            }

            const profiles = JSON.parse(
                nativeGet.call(localStorage, PROFILE_KEY) || '{}'
            );

            return profiles[id] || null;
        },


        // Create or activate a local profile.
        signIn(name, email) {

            const id = email.trim().toLowerCase();

            const profiles = JSON.parse(
                nativeGet.call(localStorage, PROFILE_KEY) || '{}'
            );

            profiles[id] = {
                id: id,
                name: name.trim(),
                email: id
            };

            nativeSet.call(
                localStorage,
                PROFILE_KEY,
                JSON.stringify(profiles)
            );

            nativeSet.call(localStorage, SESSION_KEY, id);
        },


        // Sign out of the current profile.
        signOut() {

            nativeRemove.call(localStorage, SESSION_KEY);

        },


        // Save a completed game result.
        recordGame(game, score) {

            const records = JSON.parse(
                localStorage.getItem('forma-game-records') || '[]'
            );

            records.push({
                game: game,
                score: score,
                at: new Date().toISOString()
            });

            localStorage.setItem(
                'forma-game-records',
                JSON.stringify(records)
            );

        },


        // Get a summary of the user's activity.
        summary() {

            const read = (key) => {

                try {
                    return JSON.parse(
                        localStorage.getItem(key) || '[]'
                    );

                } catch {
                    return [];
                }

            };

            const events = read('forma-calendar-events');

            return {

                tasks: read('forma-space-tasks').length,

                events: Object.values(events).reduce(
                    (total, dayEvents) => total + dayEvents.length,
                    0
                ),

                games: read('forma-game-records').length

            };

        }

    };


    // ==============================================
    // PAGE AND FORM FUNCTIONALITY
    // ==============================================

    document.addEventListener('DOMContentLoaded', () => {


        // ==========================================
        // SIGN-UP FORM
        // ==========================================

        const signupForm = document.querySelector('#signup-form');

        if (signupForm) {

            signupForm.addEventListener('submit', (event) => {

                event.preventDefault();

                const password =
                    document.querySelector('#password')?.value || '';

                const confirmPassword =
                    document.querySelector('#confirm-password')?.value || '';


                // Check that both password fields match.
                if (password !== confirmPassword) {

                    alert('Your passwords do not match.');

                    return;

                }


                const name =
                    document.querySelector('#fullname').value;

                const email =
                    document.querySelector('#email').value;


                FormaProfile.signIn(name, email);

                location.href = 'profile.html';

            });

        }


        // ==========================================
        // LOGIN FORM
        // ==========================================

        const loginForm = document.querySelector('#login-form');

        if (loginForm) {

            loginForm.addEventListener('submit', (event) => {

                event.preventDefault();

                const email = document
                    .querySelector('#login-email')
                    .value
                    .trim()
                    .toLowerCase();

                const profiles = JSON.parse(
                    nativeGet.call(localStorage, PROFILE_KEY) || '{}'
                );


                // Check whether the profile exists.
                if (!profiles[email]) {

                    alert(
                        'No local Forma profile was found for that email. Create a profile first.'
                    );

                    return;

                }


                nativeSet.call(localStorage, SESSION_KEY, email);

                location.href = 'profile.html';

            });

        }


        // ==========================================
        // PROFILE PAGE
        // ==========================================

        const profileForm = document.querySelector('#profile-form');

        if (!profileForm) {
            return;
        }


        const signedOut =
            document.querySelector('#profile-signed-out');

        const signedIn =
            document.querySelector('#profile-signed-in');


        // ==========================================
        // UPDATE PROFILE INFORMATION
        // ==========================================

        const refreshProfile = () => {

            const profile = FormaProfile.current();

            signedOut.hidden = !!profile;
            signedIn.hidden = !profile;


            if (profile) {

                // Profile avatar.
                document.querySelector('#profile-avatar').textContent =
                    (profile.name[0] || 'F').toUpperCase();


                // Profile name and email.
                document.querySelector('#profile-display-name').textContent =
                    `Welcome, ${profile.name}!`;

                document.querySelector('#profile-display-email').textContent =
                    profile.email;


                // Activity statistics.
                const stats = FormaProfile.summary();

                document.querySelector('#profile-task-count').textContent =
                    stats.tasks;

                document.querySelector('#profile-event-count').textContent =
                    stats.events;

                document.querySelector('#profile-game-count').textContent =
                    stats.games;

            }

        };


        // ==========================================
        // UPDATE PROFILE FORM
        // ==========================================

        profileForm.addEventListener('submit', (event) => {

            event.preventDefault();

            const name =
                document.querySelector('#profile-name').value;

            const email =
                document.querySelector('#profile-email').value;


            FormaProfile.signIn(name, email);

            refreshProfile();

        });


        // ==========================================
        // SWITCH PROFILE / SIGN OUT
        // ==========================================

        document
            .querySelector('#profile-switch')
            .addEventListener('click', () => {

                FormaProfile.signOut();

                refreshProfile();

            });


        // Load the current profile when the page opens.
        refreshProfile();

    });

})();
