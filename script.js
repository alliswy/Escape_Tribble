let score = 0;
// ------ 1. GAME STATE -----
const state = {
    hasBdKey: false,
    bdUnlocked: false,
    hasFbKey: false,
    bdBackDoorUnlocked: false
}

// ----- 2. SELECTORS -----
const menu = document.getElementById('menu-screen');
const startButton = document.getElementById('start-button');
const tutorial = document.getElementById('tutorial');
const backArrow = document.getElementById('master-back-arrow');
const allPages = document.querySelectorAll('.fit');
const inventoryTab = document.getElementById('inventory-tab');
    const inventoryMenu = document.getElementById('inventory-drawer');


// ----- 3. CORE FUNCTIONS ----

function showPage(pageId) {
    allPages.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
    }

    //fixme when add later rooms after tutorial
    // Auto-hide back arrow on the very first screen
    if (pageId === 'bd-main-page') {
        backArrow.classList.add('hidden');
    } else {
        backArrow.classList.remove('hidden');
    }
}

// ---- 4. NAVIGATION LOGIC -----
function goBack() {
    const current = Array.from(allPages).find(p => !p.classList.contains('hidden'));
    if (!current) return;

    switch (current.id) {
        case 'bd-door-page':
        case 'bd-door-open-page':   showPage('bd-main-page'); break;

        case 'bd-closed-page':
        case 'bd-door-handle-page': showPage('bd-door-page'); break;

        case 'bd-slot-open-key-page':
        case 'bd-slot-open-page':   showPage('bd-closed-page'); break;

        case 'bd-cart-page':
        case 'bd-back-door-handle-page':    showPage('bd-door-open-page'); break;

        case 'bd-books-page':       showPage('bd-cart-page'); break;

        case 'bd-fb-open-key-page':
        case 'bd-fb-open-page':     showPage('bd-books-page'); break;
    }
}

// ----- INVENTORY MENU ----- //
inventoryTab.onclick = () => {
    // This slides the drawer in/out
    inventoryMenu.classList.toggle('drawer-closed');

    // This flips the arrow icon
    inventoryMenu.classList.toggle('drawer-open');
};

// ---- TYPEWRITER EFFECT ----
function typeWriter(element, text, speed, callback) {
    let i = 0;
    element.textContent = '';
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

function runMenuTypewriter() {
    const title = document.getElementById('menu-title');
    const buttons = document.querySelectorAll('.menu-btn');

    //Type the title first
    typeWriter(title, 'Escape Tribble', 80, () => {
        //Then reveal each button one by one with a short delay between
        let delay = 200;
        buttons.forEach((btn) => {
            setTimeout(() => {
                btn.classList.add('visible');
            }, delay);
            delay += 300;
        });
    });
}


// ----- 5. INITIALIZE EVENT LISTENERS -----

function init() {
    //Menu System
    runMenuTypewriter();
    startButton.onclick = () => {
        menu.classList.add('hidden');
        tutorial.classList.remove('hidden');
        showPage('bd-main-page');
        document.getElementById('inventory-drawer').classList.remove('hidden');
        document.getElementById('hamburger-menu').classList.remove('hidden');
    };

    //How to Play button
    document.getElementById('how-to-play-button').onclick = () => {
        menu.classList.add('hidden');
        document.getElementById('how-to-play-screen').classList.remove('hidden');
    };

    //Back button from How to Play
    document.getElementById('htp-back-button').onclick = () => {
        document.getElementById('how-to-play-screen').classList.add('hidden');
        menu.classList.remove('hidden');
    };

    //Settings button
    document.getElementById('settings-button').onclick = () => {
        menu.classList.add('hidden');
        document.getElementById('settings-screen').classList.remove('hidden');
    };

    //Back button from Settings
    document.getElementById('settings-back-button').onclick = () => {
        document.getElementById('settings-screen').classList.add('hidden');
        menu.classList.remove('hidden');
    };

    //Volume toggle
    document.getElementById('volume-toggle').onchange = (e) => {
        //FIXME
        //placeholder - will connect to audio when sound is added
        console.log('Sound:', e.target.checked ? 'on' : 'off');
    };

    //Fullscreen toggle
    document.getElementById('fullscreen-toggle').onchange = (e) => {
        if(e.target.checked) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    //Exit button
    document.getElementById('exit-button').onclick = () => {
        window.close();
    };

    // ---- IN-GAME HAMBURGER MENU ----
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');

    hamburgerIcon.onclick = () => {
        hamburgerDropdown.classList.toggle('dropdown-open');
    };

    //Restart button
    document.getElementById('restart-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');
        location.reload();
    };

    //Quit to main menu button
    document.getElementById('quit-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');
        tutorial.classList.add('hidden');
        document.getElementById('inventory-drawer').classList.add('hidden');
        document.getElementById('hamburger-menu').classList.add('hidden');
        menu.classList.remove('hidden');
        runMenuTypewriter();
    };


    backArrow.onclick = goBack;

    // --- Book Drop (BD) Interactions ---

    // Main -> Door
    document.getElementById('bd-door-hitbox').onclick = () => showPage('bd-door-page');

    // Door -> Slot or Handle
    document.getElementById('bd-slot-hitbox').onclick = () => showPage('bd-closed-page');
    document.getElementById('bd-handle-hitbox').onclick = () => showPage('bd-door-handle-page');

    // Inside the Slot
    document.getElementById('bd-closed-hitbox').onclick = () => {
        state.hasBdKey ? showPage('bd-slot-open-page') : showPage('bd-slot-open-key-page');
    };
    document.getElementById('bd-key-hitbox').onclick = () => {
        state.hasBdKey = true;
        const keySlot = document.getElementById('inv-bd-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        showPage('bd-slot-open-page');
    };

    // bd Door Handle & Locking
    document.getElementById('bd-door-keyhole-hitbox').onclick = () => {
        if (state.hasBdKey) {
            state.bdUnlocked = true;
            const keySlot = document.getElementById('inv-bd-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
            }
            alert("Unlocked!"); // fixme feedback
        }
    };
    document.getElementById('bd-door-handle-hitbox').onclick = () => {
        if (state.bdUnlocked) {
            showPage('bd-door-open-page');
        } else {
            alert("It's locked."); //fixme feedback
        }
    };

    // book drop cart
    document.getElementById('bd-cart-hitbox').onclick = () => showPage('bd-cart-page');
    document.getElementById('bd-books-hitbox').onclick = () => showPage('bd-books-page');
    document.getElementById('bd-fb-open-hitbox').onclick = () => showPage('bd-books-page');

    // Fish Book (FB)
    document.getElementById('bd-fb-hitbox').onclick = () => {
        state.hasFbKey ? showPage('bd-fb-open-page') : showPage('bd-fb-open-key-page');
    };
    document.getElementById('bd-fb-key-hitbox').onclick = () => {
        state.hasFbKey = true;
        const keySlot = document.getElementById('inv-fb-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        showPage('bd-fb-open-page');
    };

    // door behind book drop and locking
    document.getElementById('bd-back-door-hitbox').onclick = () => showPage('bd-back-door-handle-page');

    document.getElementById('bd-back-handle-keyhole-hitbox').onclick = () => {
        if (state.hasFbKey) {
            state.bdBackDoorUnlocked = true;
            const keySlot = document.getElementById('inv-fb-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
            }
            alert("Unlocked!"); // fixme feedback
        }
    };
    document.getElementById('bd-back-handle-handle-hitbox').onclick = () => {
        if (state.bdBackDoorUnlocked) {
            showPage('bd-back-door-open-page');
        } else {
            alert("It's locked."); //fixme feedback
        }
    };
}

init();