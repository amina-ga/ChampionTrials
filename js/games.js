
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. MEMORY MATCH
    // =====================================

    const start = document.querySelector("#memory-start");
    const board = document.querySelector("#memory-board");
    const memoryOutput = document.querySelector("#memory-output");

    if (start && board && memoryOutput) {

        start.addEventListener("click", () => {

            board.innerHTML = "";
            memoryOutput.textContent = "Moves: 0";

            const values = [
                "🌸", "⭐", "💜", "🌙", "🍓", "☁️",
                "🌸", "⭐", "💜", "🌙", "🍓", "☁️"
            ];

            // Proper shuffle
            for (let i = values.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [values[i], values[j]] = [values[j], values[i]];
            }

            let first = null;
            let locked = false;
            let moves = 0;
            let matched = 0;

            values.forEach(value => {

                const tile = document.createElement("button");
                tile.type = "button";
                tile.className = "memory-tile";
                tile.textContent = "?";

                tile.addEventListener("click", () => {

                    if (locked || tile.disabled || tile === first) return;

                    tile.textContent = value;

                    if (!first) {
                        first = tile;
                        return;
                    }

                    moves++;
                    memoryOutput.textContent = `Moves: ${moves}`;

                    if (first.textContent === value) {

                        first.disabled = true;
                        tile.disabled = true;

                        first.classList.add("matched");
                        tile.classList.add("matched");

                        first = null;
                        matched += 2;

                        if (matched === values.length) {
                            memoryOutput.textContent =
                                `You matched them all in ${moves} moves! 🎉`;

                            window.FormaProfile?.recordGame(
                                "Memory Match",
                                `${moves} moves`
                            );
                        }

                    } else {

                        locked = true;
                        const previous = first;
                        first = null;

                        setTimeout(() => {
                            previous.textContent = "?";
                            tile.textContent = "?";
                            locked = false;
                        }, 700);

                    }

                });

                board.appendChild(tile);

            });

        });

    }


    // =====================================
    // 2. QUICK MATHS
    // =====================================

    let answer = null;
    let round = 0;
    let score = 0;

    const mathQuestion = document.querySelector("#math-q");
    const mathInput = document.querySelector("#math-input");
    const mathCheck = document.querySelector("#math-check");
    const mathOutput = document.querySelector("#math-out");

    function nextMath() {

        const a = 1 + Math.floor(Math.random() * 15);
        const b = 1 + Math.floor(Math.random() * 15);

        const operators = ["+", "−", "×"];
        const operator = operators[
            Math.floor(Math.random() * operators.length)
        ];

        if (operator === "+") answer = a + b;
        if (operator === "−") answer = a - b;
        if (operator === "×") answer = a * b;

        mathQuestion.textContent = `${a} ${operator} ${b} = ?`;
        mathInput.value = "";
        mathInput.focus();

    }

    if (mathCheck && mathQuestion && mathInput && mathOutput) {

        mathCheck.addEventListener("click", () => {

            // Start or restart
            if (answer === null && round === 0) {

                score = 0;
                round = 0;

                nextMath();
                mathOutput.textContent = "Question 1 of 10";

                return;
            }

            if (answer === null) return;

            if (mathInput.value.trim() === "") {
                mathOutput.textContent = "Enter an answer first! 💜";
                return;
            }

            if (Number(mathInput.value) === answer) {
                score++;
            }

            round++;
            answer = null;

            if (round === 10) {

                mathQuestion.textContent = "Challenge complete! 🎉";
                mathOutput.textContent = `Your final score: ${score}/10 🏆`;
                mathCheck.textContent = "Play again";

                window.FormaProfile?.recordGame(
                    "Quick Maths",
                    `${score}/10`
                );

            } else {

                mathOutput.textContent =
                    `Score: ${score} · Question ${round + 1} of 10`;

                nextMath();

            }

        });

    }


    // =====================================
    // 3. TYPING SPRINT
    // =====================================

    let typingStarted = null;

    const typingInput = document.querySelector("#typing-text");
    const typingPrompt = document.querySelector("#typing-prompt");
    const typingCheck = document.querySelector("#typing-check");
    const typingOutput = document.querySelector("#typing-out");

    if (typingInput && typingPrompt && typingCheck && typingOutput) {

        typingInput.addEventListener("input", () => {

            if (!typingStarted && typingInput.value.length > 0) {
                typingStarted = Date.now();
            }

        });

        typingCheck.addEventListener("click", () => {

            const target = typingPrompt.textContent.trim();

            if (typingInput.value.trim() !== target) {

                typingOutput.textContent =
                    "Not quite yet! Try matching the sentence exactly. 🌷";

                return;
            }

            if (!typingStarted) {
                typingOutput.textContent = "Start typing first!";
                return;
            }

            const elapsed = (Date.now() - typingStarted) / 60000;

            const wordCount = target.split(/\s+/).length;

            const wpm = Math.round(wordCount / Math.max(elapsed, 0.01));

            typingOutput.textContent =
                `${wpm} words per minute! Amazing work! ✨`;

            window.FormaProfile?.recordGame(
                "Typing Sprint",
                `${wpm} WPM`
            );

            typingStarted = null;
            typingInput.value = "";

        });

    }


    // =====================================
    // 4. WORD SCRAMBLE
    // =====================================

    const words = [
        "PURPLE",
        "FOCUS",
        "PLANET",
        "FLOWER",
        "GARDEN",
        "CREATE"
    ];

    let currentWord = null;

    const scrambleWord = document.querySelector("#scramble-word");
    const scrambleInput = document.querySelector("#scramble-input");
    const scrambleCheck = document.querySelector("#scramble-check");
    const scrambleOutput = document.querySelector("#scramble-out");

    function newScramble() {

        currentWord = words[
            Math.floor(Math.random() * words.length)
        ];

        const letters = currentWord.split("");

        // Shuffle letters without accidentally leaving the word unchanged
        let scrambled = currentWord;

        while (scrambled === currentWord) {

            for (let i = letters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [letters[i], letters[j]] = [letters[j], letters[i]];
            }

            scrambled = letters.join("");
        }

        scrambleWord.textContent = scrambled;
        scrambleInput.value = "";
        scrambleOutput.textContent = "";
        scrambleCheck.textContent = "Check word";

    }

    if (scrambleCheck && scrambleWord && scrambleInput && scrambleOutput) {

        scrambleCheck.addEventListener("click", () => {

            if (!currentWord) {
                newScramble();
                return;
            }

            if (scrambleInput.value.trim().toUpperCase() === currentWord) {

                scrambleOutput.textContent = "Correct! You're amazing! ✨";

                window.FormaProfile?.recordGame(
                    "Word Scramble",
                    "Solved"
                );

                currentWord = null;
                scrambleCheck.textContent = "Next word";

            } else {

                scrambleOutput.textContent =
                    "Not quite! Give it another try. 💜";

            }

        });

    }


    // =====================================
    // 5. NUMBER SEQUENCE
    // =====================================

    const sequenceQuestion = document.querySelector("#sequence-q");
    const sequenceInput = document.querySelector("#sequence-input");
    const sequenceCheck = document.querySelector("#sequence-check");
    const sequenceOutput = document.querySelector("#sequence-out");

    let sequenceAnswer = null;

    if (sequenceCheck && sequenceQuestion && sequenceInput && sequenceOutput) {

        sequenceCheck.addEventListener("click", () => {

            // Generate sequence
            if (sequenceAnswer === null) {

                const step = Math.random() < 0.5 ? 3 : 5;
                const beginning = step === 3 ? 2 : 4;

                sequenceAnswer = beginning + step * 4;

                sequenceQuestion.textContent =
                    `${beginning}, ${beginning + step}, ${beginning + step * 2}, ${beginning + step * 3}, ?`;

                sequenceInput.value = "";
                sequenceOutput.textContent = "";
                sequenceCheck.textContent = "Check";

                return;
            }

            if (sequenceInput.value.trim() === "") {
                sequenceOutput.textContent = "Enter your answer first!";
                return;
            }

            if (Number(sequenceInput.value) === sequenceAnswer) {

                sequenceOutput.textContent = "You got it! 🎉";

                window.FormaProfile?.recordGame(
                    "Number Sequence",
                    "Correct"
                );

            } else {

                sequenceOutput.textContent =
                    `Not quite! The answer was ${sequenceAnswer}. 💜`;

            }

            sequenceAnswer = null;
            sequenceCheck.textContent = "Try another";

        });

    }


    // =====================================
    // 6. REACTION TEST
    // =====================================

    const reactionStart = document.querySelector("#reaction-start");
    const reactionPad = document.querySelector("#reaction-pad");
    const reactionOutput = document.querySelector("#reaction-out");

    let ready = false;
    let waiting = false;
    let goAt = 0;
    let timeout = null;

    if (reactionStart && reactionPad && reactionOutput) {

        reactionStart.addEventListener("click", () => {

            clearTimeout(timeout);

            ready = false;
            waiting = true;

            reactionPad.style.background = "#f5e7df";
            reactionPad.textContent = "Wait for green...";
            reactionOutput.textContent = "";

            timeout = setTimeout(() => {

                ready = true;
                waiting = false;

                goAt = performance.now();

                reactionPad.style.background = "#dff3e4";
                reactionPad.textContent = "CLICK NOW!";

            }, 1200 + Math.random() * 3000);

        });

        reactionPad.addEventListener("click", () => {

            if (waiting) {

                clearTimeout(timeout);
                timeout = null;

                waiting = false;
                ready = false;

                reactionPad.textContent = "Too soon! Try again.";
                reactionOutput.textContent =
                    "Oops! Wait until the green color appears. 🌸";

                return;

            }

            if (!ready) return;

            const milliseconds = Math.round(
                performance.now() - goAt
            );

            reactionOutput.textContent =
                `Your reaction time: ${milliseconds} ms ⚡`;

            window.FormaProfile?.recordGame(
                "Reaction Test",
                `${milliseconds} ms`
            );

            ready = false;

            reactionPad.style.background = "#eee7f7";
            reactionPad.textContent = "Nice reaction! 💜";

        });

    }

});

