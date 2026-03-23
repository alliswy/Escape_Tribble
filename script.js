let score = 0;
// ------ 1. GAME STATE -----
const state = {
    hasBdKey: false,
    bdUnlocked: false,
    hasFbKey: false
}

// ----- 2. SELECTORS -----
const menu = document.getElementById('menu-screen');
const startButton = document.getElementById('start-button');
const tutorial = document.getElementById('tutorial');
const backArrow = document.getElementById('master-back-arrow');
const allPages = document.querySelectorAll('.fit');


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

        case 'bd-cart-page':        showPage('bd-door-open-page'); break;
        case 'bd-books-page':       showPage('bd-cart-page'); break;

        case 'bd-fb-open-key-page':
        case 'bd-fb-open-Page':     showPage('bd-books-page'); break;
    }
}

// ----- 5. INITIALIZE EVENT LISTENERS -----

function init() {
    //fixme -- Stephen this is the menu portion for you to do
    //Menu System
    startButton.onclick = () => {
        menu.classList.add('hidden');
        tutorial.classList.remove('hidden');
        showPage('bd-main-page');
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
        showPage('bd-slot-open-page');
    };

    // Door Handle & Locking
    document.getElementById('bd-door-keyhole-hitbox').onclick = () => {
        if (state.hasBdKey) {
            state.bdUnlocked = true;
            alert("Unlocked!"); // Simple feedback
        }
    };
    document.getElementById('bd-door-handle-hitbox').onclick = () => {
        if (state.bdUnlocked) {
            showPage('bd-door-open-page');
        } else {
            alert("It's locked.");
        }
    };

    // Moving further inside
    document.getElementById('bd-cart-hitbox').onclick = () => showPage('bd-cart-page');
    document.getElementById('bd-books-hitbox').onclick = () => showPage('bd-books-page');

    // Fish Book (FB)
    document.getElementById('bd-fb-hitbox').onclick = () => {
        state.hasFbKey ? showPage('bd-fb-open-Page') : showPage('bd-fb-open-key-page');
    };
    document.getElementById('bd-fb-key-hitbox').onclick = () => {
        state.hasFbKey = true;
        showPage('bd-fb-open-Page');
    };
}

init();