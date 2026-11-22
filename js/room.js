
/* =========================================
   FORMA — MY LITTLE ROOM
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "forma-room-data";

    const defaultData = {
        coins: 100,
        owned: [],
        roomColour: "cream",
        lastRewardDate: "",
        lastWaterDate: "",
        plantLevel: 1,
        plantWaterings: 0,
        equipped: []
    };

    let data = loadData();

    const shopItems = {
        "pink-bed": {
            name: "Pink cosy bed",
            emoji: "🛏️",
            price: 30,
            location: "bed"
        },
        "desk": {
            name: "Study desk",
            emoji: "🪑",
            price: 25,
            location: "desk"
        },
        "flower": {
            name: "Flower pot",
            emoji: "🌷",
            price: 15,
            location: "extra"
        },
        "lamp": {
            name: "Cosy lamp",
            emoji: "💡",
            price: 20,
            location: "lamp"
        },
        "teddy": {
            name: "Teddy bear",
            emoji: "🧸",
            price: 20,
            location: "extra"
        },
        "books": {
            name: "Book stack",
            emoji: "📚",
            price: 15,
            location: "extra"
        }
    };

    const plantStages = [
        { emoji: "🌱", name: "Little Sprout" },
        { emoji: "🌿", name: "Growing Friend" },
        { emoji: "🪴", name: "Happy Plant" },
        { emoji: "🌳", name: "Flourishing Tree" }
    ];

    /* -------------------------------------
       LOAD AND SAVE DATA
    ------------------------------------- */

    function loadData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return { ...defaultData };
            }

            const parsed = JSON.parse(saved);

            return {
                ...defaultData,
                ...parsed,
                owned: Array.isArray(parsed.owned) ? parsed.owned : [],
                equipped: Array.isArray(parsed.equipped)
                    ? parsed.equipped
                    : []
            };

        } catch (error) {
            console.error("Could not load room data:", error);
            return { ...defaultData };
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function showMessage(message) {
        const messageBox = document.getElementById("room-message");

        if (messageBox) {
            messageBox.textContent = message;
        }
    }

    /* -------------------------------------
       PROFILE NAME
    ------------------------------------- */

    function loadProfileName() {
        const nameElement = document.getElementById("room-user-name");

        if (!nameElement) return;

        if (window.FormaProfile &&
            typeof window.FormaProfile.current === "function") {

            const profile = window.FormaProfile.current();

            if (profile && profile.name) {
                nameElement.textContent = profile.name;
                return;
            }
        }

        nameElement.textContent = "you";
    }

    /* -------------------------------------
       UPDATE COINS AND STATISTICS
    ------------------------------------- */

    function updateStats() {
        document.getElementById("room-coins").textContent = data.coins;
        document.getElementById("shop-coins").textContent = data.coins;

        document.getElementById("plant-level").textContent =
            data.plantLevel;

        document.getElementById("decor-count").textContent =
            data.owned.length;
    }

    /* -------------------------------------
       DAILY REWARD
    ------------------------------------- */

    function updateDailyReward() {
        const button = document.getElementById("claim-reward");
        const status = document.getElementById("reward-status");

        const today = new Date().toLocaleDateString("en-CA");

        if (data.lastRewardDate === today) {
            button.disabled = true;
            button.textContent = "Reward collected ✓";
            status.textContent = "Your next gift will be ready tomorrow ♡";
        } else {
            button.disabled = false;
            button.textContent = "Collect my reward";
            status.textContent = "Your daily gift is waiting!";
        }
    }

    document.getElementById("claim-reward").addEventListener("click", () => {
        const today = new Date().toLocaleDateString("en-CA");

        if (data.lastRewardDate === today) {
            return;
        }

        data.coins += 10;
        data.lastRewardDate = today;

        saveData();
        updateStats();
        updateDailyReward();

        document.getElementById("reward-status").textContent =
            "You collected 10 coins! Enjoy your little gift. ♡";

        showMessage("A little gift for you! +10 Forma coins 🎁");
    });

    /* -------------------------------------
       PLANT COMPANION
    ------------------------------------- */

    function updatePlant() {
        const stageIndex = Math.min(
            Math.floor((data.plantLevel - 1) / 1),
            plantStages.length - 1
        );

        const stage = plantStages[stageIndex];

        document.getElementById("plant-display-emoji").textContent =
            stage.emoji;

        document.getElementById("room-plant-emoji").textContent =
            stage.emoji;

        document.getElementById("plant-status").textContent =
            `${stage.name} is growing beautifully!`;

        const progress = data.plantWaterings % 3;
        const percentage = (progress / 3) * 100;

        document.getElementById("plant-progress").style.width =
            `${percentage}%`;

        document.getElementById("plant-progress-label").textContent =
            `Level ${data.plantLevel} · ${progress} / 3 waterings`;

        document.getElementById("plant-description").textContent =
            progress === 0
                ? "Water your plant three times to help it reach its next level."
                : `Your plant is growing! ${3 - progress} more watering${3 - progress === 1 ? "" : "s"} until its next level.`;

        const button = document.getElementById("water-plant");
        const today = new Date().toLocaleDateString("en-CA");

        if (data.lastWaterDate === today) {
            button.disabled = true;
            button.textContent = "Already watered today ✓";
        } else {
            button.disabled = false;
            button.textContent = "💧 Water my plant";
        }
    }

    document.getElementById("water-plant").addEventListener("click", () => {
        const today = new Date().toLocaleDateString("en-CA");

        if (data.lastWaterDate === today) {
            showMessage("Your plant has already been watered today. Come back tomorrow! ♡");
            return;
        }

        data.lastWaterDate = today;
        data.plantWaterings += 1;

        if (data.plantWaterings % 3 === 0) {
            data.plantLevel += 1;
            data.coins += 5;

            showMessage("Your plant reached a new level! You earned 5 coins! 🌿");
        } else {
            showMessage("Your plant is feeling loved. Keep helping it grow! 💧");
        }

        saveData();
        updatePlant();
        updateStats();
    });

    /* -------------------------------------
       ROOM COLOUR CUSTOMISATION
    ------------------------------------- */

    function updateRoomColour() {
        document.body.dataset.roomColour = data.roomColour;

        document.querySelectorAll(".room-colour").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.roomColour === data.roomColour
            );
        });
    }

    document.querySelectorAll(".room-colour").forEach(button => {
        button.addEventListener("click", () => {
            data.roomColour = button.dataset.roomColour;

            saveData();
            updateRoomColour();

            showMessage("Your room has a fresh new look! ♡");
        });
    });

    /* -------------------------------------
       BUY DECORATIONS
    ------------------------------------- */

    function buyItem(itemId) {
        const item = shopItems[itemId];

        if (!item) return;

        if (data.owned.includes(itemId)) {
            showMessage("You already own this decoration. ♡");
            return;
        }

        if (data.coins < item.price) {
            showMessage("You need more coins to buy this. Collect your daily reward! 🪙");
            return;
        }

        data.coins -= item.price;
        data.owned.push(itemId);
        data.equipped.push(itemId);

        saveData();

        updateStats();
        renderShop();
        renderInventory();
        renderRoom();

        showMessage(`${item.name} is now yours! Enjoy decorating. ✨`);
    }

    document.querySelectorAll("[data-buy]").forEach(button => {
        button.addEventListener("click", () => {
            buyItem(button.dataset.buy);
        });
    });

    /* -------------------------------------
       SHOP DISPLAY
    ------------------------------------- */

    function renderShop() {
        document.querySelectorAll(".shop-item").forEach(card => {
            const itemId = card.dataset.item;
            const button = card.querySelector(".shop-buy-button");
            const item = shopItems[itemId];

            if (!item || !button) return;

            const isOwned = data.owned.includes(itemId);

            button.textContent = isOwned ? "Owned ✓" : "Buy";
            button.disabled = isOwned;
            button.classList.toggle("owned", isOwned);
        });
    }

    /* -------------------------------------
       ROOM DECORATIONS
    ------------------------------------- */

    function renderRoom() {
        const bed = document.getElementById("room-bed");
        const desk = document.getElementById("room-desk");
        const lamp = document.getElementById("room-lamp");
        const extra = document.getElementById("room-extra");

        bed.style.display = data.equipped.includes("pink-bed")
            ? "block"
            : "none";

        desk.style.display = data.equipped.includes("desk")
            ? "block"
            : "none";

        lamp.style.display = data.equipped.includes("lamp")
            ? "block"
            : "none";

        const extraItems = data.equipped
            .filter(id => shopItems[id]?.location === "extra")
            .map(id => shopItems[id].emoji);

        extra.textContent = extraItems.join(" ");
    }

    /* -------------------------------------
       INVENTORY
    ------------------------------------- */

    function renderInventory() {
        const inventory = document.getElementById("room-inventory");

        if (data.owned.length === 0) {
            inventory.innerHTML =
                '<p class="empty-inventory">Your collection will appear here. Visit the shop to get started! ♡</p>';
            return;
        }

        inventory.innerHTML = "";

        data.owned.forEach(itemId => {
            const item = shopItems[itemId];

            if (!item) return;

            const isEquipped = data.equipped.includes(itemId);

            const row = document.createElement("div");
            row.className = "inventory-item";

            const label = document.createElement("span");
            label.textContent = `${item.emoji} ${item.name}`;

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = isEquipped ? "Put away" : "Place";

            button.addEventListener("click", () => {
                if (isEquipped) {
                    data.equipped = data.equipped.filter(
                        id => id !== itemId
                    );
                } else {
                    data.equipped.push(itemId);
                }

                saveData();
                renderInventory();
                renderRoom();

                showMessage(
                    isEquipped
                        ? `${item.name} was put away.`
                        : `${item.name} has been placed in your room!`
                );
            });

            row.append(label, button);
            inventory.appendChild(row);
        });
    }

    /* -------------------------------------
       INITIALISE ROOM
    ------------------------------------- */

    loadProfileName();
    updateStats();
    updateDailyReward();
    updatePlant();
    updateRoomColour();
    renderShop();
    renderInventory();
    renderRoom();

    saveData();

});
