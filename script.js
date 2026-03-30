//PERSONAL NOTE: paste the following into console on inspection for ease of testing
// Object.keys(state).forEach(key => state[key] = true);
//
// // Show all key images in the inventory UI
// document.querySelectorAll('.inv-item').forEach(item => item.classList.remove('hidden'));
//
// console.log("God Mode Activated: All keys obtained and doors unlocked.");


let score = 0;
// ------ 1. GAME STATE -----
const state = {
    hasBdKey: false,
    hasPrKey: false,
    hasKiKey: false,
    hasLiKey: false,
    hasPwBook: false,
    hasCamrKey: false,

    bdUnlocked: false,
    bdBackDoorUnlocked: false,
    kiUnlocked: false,
    liUnlocked: false,
    crUnlocked: false,
    camrUnlocked: false,

    camrDoorOpen: false, //this is the room with the two monitors in the creepy room
    crlDoorOpen: false, //this is the door to the left of the camera room^ in the creepy room. Note: if this door is open, camrDoorOpen = true;
    crDoorOpen: false,

    discoveredBd: false,
    discoveredPr: false,

    solvedWirePuzzle: false,
    foundPtCode: false,

    isProjectorOn: false,
    isLeftMonitorOn: false,
    isRightMonitorOn: false,
}

// ----- 2. SELECTORS -----
const menu = document.getElementById('menu-screen');
const tutorial = document.getElementById('tutorial');

const startButton = document.getElementById('start-button');
const play = document.getElementById('play');
const backArrow = document.getElementById('master-back-arrow');
const forwardArrow = document.getElementById('master-forward-arrow');
const rightArrow = document.getElementById('master-right-arrow');
const leftArrow = document.getElementById('master-left-arrow');
const allPages = document.querySelectorAll('.fit');
const inventoryTab = document.getElementById('inventory-tab');

// ----- NAVIGATION MAP -----
const roomLeads = {
    // Book Drop (BD)
    'bd-main-page':           { right: 'mh-bd-right-endc-page', left: 'mh-bd-left-endc-page' },
    'bd-door-page':           { back: 'bd-main-page', forward: 'bd-slot-closed-page' },
    'bd-door-open-page':      { back: 'bd-main-page', forward: 'bd-cart-page' },
    'bd-slot-closed-page':    { back: 'bd-door-page' },
    'bd-door-handle-page':    { back: 'bd-door-page' },
    'bd-slot-open-key-page':  { back: 'bd-slot-closed-page' },
    'bd-slot-open-page':      { back: 'bd-slot-closed-page' },
    'bd-cart-page':           { back: 'bd-door-open-page', forward: 'bd-books-page' },
    'bd-back-door-handle-page': { back: 'bd-door-open-page' },
    'bd-books-page':          { back: 'bd-cart-page' },
    'bd-fb-open-key-page':    { back: 'bd-books-page' },
    'bd-fb-open-page':        { back: 'bd-books-page' },
    'bd-back-door-open-page': { back: 'bd-door-open-page' },

    // Projector Room (PR)
    'pr-steps-page':          { back: 'bd-back-door-open-page', forward: 'pr-main-page' },
    'pr-main-page':           { back: 'pr-steps-page' },
    'pr-wr-main-page':        { back: () => state.isProjectorOn ? 'pr-main-po-page': 'pr-main-page'},
    'pr-pw-main-book-page':   { back: 'pr-main-page' },
    'pr-pw-main-noBook-page': { back: 'pr-main-page' },
    'pr-pw-hole-book-page':   { back: () => state.isProjectorOn ? 'pr-pw-main-book-po-page' : 'pr-pw-main-book-page'},
    'pr-pw-hole-noBook-page': { back: () => state.isProjectorOn ? 'pr-pw-main-noBook-po-page' : 'pr-pw-main-noBook-page'},
    'pr-wr-wires-page':       { back: 'pr-wr-main-page', forward: 'pr-wr-box-page' },
    'pr-wr-box-page':         { back: 'pr-wr-wires-page' },
    'pr-pw-book-projector-off-page': {back: 'pr-pw-main-book-page'},
    'pr-pw-noBook-projector-off-page': {back: 'pr-pw-main-noBook-page'},

    'pr-pw-book-projector-on-page':   { back: 'pr-pw-main-book-po-page' },
    'pr-pw-noBook-projector-on-page': {back: 'pr-pw-main-noBook-po-page'},
    'pr-pw-main-book-po-page':          {back: 'pr-main-po-page'},
    'pr-pw-main-noBook-po-page':        {back: 'pr-main-po-page'},
    'pr-main-po-page':                  {back: 'pr-steps-po-page'},
    'pr-steps-po-page':                 { back: 'bd-back-door-open-page', forward: 'pr-main-po-page'},

    // Main Hall (Right Side)
    'mh-sl-right-endc-page':    { back: 'mh-sl-right-endc-page', forward: 'mh-hall-right-endc-page', left: 'mh-sld-page' },
    'mh-hall-right-endc-page':  { back: 'mh-sl-right-endc-page', forward: 'mh-bh-right-endc-page' },
    'mh-bh-right-endc-page':    { back: 'mh-hall-right-endc-page', forward: 'mh-trash-right-endc-page', right: 'bh-entrance-page' },
    'mh-trash-right-endc-page': { back: 'mh-bh-right-endc-page', forward: 'mh-bd-right-endc-page' },
    'mh-bd-right-endc-page':    { back: 'mh-trash-right-endc-page', forward: 'mh-li-right-endc-page', left: 'bd-main-page' },
    'mh-li-right-endc-page':    { back: 'mh-bd-right-endc-page', forward: 'mh-cend-right-endc-kc-page', left: 'li-door-closed-page' },
    'mh-cend-right-endc-kc-page': { back: 'mh-li-right-endc-page', right: 'ki-door-closed-page' },

    // Main Hall (Left Side)
    'mh-cend-left-endc-page':   { forward: 'mh-li-left-endc-page', left: 'ki-door-closed-page' },
    'mh-li-left-endc-page':     { back: 'mh-cend-left-endc-page', forward: 'mh-bd-left-endc-page', right: 'li-door-closed-page' },
    'mh-bd-left-endc-page':     { back: 'mh-li-left-endc-page', forward: 'mh-bh-left-endc-page', right: 'bd-main-page' },
    'mh-bh-left-endc-page':     { back: 'mh-bd-left-endc-page', forward: 'mh-hall-left-endc-page', left: 'bh-entrance-page'},
    'mh-hall-left-endc-page':   { back: 'mh-bh-left-endc-page', forward: 'mh-sl-left-endc-page' },
    'mh-sl-left-endc-page':     { back: 'mh-hall-left-endc-page', right: 'mh-sld-page' },

    'mh-sld-page':            { left: 'mh-sl-left-endc-page', right: 'mh-sl-right-endc-page' },

    // back hall
    'bh-entrance-page':       { back: 'mh-bh-right-endc-page', forward: 'bh-2-page', left: 'mh-bh-right-endc-page', right: 'mh-bh-left-endc-page' },
    'bh-2-page':              { back: 'bh-entrance-page', forward: 'bh-3-page' },
    'bh-3-page':              { back: 'bh-2-page', forward: 'bh-4-page' },
    'bh-4-page':            { back: 'bh-3-page', forward: 'bh-end-page', left: 'bh-sh-entrance-page'},
    'bh-sh-entrance-page':   {back: 'bh-4-page', forward: 'bh-sh-cr-dc-page'},
    'bh-sh-cr-dc-page':      {back: 'bh-sh-entrance-page'},
    'bh-end-page':          {back: 'bh-4-page'},
    'bh-sh-cr-do-page':      {back: 'bh-sh-cr-dc-page' },
    'sh-cr-door-open-page':    {back: 'bh-sh-cr-do-page'},
    'sh-cr-door-closed-page':   {back: 'bh-sh-cr-dc-page'},

    //creepy room
    'cr-main-2dc-page':     {back: 'sh-cr-door-open-page'},
    'cr-main-1dc-page':     {back: 'sh-cr-door-open-page'},
    'cr-doors-2dc-page':    {back: 'cr-main-2dc-page'},
    'cr-doors-1dc-page':    {back: 'cr-main-1dc-page'},
    'cr-doors-1dc-cam-page': {back: 'cr-main-1dc-page'},
    //fixme -- add functionality for page with both doors open on next line
    'cr-couches-key-page':  {back: () => state.camrDoorOpen ? 'cr-main-1dc-page': 'cr-main-2dc-page'},
    'cr-couch-key-page':    {back: 'cr-couches-key-page'},
    'cr-couch-zoom-key-page': {back: 'cr-couch-key-page'},
    //fixme same as last fixme
    'cr-couches-page':        {back: () => state.camrDoorOpen ? 'cr-main-1dc-page': 'cr-main-2dc-page'},
    'cr-couch-page':         {back: 'cr-couches-page'},
    'cr-couch-zoom-page':    {back: 'cr-couch-page'},

    //camera room
    //fixme add the person appearing and diseappearing between clicks
    'cr-camr-door-closed-page': {back: 'cr-doors-2dc-page'},
    'camr-main-page':           {back: 'cr-doors-1dc-page'},
    'camr-main-ml-on-page':     {back: 'cr-doors-1dc-cam-page'},
    'camr-main-ml-on-person-page': {back: 'cr-doors-1dc-cam-page'},
    'camr-wp-page':             {back: 'camr-main-wp-page'},
    'camr-we-page':             {back: 'camr-main-page'},
    'camr-mlo-we-page':         {back: 'camr-main-ml-on-page'},
    'camr-main-wp-page':        {back: 'cr-doors-1dc-cam-page'},
    'camr-ml-off-page':         {back: 'camr-main-page'},
    'camr-ml-on-page':          {back: 'camr-main-ml-on-page'},
    'camr-ml-on-person-page':   {back: 'camr-main-ml-on-person'},
    'camr-mr-off-page':         {back: () => state.isLeftMonitorOn ? 'camr-main-mlo-page' : 'camr-main-page'},


    //kitchen
    'ki-door-closed-page':    { left: 'mh-cend-right-endc-kc-page', right: 'mh-cend-left-endc-page' },
    'ki-door-handle-page':    { back: 'ki-door-closed-page' },
    'ki-door-open-page':       {back: 'ki-door-closed-page', forward: 'ki-entrance-page'},
    'ki-entrance-page':        {back: 'ki-door-open-page'},
    'ki-entrance-code-page':   {back: 'ki-door-open-page'},
    'ki-main-code-page':       {back: 'ki-entrance-code-page'},
    'ki-main-noCode-page':      {back: 'ki-entrance-page'},
    'ki-entrance-noCode-page':  {back: 'ki-entrance-page'},
    'ki-pt-code-page':          {back: 'ki-main-code-page'},
    'ki-pt-noCode-page':        {back: 'ki-main-noCode-page'},

    //library
    'li-door-closed-page':    { left: 'mh-li-left-endc-page', right: 'mh-li-right-endc-page' },
    'li-door-handle-page':    { back: 'li-door-closed-page' },
};

// ----- 3. CORE FUNCTIONS ----
// Replace your old getDestination with this:
function getDestination(direction, pageId) {
    return roomLeads[pageId]?.[direction] || null;
}

// Replace your old showPage with this:
function showPage(pageId) {
    allPages.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
    }

    // AUTO-HIDE ARROWS: If the roomLeads data doesn't have a path, hide the arrow
    const currentPaths = roomLeads[pageId] || {};
    backArrow.classList.toggle('hidden', !currentPaths.back);
    forwardArrow.classList.toggle('hidden', !currentPaths.forward);
    leftArrow.classList.toggle('hidden', !currentPaths.left);
    rightArrow.classList.toggle('hidden', !currentPaths.right);

    updateMap(pageId);
}

function goBack()    { move('back'); }
function goForward() { move('forward'); }
function goLeft()    { move('left'); }
function goRight()   { move('right'); }

function move(dir) {
    const current = Array.from(allPages).find(p => !p.classList.contains('hidden'));
    let dest = getDestination(dir, current?.id);

    // ADD THIS: If dest is a function, execute it to get the string
    if (typeof dest === 'function') {
        dest = dest();
    }

    if (dest) showPage(dest);
}

// ----- TEXTBOX NOTIFICATIONS ----
let activePopup = null;

// ---- THE POPUP AT MOUSE ----
function spawnPopupAtMouse(event, message, speed = 40) {
    if (activePopup) activePopup.remove();

    const popup = document.createElement('div');
    popup.className = 'click-popup theme-burgundy-gold';
    popup.style.left = event.pageX + 'px';
    popup.style.top = (event.pageY - 70) + 'px';

    popup.isDone = false;
    popup.birthTime = Date.now(); // RECORD BIRTH

    document.body.appendChild(popup);
    activePopup = popup;

    typeWriter(popup, message, speed);
    stopEventPropagation(event);
}

// ---- THE THEMED BOX (Bottom/notification) ----
function spawnThemedBox(message, positionClass) {
    return new Promise((resolve) => {
        if (activePopup) activePopup.remove();

        const box = document.createElement('div');
        box.className = `theme-burgundy-gold ${positionClass}`;
        box.innerHTML = `<p class="box-text-content" style="margin:0; pointer-events:none;"></p>`;

        box.isTutorialBox = true;
        box.isDone = false;
        box.birthTime = Date.now();

        document.body.appendChild(box);
        activePopup = box;

        const textTarget = box.querySelector('.box-text-content');

        const handleTutorialClick = (e) => {
            // 1. Check age (Increased to 300ms for extra safety)
            if (Date.now() - box.birthTime < 300) return;

            // 2. Kill the click so the Global Controller never sees it
            e.stopImmediatePropagation();

            // 3. THE HARD LOCK: If typing isn't done, IGNORE the click
            if (box.isDone !== true) {
                console.log("Waiting for typewriter...");
                return;
            }

            // 4. Success: Cleanup and Move On
            window.removeEventListener('click', handleTutorialClick, true);
            box.remove();
            activePopup = null;
            resolve();
        };

        // 'true' uses Capture Phase (Highest Priority)
        window.addEventListener('click', handleTutorialClick, true);

        typeWriter(textTarget, message, 40);
    });
}
// ---- THE GLOBAL CLICK CONTROLLER ----
document.addEventListener('click', () => {
    // 1. If there's no popup OR it's a tutorial box, EXIT immediately.
    if (!activePopup || activePopup.isTutorialBox === true) return;

    const boxAge = Date.now() - activePopup.birthTime;
    if (boxAge < 150) return;

    // Only dismiss if the typewriter is finished
    if (activePopup.isDone !== true) return;

    activePopup.style.opacity = '0';
    activePopup.style.transition = 'opacity 0.2s ease';

    setTimeout(() => {
        if (activePopup) {
            activePopup.remove();
            activePopup = null;
        }
    }, 200);
});

// ---- 4. CUSTOM STOP FUNCTION ----
function stopEventPropagation(e) {
    if (!e) return;
    if (typeof e.stopPropagation === "function") {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
}


// ----- INVENTORY MENU ----- //
inventoryTab.onclick = () => {
    const panel = document.getElementById('inventory-panel');
    panel.classList.toggle('inventory-open');
};

// ---- TYPEWRITER EFFECT ----
function typeWriter(element, text, speed, callback) {
    if (!element) return;

    let i = 0;
    element.textContent = '';

    // Ensure the global activePopup is LOCKED the moment typing starts
    if (activePopup) {
        activePopup.isDone = false;
    }

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // UNLOCK: Only happens when the very last letter is rendered
            if (activePopup) {
                activePopup.isDone = true;
            }
            if (typeof callback === 'function') callback();
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
        play.classList.remove('hidden');
        showPage('bd-main-page');
        document.getElementById('inventory-drawer').classList.remove('hidden');
        document.getElementById('hamburger-menu').classList.remove('hidden');
        document.getElementById('hint-btn').classList.remove('hidden');
        document.getElementById('hint-box').classList.remove('hidden');
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

    //Music volume slider
    document.getElementById('music-slider').oninput = (e) => {
        document.getElementById('music-value').textContent = e.target.value;
        //FIXME - connect to music audio when added
        console.log('Music volume:', e.target.value);
    };

    //SFX volume slider
    document.getElementById('sfx-slider').oninput = (e) => {
        document.getElementById('sfx-value').textContent = e.target.value;
        //FIXME - connect to SFX audio when added
        console.log('SFX volume:', e.target.value);
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

    // ---- How to Play -----
    //how to play button
    document.getElementById('how-to-play-button').onclick = async (e) => {
        e.stopPropagation();
        let tutorialAborted = false; // Track if we hit exit

        // 1. SHOW EVERYTHING
        menu.classList.add('hidden');
        tutorial.classList.remove('hidden');
        document.getElementById('tutorial-bd-main-page').classList.remove('hidden');
        document.getElementById('tutorial-master-left-arrow').classList.remove('hidden');
        document.getElementById('tutorial-master-right-arrow').classList.remove('hidden');
        document.getElementById('inventory-drawer').classList.remove('hidden');

        // 2. THE EXIT BUTTON (Stops the ghost finish)
        document.getElementById('tutorial-exit-btn').onclick = () => {
            tutorialAborted = true;
            hideTutorialUI(); // Clean up function (see below)
        };

        // 3. THE BOXES (The "Await" chain)
        await spawnThemedBox("Click objects or doors to interact with them", "notification-bottom");
        if (tutorialAborted) return; // Stop if they hit exit during box 1

        await spawnThemedBox("Use the arrows to move around the room!", "notification-arrow");
        if (tutorialAborted) return; // Stop if they hit exit during box 2

        await spawnThemedBox("<- click here to open/close inventory tab", "notification-inventory");
        if (tutorialAborted) return; // Stop if they hit exit during box 2
        const panel = document.getElementById('inventory-panel');
        panel.classList.toggle('inventory-open')
        document.getElementById('inv-pw-book').classList.remove('hidden');

        await spawnThemedBox("<- click on objects in the inventory to inspect them", "notification-invInspection");
        panel.classList.toggle('inventory-open')
        document.getElementById('inv-pw-book').classList.add('hidden');

        await spawnThemedBox("Good luck escaping!", "notification-bottom");
        if (tutorialAborted) return; // Stop if they hit exit during box 3

        // 4. AUTO-HIDE ONLY IF NOT ABORTED
        hideTutorialUI();
    };

// helper to avoid repeating the hide logic
    function hideTutorialUI() {
        tutorial.classList.add('hidden');
        document.getElementById('inventory-drawer').classList.add('hidden');
        // Hide the arrows too!
        document.getElementById('tutorial-master-left-arrow').classList.add('hidden');
        document.getElementById('tutorial-master-right-arrow').classList.add('hidden');

        menu.classList.remove('hidden');
        runMenuTypewriter();
    }



    //fixme fix back button from how to play,, currently isn't working


    // ---- IN-GAME HAMBURGER MENU ----
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');

    hamburgerIcon.onclick = () => {
        hamburgerDropdown.classList.toggle('dropdown-open');
    };

    // View Map button
    document.getElementById('map-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');
        document.getElementById('map-screen').classList.remove('hidden');
    };

    // Close map button
    document.getElementById('map-close-btn').onclick = () => {
        document.getElementById('map-screen').classList.add('hidden');
    };

    //Restart button
    document.getElementById('restart-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');
        location.reload();
    };

    //Quit to main menu button
    document.getElementById('quit-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');
        play.classList.add('hidden');
        document.getElementById('inventory-drawer').classList.add('hidden');
        document.getElementById('hamburger-menu').classList.add('hidden');
        document.getElementById('hint-btn').classList.add('hidden');
        document.getElementById('hint-box').classList.add('hidden');
        menu.classList.remove('hidden');
        runMenuTypewriter();
    };

    // ---- HINT BUTTON ----
    const hintBtn = document.getElementById('hint-btn');
    const hintBox = document.getElementById('hint-box');

    hintBtn.onclick = () => {
        hintBox.classList.toggle('hint-open');
    };

    backArrow.onclick = goBack;
    forwardArrow.onclick = goForward;
    rightArrow.onclick = goRight;
    leftArrow.onclick= goLeft;

    // --- Book Drop (BD) Interactions ---

    // Main -> Door
    document.getElementById('bd-door-hitbox').onclick = () => showPage('bd-door-page');

    // Door -> Slot or Handle
    document.getElementById('bd-slot-hitbox').onclick = () => showPage('bd-slot-closed-page');
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
    document.getElementById('bd-slot-open-hitbox').onclick = () => showPage('bd-slot-closed-page');

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
        state.hasPrKey ? showPage('bd-fb-open-page') : showPage('bd-fb-open-key-page');
    };
    document.getElementById('bd-fb-key-hitbox').onclick = () => {
        state.hasPrKey = true;
        const keySlot = document.getElementById('inv-pr-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        showPage('bd-fb-open-page');
    };

    // door behind book drop and locking
    document.getElementById('bd-back-door-hitbox').onclick = () => showPage('bd-back-door-handle-page');

    document.getElementById('bd-back-handle-keyhole-hitbox').onclick = () => {
        if (state.hasPrKey) {
            state.bdBackDoorUnlocked = true;
            const keySlot = document.getElementById('inv-pr-key');
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

    //entering room behind book drop
    document.getElementById('bd-back-door-open-hitbox').onclick = () => showPage('bd-door-open-page')
    document.getElementById('bd-back-door-enter-hitbox').onclick = () =>  {
        if (state.isProjectorOn) {
            showPage ('pr-steps-po-page');
        } else {
            showPage('pr-steps-page');
        }
    }

    document.getElementById('pr-steps-enter-hitbox').onclick = () => showPage('pr-main-page');
    document.getElementById('pr-steps-po-enter-hitbox').onclick = () => showPage('pr-main-po-page');
    document.getElementById('pr-po-pw-hitbox').onclick = () => {
        if (state.hasPwBook) {
            showPage ('pr-pw-main-noBook-po-page');
        } else {
            showPage('pr-pw-main-book-po-page');
        }
    }
    document.getElementById('pr-pw-main-book-po-hitbox').onclick = () => showPage('pr-pw-book-projector-on-page');
    document.getElementById('pr-pw-main-noBook-po-hitbox').onclick = () => showPage('pr-pw-noBook-projector-on-page');

    document.getElementById('pr-pw-he-projector-hitbox').onclick = () => showPage('pr-pw-noBook-projector-off-page');
    document.getElementById('pr-pw-hb-projector-hitbox').onclick = () => showPage('pr-pw-book-projector-off-page');

    document.getElementById('pr-pw-book-projector-hitbox').onclick = () => {
        if (state.solvedWirePuzzle) {
            showPage ('pr-pw-book-projector-on-page');
        } else {
            //fixme add feedback
        }
    }

    document.getElementById('pr-po-wr-hitbox').onclick = () => showPage('pr-wr-main-page');

    document.getElementById('pr-pw-noBook-projector-hitbox').onclick = () => {
        if (state.solvedWirePuzzle) {
            showPage ('pr-pw-noBook-projector-on-page');
        } else {
            //fixme add feedback
        }
    }

    //projector wall image depends on whether the user has the pw book or not
    document.getElementById('pr-pw-hitbox').onclick = () => {
        if (state.hasPwBook) {
            showPage ('pr-pw-main-noBook-page');
        } else {
            showPage('pr-pw-main-book-page');
        }
    }

    document.getElementById('pr-pw-po-he-hitbox').onclick = () => showPage('pr-pw-hole-noBook-page');
    document.getElementById('pr-pw-po-hb-hitbox').onclick = () => showPage('pr-pw-hole-book-page');
    document.getElementById('pr-pw-hb-hitbox').onclick = () => showPage('pr-pw-hole-book-page');
    document.getElementById('pr-pw-he-hitbox').onclick = () => showPage('pr-pw-hole-noBook-page');

    //collect pw book
    document.getElementById('pr-pw-hole-book-hitbox').onclick = () => {
        state.hasPwBook = true;
        const keySlot = document.getElementById('inv-pw-book')
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        // fixme
        showPage('pr-pw-hole-noBook-page');
    }

    //Wire Room Section
    document.getElementById('pr-wr-hitbox').onclick = () => showPage('pr-wr-main-page');
    document.getElementById('pr-wr-wires-hitbox').onclick = () => showPage('pr-wr-wires-page');
    document.getElementById('pr-wr-box-hitbox').onclick = () => showPage('pr-wr-box-page');
    // Wire puzzle
    document.getElementById('pr-wr-puzzle-hitbox').onclick = () => {
        openWirePuzzle();
    };

    // Wire puzzle exit button
    document.getElementById('wire-exit-btn').onclick = () => {
        document.getElementById('wire-puzzle').classList.add('hidden');
        document.getElementById('wire-solved-popup').classList.add('hidden');
    };

    // Wire puzzle popup close button
    document.getElementById('wire-popup-close').onclick = () => {
        document.getElementById('wire-solved-popup').classList.add('hidden');
    };


    //------ KITCHEN SECTION ------

    //handle and locking
    document.getElementById('ki-door-handle-hitbox').onclick = () => showPage('ki-door-handle-page');

    //fixme - made pr book key for kitchen (potentially change)
    document.getElementById('ki-door-handle-keyhole-hitbox').onclick = () => {
        if (state.hasKiKey) {
            state.kiUnlocked = true;
            const keySlot = document.getElementById('inv-ki-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
            }
            alert("Unlocked!"); // fixme feedback
        }
        else {
            alert("it's locked");
        }
    };
    document.getElementById('ki-door-handle-handle-hitbox').onclick = () => {
        if (state.kiUnlocked) {
            showPage('ki-door-open-page');
        } else {
            alert("It's locked."); //fixme feedback
        }
    };

    document.getElementById('ki-door-open-hitbox').onclick = () => {
        if (state.foundPtCode) {
            showPage('ki-entrance-code-page');
        } else {
            // Otherwise, go to the "No Code/Locked" version
            showPage('ki-entrance-page');
        }
    }

    document.getElementById('ki-pt-wall-hitbox').onclick = () => showPage('ki-main-noCode-page');
    document.getElementById('ki-pt-wall-code-hitbox').onclick = () => showPage('ki-main-code-page');
    document.getElementById('ki-main-pt-code-hitbox').onclick = () => showPage('ki-pt-code-page');
    document.getElementById('ki-main-pt-noCode-hitbox').onclick = () => showPage('ki-pt-noCode-page');
    document.getElementById('ki-pt-noCode-hitbox').onclick = () => {
        state.foundPtCode = true;
        showPage('ki-pt-code-page');
    }
    //document.getElementById('ki-pt-code-hitbox').onclick= () => fixme add feedback


    // ----- CREEPY ROOM SECTION -----
    document.getElementById('bh-sh-cr-dc-hitbox').onclick = () => showPage('sh-cr-door-closed-page');
    document.getElementById('bh-sh-cr-do-hitbox').onclick = () => showPage('sh-cr-door-open-page');

    document.getElementById('cr-door-closed-hitbox').onclick = () => {
        if (state.crUnlocked) {
            showPage('sh-cr-door-open-page');
        }
        else {
            alert("it's locked"); //FIXME add pictures of the key pad and ability to type in the code
        }
    }

    document.getElementById('cr-door-open-hitbox').onclick= () => {
        if (!state.camrDoorOpen) {
            showPage('cr-main-2dc-page');
        } else if(!state.crlDoorOpen) {
            showPage('cr-main-1dc-page');
        } else {
            //showPage('cr-main-page') //fixme add this later
        }
    }

    document.getElementById('cr-main-2dc-couches-hitbox').onclick = () => {
        if (state.hasCamrKey) {
            showPage('cr-couches-page');
        } else {
            showPage('cr-couches-key-page');
        }
    }
    document.getElementById('cr-main-1dc-couches-hitbox').onclick = () => showPage('cr-couches-page');
    document.getElementById('cr-couches-key-couch-hitbox').onclick = () => showPage('cr-couch-key-page');
    document.getElementById('cr-couch-key-zoom-hitbox').onclick = () => showPage('cr-couch-zoom-key-page');
    document.getElementById('cr-couch-key-hitbox').onclick = () => {
        showPage('cr-couch-zoom-page');
        state.hasCamrKey = true;
        const keySlot = document.getElementById('inv-camr-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        //fixme make sure the camr key shows in inventory
    }
    document.getElementById('cr-couches-couch-hitbox').onclick = () => showPage('cr-couch-page');
    document.getElementById('cr-couch-zoom-hitbox').onclick = () => showPage('cr-couch-zoom-page');
    document.getElementById('cr-couch-hitbox').onclick = () => {
        //fixme add feedback
    }

    document.getElementById('cr-main-2dc-doors-hitbox').onclick = () => showPage('cr-doors-2dc-page');
    //fixme add image: document.getElementById('dr-doors-2dc-rd-hitbox').onclick = () => showPage('');

    document.getElementById('cr-main-1dc-doors-hitbox').onclick = () => {
        if (state.isLeftMonitorOn) {
            showPage('cr-doors-1dc-cam-page')//fixme
        } else {
            showPage('cr-doors-1dc-page');
        }

        //fixme finish if/else logic for added cam pages
    }

    document.getElementById('cr-doors-2dc-rd-hitbox').onclick = () => showPage('cr-camr-door-closed-page');
    document.getElementById('cr-camr-door-closed-hitbox').onclick = () => {
        if (state.hasCamrKey) {
            showPage('cr-doors-1dc-page');
        } else {
            //fixme add feedback
        }
    }




    // ------ LIBRARY SECTION ------

    //door, handle, and locking
    document.getElementById('li-door-handle-hitbox').onclick = () => showPage('li-door-handle-page');


    // ------ INVENTORY INSPECTION -----

    const overlay = document.getElementById("item-overlay");
    const closeBtn = document.getElementById("item-close-btn");
    const overlayImg = document.getElementById("item-overlay-img");

// Close overlay
    closeBtn.addEventListener("click", () => {
        overlay.classList.add("hidden");
    });

// Make ALL inventory items clickable
    const inventoryItems = document.querySelectorAll(".inv-item");

    inventoryItems.forEach(item => {
        item.addEventListener("click", () => {
            console.log("Clicked:", item.id, "Path:", item.dataset.img, "Name:", item.dataset.item);
            const imgSrc = item.dataset.img;
            const itemName = item.dataset.item; // IMPORTANT FIX

            if (!imgSrc || !itemName) return;

            openOverlay(itemName, imgSrc);
        });
    });

    let currentOverlayItem = null;

    function openOverlay(itemName, imgSrc) {
        currentOverlayItem = itemName;

        const overlay = document.getElementById("item-overlay");
        const img = document.getElementById("item-overlay-img");

        img.src = imgSrc;
        overlay.classList.remove("hidden");

        setupOverlayHitboxes(itemName, imgSrc);
    }

    function setupOverlayHitboxes(itemName, imgSrc) {
        // reset all first
        const all = document.querySelectorAll("#overlay-hitbox-layer .hitbox")
        all.forEach(h => {
            h.classList.add('hidden');
            h.onclick = null;
        });

        if (itemName === "pw-book") {
            switch (imgSrc) {
                case 'inv-images/pw-book.png': {
                    document.getElementById('pw-book-hitbox').classList.remove('hidden');
                    document.getElementById("pw-book-hitbox").onclick = () => {
                        if (state.hasKiKey) {
                            openOverlay("pw-book", "inv-images/pw-book-open.png");
                        } else {
                            openOverlay("pw-book", "inv-images/pw-book-open-key.png");
                        }
                    };
                } break;
                case 'inv-images/pw-book-open-key.png': {
                    document.getElementById('pw-book-key-hitbox').classList.remove('hidden');
                    document.getElementById('pw-book-key-hitbox').onclick = () => {
                        state.hasKiKey = true;
                        const keySlot = document.getElementById('inv-ki-key');
                        if (keySlot) {
                            keySlot.classList.remove('hidden');
                        }
                        document.getElementById("item-overlay").classList.add("hidden");
                        openOverlay("pw-book", "inv-images/pw-book-open.png");
                    }
                } break;
                case 'inv-images/pw-book-open.png': {
                    document.getElementById('pw-book-open-hitbox').classList.remove('hidden');
                }

            }
        }
    }

    document.getElementById("item-close-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // IMPORTANT

        const overlay = document.getElementById("item-overlay");
        overlay.classList.add("hidden");

        currentOverlayItem = null;
    });

}

// ---- MAP SYSTEM ----
function updateMap(currentRoom) {
    // Discover rooms based on current room
    if (currentRoom.startsWith('bd-')) state.discoveredBd = true;
    if (currentRoom.startsWith('pr-')) state.discoveredPr = true;

    // Show discovered rooms
    if (state.discoveredBd) document.getElementById('map-room-bd').classList.remove('hidden');
    if (state.discoveredPr) {
        document.getElementById('map-room-pr').classList.remove('hidden');
        document.getElementById('map-connector-bd-pr').classList.remove('hidden');
    }

    // Highlight current room
    document.querySelectorAll('.map-room').forEach(r => r.classList.remove('current-room'));
    if (currentRoom.startsWith('bd-')) document.getElementById('map-room-bd').classList.add('current-room');
    if (currentRoom.startsWith('pr-')) document.getElementById('map-room-pr').classList.add('current-room');
}

// ---- WIRE PUZZLE SYSTEM ----
function openWirePuzzle() {
    document.getElementById('wire-puzzle').classList.remove('hidden');
    initWirePuzzle();
}

function initWirePuzzle() {
    const canvas = document.getElementById('wire-canvas');
    const ctx = canvas.getContext('2d');

    // Canvas size
    canvas.width = 500;
    canvas.height = 350;

    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
    const colorNames = ['red', 'blue', 'green', 'yellow', 'purple'];
    const numWires = 5;
    const nodeRadius = 14;
    const leftX = 80;
    const rightX = 420;

    // Shuffle right side order
    const rightOrder = [0, 1, 2, 3, 4];
    for (let i = rightOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rightOrder[i], rightOrder[j]] = [rightOrder[j], rightOrder[i]];
    }

    // Node positions
    const leftNodes = colors.map((c, i) => ({
        x: leftX,
        y: 50 + i * 60,
        color: c,
        index: i
    }));

    const rightNodes = rightOrder.map((colorIdx, i) => ({
        x: rightX,
        y: 50 + i * 60,
        color: colors[colorIdx],
        index: colorIdx
    }));

    let connections = {}; // leftIndex -> rightIndex
    let dragging = false;
    let dragStart = null;
    let dragCurrent = null;
    let errorFlash = false;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw left labels
        leftNodes.forEach((node, i) => {
            ctx.font = '14px serif';
            ctx.fillStyle = '#c9a84c';
            ctx.textAlign = 'right';
            ctx.fillText(colorNames[i], node.x - nodeRadius - 5, node.y + 5);
        });

        // Draw right labels
        rightNodes.forEach((node, i) => {
            ctx.font = '14px serif';
            ctx.fillStyle = '#c9a84c';
            ctx.textAlign = 'left';
            ctx.fillText(colorNames[node.index], node.x + nodeRadius + 5, node.y + 5);
        });

        // Draw connections
        Object.entries(connections).forEach(([leftIdx, rightIdx]) => {
            const left = leftNodes[leftIdx];
            const right = rightNodes.find(n => n.index === parseInt(rightIdx));
            if (!right) return;
            const isCorrect = left.color === right.color;
            ctx.beginPath();
            ctx.moveTo(left.x, left.y);
            ctx.lineTo(right.x, right.y);
            ctx.strokeStyle = isCorrect ? left.color : '#ff0000';
            ctx.lineWidth = 4;
            ctx.shadowColor = isCorrect ? left.color : '#ff0000';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Draw drag line
        if (dragging && dragStart && dragCurrent) {
            ctx.beginPath();
            ctx.moveTo(dragStart.x, dragStart.y);
            ctx.lineTo(dragCurrent.x, dragCurrent.y);
            ctx.strokeStyle = dragStart.color;
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw left nodes
        leftNodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = connections[node.index] !== undefined ? node.color : 'rgba(0,0,0,0.5)';
            ctx.fill();
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 3;
            ctx.shadowColor = node.color;
            ctx.shadowBlur = connections[node.index] !== undefined ? 15 : 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Draw right nodes
        rightNodes.forEach(node => {
            const connected = Object.values(connections).includes(node.index);
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = connected ? node.color : 'rgba(0,0,0,0.5)';
            ctx.fill();
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 3;
            ctx.shadowColor = node.color;
            ctx.shadowBlur = connected ? 15 : 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Error flash
        if (errorFlash) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    function getNodeAt(x, y, nodes) {
        return nodes.find(n => Math.hypot(n.x - x, n.y - y) <= nodeRadius + 4);
    }

    function getCanvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function checkSolved() {
        if (Object.keys(connections).length < numWires) return;
        const allCorrect = Object.entries(connections).every(([leftIdx, rightIdx]) => {
            const left = leftNodes[leftIdx];
            const right = rightNodes.find(n => n.index === parseInt(rightIdx));
            return left && right && left.color === right.color;
        });
        if (allCorrect) {
            setTimeout(() => {
                document.getElementById('wire-solved-popup').classList.remove('hidden');
            }, 400);
            state.solvedWirePuzzle = true;
        }
    }

    canvas.onmousedown = (e) => {
        const pos = getCanvasPos(e);
        const node = getNodeAt(pos.x, pos.y, leftNodes);
        if (node) {
            dragging = true;
            dragStart = node;
            dragCurrent = pos;
            // Remove existing connection from this node
            delete connections[node.index];
            draw();
        }
    };

    canvas.onmousemove = (e) => {
        if (!dragging) return;
        dragCurrent = getCanvasPos(e);
        draw();
    };

    canvas.onmouseup = (e) => {
        if (!dragging) return;
        dragging = false;
        const pos = getCanvasPos(e);
        const rightNode = getNodeAt(pos.x, pos.y, rightNodes);
        if (rightNode && dragStart) {
            // Check if right node already connected — remove old connection
            Object.keys(connections).forEach(k => {
                if (connections[k] === rightNode.index) delete connections[k];
            });
            connections[dragStart.index] = rightNode.index;

            // Check if wrong — flash error
            if (dragStart.color !== rightNode.color) {
                errorFlash = true;
                draw();
                setTimeout(() => {
                    errorFlash = false;
                    draw();
                }, 500);
            }
            checkSolved();
        }
        dragStart = null;
        dragCurrent = null;
        draw();
    };

    canvas.onmouseleave = () => {
        if (dragging) {
            dragging = false;
            dragStart = null;
            dragCurrent = null;
            draw();
        }
    };

    draw();
}

init();