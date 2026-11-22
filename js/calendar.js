
document.addEventListener('DOMContentLoaded', () => {

    // ==============================================
    // CALENDAR ELEMENTS
    // ==============================================

    const grid = document.querySelector('#calendar-grid');
    const label = document.querySelector('#month-label');
    const selectedLabel = document.querySelector('#selected-date');
    const form = document.querySelector('#event-form');
    const list = document.querySelector('#event-list');

    // Stop if the calendar does not exist on this page.
    if (!grid) return;


    // ==============================================
    // CALENDAR DATA
    // ==============================================

    let view = new Date();
    let selected = new Date();

    let events = JSON.parse(
        localStorage.getItem('forma-calendar-events') || '{}'
    );


    // ==============================================
    // DATE HELPER FUNCTIONS
    // ==============================================

    // Convert a date into YYYY-MM-DD format.
    const key = (date) => {

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, '0')}-${String(
            date.getDate()
        ).padStart(2, '0')}`;

    };


    // Save calendar events.
    const save = () => {

        localStorage.setItem(
            'forma-calendar-events',
            JSON.stringify(events)
        );

    };


    // ==============================================
    // NOTIFICATIONS
    // ==============================================

    function notify(title, body) {

        if (
            'Notification' in window &&
            Notification.permission === 'granted'
        ) {

            new Notification(title, {
                body: body
            });

        } else {

            // Display an on-page reminder if notifications
            // are not available or permission was not granted.

            const toast = document.createElement('div');

            toast.className = 'forma-reminder-toast';
            toast.textContent = `⏰ ${title}: ${body}`;

            document.body.append(toast);

            setTimeout(() => {
                toast.remove();
            }, 12000);

        }

    }


    // ==============================================
    // REMINDER SCHEDULING
    // ==============================================

    let reminderTimers = [];


    function scheduleReminders() {

        // Clear previously scheduled reminders.
        reminderTimers.forEach(clearTimeout);

        reminderTimers = [];


        // Check every saved event.
        Object.entries(events).forEach(([date, items]) => {

            items.forEach((event) => {

                if (!event.time || event.reminder === -1) {
                    return;
                }


                // Calculate when the reminder should appear.
                const eventTime = new Date(
                    `${date}T${event.time}:00`
                ).getTime();

                const reminderTime =
                    eventTime -
                    (Number(event.reminder ?? 10) * 60000);

                const delay = reminderTime - Date.now();


                // Only schedule future reminders.
                if (delay > 0 && delay < 2147480000) {

                    const timer = setTimeout(() => {

                        notify(
                            `Upcoming: ${event.title}`,
                            `${event.time} · ${event.type}`
                        );

                    }, delay);

                    reminderTimers.push(timer);

                }

            });

        });

    }


    // ==============================================
    // DISPLAY SELECTED DAY'S EVENTS
    // ==============================================

    function renderEvents() {

        const selectedKey = key(selected);

        selectedLabel.textContent = selected.toLocaleDateString(
            undefined,
            {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }
        );

        list.innerHTML = '';


        const dayEvents = events[selectedKey] || [];


        dayEvents.forEach((event, index) => {

            const row = document.createElement('div');
            row.className = 'event-item';


            // Event information.
            const info = document.createElement('span');

            info.textContent =
                `${event.time ? event.time + ' · ' : ''}` +
                `${event.title} (${event.type})` +
                `${event.reminder === -1
                    ? ' · no reminder'
                    : ` · reminder ${event.reminder ?? 10}m before`}`;


            // Delete event button.
            const deleteButton = document.createElement('button');

            deleteButton.textContent = '×';
            deleteButton.setAttribute('aria-label', 'Delete event');

            deleteButton.onclick = () => {

                events[selectedKey].splice(index, 1);

                if (!events[selectedKey].length) {
                    delete events[selectedKey];
                }

                save();

                render();
                scheduleReminders();

            };


            row.append(info, deleteButton);
            list.append(row);

        });


        // Show a message if the day is empty.
        if (dayEvents.length === 0) {

            const message = document.createElement('p');

            message.className = 'muted';
            message.textContent =
                'Nothing planned yet. Add an event above.';

            list.append(message);

        }

    }


    // ==============================================
    // CALENDAR HOVER PREVIEW
    // ==============================================

    const preview = document.createElement('div');

    preview.className = 'calendar-hover-preview';
    preview.setAttribute('role', 'tooltip');
    preview.hidden = true;

    document.body.append(preview);


    function showDayPreview(anchor, date, items) {

        preview.replaceChildren();


        // Preview heading.
        const heading = document.createElement('strong');

        heading.textContent = date.toLocaleDateString(
            undefined,
            {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            }
        );

        preview.append(heading);


        // Display each event.
        items.forEach((event) => {

            const item = document.createElement('div');

            item.className = 'calendar-preview-event';


            const time = document.createElement('span');

            time.className = 'calendar-preview-time';
            time.textContent = event.time || 'Any time';


            const title = document.createElement('span');

            title.className = 'calendar-preview-title';
            title.textContent = event.title;


            const category = document.createElement('small');

            category.textContent = event.type || 'Event';


            item.append(time, title, category);

            preview.append(item);

        });


        // Display the preview.
        preview.hidden = false;


        // Position the preview beside the selected date.
        const rect = anchor.getBoundingClientRect();

        const width = Math.min(
            280,
            window.innerWidth - 24
        );

        let left = Math.min(
            Math.max(12, rect.left),
            window.innerWidth - width - 12
        );

        let top = rect.bottom + 8;


        // Move the preview above the date if there is
        // not enough space below it.
        if (top + preview.offsetHeight > window.innerHeight - 12) {

            top = Math.max(
                12,
                rect.top - preview.offsetHeight - 8
            );

        }


        preview.style.width = `${width}px`;
        preview.style.left = `${left}px`;
        preview.style.top = `${top}px`;

    }


    // Hide the hover preview.
    function hideDayPreview() {

        preview.hidden = true;

    }


    // Hide previews when scrolling or resizing.
    window.addEventListener('scroll', hideDayPreview, {
        passive: true
    });

    window.addEventListener('resize', hideDayPreview);


    // ==============================================
    // RENDER MONTHLY CALENDAR
    // ==============================================

    function render() {

        grid.innerHTML = '';


        // Display the current month and year.
        label.textContent = view.toLocaleDateString(
            undefined,
            {
                month: 'long',
                year: 'numeric'
            }
        );


        // Weekday headings.
        const weekdays = [
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
        ];


        weekdays.forEach((day) => {

            const heading = document.createElement('div');

            heading.className = 'calendar-weekday';
            heading.textContent = day;

            grid.append(heading);

        });


        // Find the first day displayed in the calendar.
        const first = new Date(
            view.getFullYear(),
            view.getMonth(),
            1
        );

        const start = new Date(first);

        start.setDate(1 - first.getDay());


        const today = key(new Date());


        // Generate 42 calendar cells.
        for (let i = 0; i < 42; i++) {

            const date = new Date(start);

            date.setDate(start.getDate() + i);


            const dateKey = key(date);

            const dayEvents = events[dateKey] || [];


            // Create the calendar day button.
            const button = document.createElement('button');

            button.className =
                'calendar-day' +
                (date.getMonth() !== view.getMonth() ? ' outside' : '') +
                (dateKey === today ? ' today' : '') +
                (dateKey === key(selected) ? ' selected' : '');

            button.type = 'button';


            // Accessibility label.
            button.setAttribute(
                'aria-label',
                `${date.toLocaleDateString(
                    undefined,
                    {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    }
                )}${
                    dayEvents.length
                        ? `: ${dayEvents.map(event =>
                            `${event.time ? event.time + ' ' : ''}${event.title}`
                        ).join(', ')}`
                        : ', no events'
                }`
            );


            // Day number.
            const number = document.createElement('span');

            number.textContent = date.getDate();

            button.append(number);


            // Add an event indicator if the day has events.
            if (dayEvents.length > 0) {

                const small = document.createElement('small');

                small.textContent =
                    `✦ ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`;

                button.append(small);

                button.classList.add('has-events');


                // Show event preview on hover and keyboard focus.
                button.addEventListener('mouseenter', () => {

                    showDayPreview(button, date, dayEvents);

                });

                button.addEventListener('focus', () => {

                    showDayPreview(button, date, dayEvents);

                });

                button.addEventListener('mouseleave', hideDayPreview);

                button.addEventListener('blur', hideDayPreview);

            }


            // Select the date when clicked.
            button.onclick = () => {

                selected = date;

                hideDayPreview();

                render();

            };


            grid.append(button);

        }


        // Refresh the selected day's event list.
        renderEvents();

    }


    // ==============================================
    // MONTH NAVIGATION
    // ==============================================

    document.querySelector('#prev-month').onclick = () => {

        view.setMonth(view.getMonth() - 1);

        render();

    };


    document.querySelector('#next-month').onclick = () => {

        view.setMonth(view.getMonth() + 1);

        render();

    };


    // ==============================================
    // ADD NEW CALENDAR EVENT
    // ==============================================

    form.onsubmit = async (event) => {

        event.preventDefault();


        const title = document
            .querySelector('#event-title')
            .value
            .trim();


        if (!title) return;


        // Ask for notification permission if needed.
        if (
            'Notification' in window &&
            Notification.permission === 'default'
        ) {

            try {

                await Notification.requestPermission();

            } catch (error) {

                console.warn(
                    'Notification permission could not be requested.',
                    error
                );

            }

        }


        const selectedKey = key(selected);


        // Save the new event.
        (events[selectedKey] ??= []).push({

            title: title,

            time: document.querySelector('#event-time').value,

            type: document.querySelector('#event-type').value,

            reminder: Number(
                document.querySelector('#event-reminder')?.value ?? 10
            )

        });


        save();

        form.reset();

        render();

        scheduleReminders();

    };


    // ==============================================
    // INITIALISE CALENDAR
    // ==============================================

    scheduleReminders();

    render();

});
