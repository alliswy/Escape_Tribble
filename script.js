//PERSONAL NOTE: paste the following into console on inspection for ease of testing
// Object.keys(state).forEach(key => state[key] = true);
//
// // Show all key images in the inventory UI
// document.querySelectorAll('.inv-item').forEach(item => item.classList.remove('hidden'));
//
// console.log("God Mode Activated: All keys obtained and doors unlocked.");


let score = 0;

// 1. UTILITIES
const delay = ms => new Promise(res => setTimeout(res, ms));

// ------ 1. GAME STATE -----
const state = {
    hasBdKey: false,
    hasPrKey: false,
    hasKiKey: false,
    hasLiKey: false,
    hasPwBook: false,
    hasCamrKey: false,
    hasClrKey: false,
    hasWrId: false,

    bdUnlocked: false,
    bdBackDoorUnlocked: false,
    kiUnlocked: false,
    liUnlocked: false,
    crUnlocked: false,
    camrUnlocked: false,
    wrUnlocked: false,

    camrDoorOpen: false, //this is the room with the two monitors in the creepy room
    crlDoorOpen: false, //this is the door to the left of the camera room^ in the creepy room. Note: if this door is open, camrDoorOpen = true;
    crDoorOpen: false,

    discoveredBd: false,
    discoveredPr: false,
    discoveredMh: false,
    discoveredLi: false,
    discoveredLo: false,
    discoveredKi: false,
    discoveredBh: false,
    discoveredCr: false,
    discoveredCamr: false,
    discoveredSh: false,

    solvedWirePuzzle: false,
    foundPtCode: false,

    foundWp: false,
    justFoundWp: false,

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
    'mh-bd-main-page':           { right: 'mh-bd-right-endc-page', left: 'mh-bd-left-endc-page' },
    'mh-bd-door-page':           { back: 'mh-bd-main-page', forward: 'mh-bd-slot-closed-page' },
    'bd-door-open-page':      { back: 'mh-bd-main-page', forward: 'bd-cart-page' },
    'mh-bd-slot-closed-page':    { back: 'mh-bd-door-page' },
    'mh-bd-door-handle-page':    { back: 'mh-bd-door-page' },
    'mh-bd-slot-open-key-page':  { back: 'mh-bd-slot-closed-page' },
    'mh-bd-slot-open-page':      { back: 'mh-bd-slot-closed-page' },
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
    'mh-bd-right-endc-page':    { back: 'mh-trash-right-endc-page', forward: 'mh-li-right-endc-page', left: 'mh-bd-main-page' },
    'mh-li-right-endc-page':    { back: 'mh-bd-right-endc-page', forward: 'mh-cend-right-endc-kc-page', left: 'mh-li-door-closed-page' },
    'mh-cend-right-endc-kc-page': { back: 'mh-li-right-endc-page', right: 'mh-ki-door-closed-page' },

    // Main Hall (Left Side)
    'mh-cend-left-endc-page':   { forward: 'mh-li-left-endc-page', left: 'mh-ki-door-closed-page' },
    'mh-li-left-endc-page':     { back: 'mh-cend-left-endc-page', forward: 'mh-bd-left-endc-page', right: 'mh-li-door-closed-page' },
    'mh-bd-left-endc-page':     { back: 'mh-li-left-endc-page', forward: 'mh-bh-left-endc-page', right: 'mh-bd-main-page' },
    'mh-bh-left-endc-page':     { back: 'mh-bd-left-endc-page', forward: 'mh-hall-left-endc-page', left: 'bh-entrance-page'},
    'mh-hall-left-endc-page':   { back: 'mh-bh-left-endc-page', forward: 'mh-sl-left-endc-page' },
    'mh-sl-left-endc-page':     { back: 'mh-hall-left-endc-page', right: 'mh-sld-page' },

    'mh-sld-page':            { left: 'mh-sl-left-endc-page', right: 'mh-sl-right-endc-page' },

    // back hall //fixme: take photos the opposite way down the hall for ease of navigating back hall
    'bh-entrance-page':       { forward: 'bh-2-page', left: 'mh-bh-right-endc-page', right: 'mh-bh-left-endc-page' },
    'bh-2-page':              { back: 'bh-entrance-page', forward: 'bh-3-page' },
    'bh-3-page':              { back: 'bh-2-page', forward: 'bh-4-page' },
    'bh-4-page':            { back: 'bh-3-page', forward: 'bh-end-page', left: 'bh-sh-entrance-page'},
    'bh-sh-entrance-page':   {back: 'bh-4-page', forward: 'bh-sh-cr-dc-page'},
    'bh-sh-cr-dc-page':      {back: 'bh-sh-entrance-page'},
    'bh-end-page':          {back: 'bh-4-page'},
    'bh-sh-cr-do-page':      {back: 'bh-sh-cr-dc-page' },
    'sh-cr-door-open-page':    {back: 'bh-sh-cr-do-page'},
    'bh-sh-cr-door-closed-page':   {back: 'bh-sh-cr-dc-page'},

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
    'camr-wp-page':             {back: 'camr-main-page'},
    'camr-we-page':             {back: 'camr-main-page'},
    'camr-mlo-we-page':         {back: 'camr-main-ml-on-page'},
    'camr-main-wp-page':        {back: 'cr-doors-1dc-page'},
    'camr-ml-off-page':         {back: () => state.foundWp ? 'camr-main-page':'camr-main-wp-page'},
    //fixme - add text box on the screen when they go back to the above page (camr-main-wp-page) !
    'camr-ml-on-page':          {back: 'camr-main-ml-on-page'},
    'camr-ml-on-person-page':   {back: 'camr-main-ml-on-person'},
    //note for next line: if the left monitor is on, they already visited the left monitor, and thus already saw the window person !
    'camr-mr-off-page':         {back: () => state.isLeftMonitorOn ? 'camr-main-mlo-page' : state.foundWp ? 'camr-main-page':'camr-main-wp-page'},


    //kitchen
    'mh-ki-door-closed-page':    { left: 'mh-cend-right-endc-kc-page', right: 'mh-cend-left-endc-page' },
    'mh-ki-door-handle-page':    { back: 'mh-ki-door-closed-page' },
    'ki-door-open-page':       {back: 'mh-ki-door-closed-page', forward: 'ki-entrance-page'},
    'ki-entrance-page':        {back: 'ki-door-open-page'},
    'ki-entrance-code-page':   {back: 'ki-door-open-page'},
    'ki-main-code-page':       {back: 'ki-entrance-code-page'},
    'ki-main-noCode-page':      {back: 'ki-entrance-page'},
    'ki-entrance-noCode-page':  {back: 'ki-entrance-page'},
    'ki-pt-code-page':          {back: 'ki-main-code-page'},
    'ki-pt-noCode-page':        {back: 'ki-main-noCode-page'},


    //c-wing left-progression/entrance/snack hall
    'mh-cw-stairs-rubble-page': {back: 'mh-cend-right-endc-kc-page',},
    'mh-cw-stairs-page':        {back: 'mh-cw-stairs-rubble-page', forward: 'mh-cw-door-page'},
    'mh-cw-door-page':          {back: 'mh-cw-stairs-page'},
    'mh-cw-door-plate-page':    {back: 'mh-cw-door-page'},
    'cw-entrance-page':         {back: 'mh-cw-door-page', forward: 'cw-entrance-2-page'},
    'cw-entrance-2-page':       {back: 'cw-entrance-page', left: () => state.hasWrId ? 'cw-left-bath-wrc-page': 'cw-left-bath-id-page', right: 'cw-right-eh-page'}, //fixme add left/right
    'cw-left-bath-id-page':     {back: 'cw-entrance-2-page', left: 'cw-bath-door-page', forward: 'cw-left-snh-wrc-page'}, //fixme back is not correct, also add forward
    'cw-left-bath-wrc-page':    {back: 'cw-entrance-2-page', left: 'cw-bath-door-page', forward: 'cw-left-snh-wrc-page'}, //fixme back is not correct, also add forward
    'cw-left-snh-wrc-page':     {back: () => state.hasWrId ? 'cw-left-bath-wrc-page': 'cw-left-bath-id-page', forward: 'cw-wr-dc-page', right: 'snh-entrance-page'}, //fixme add right
    'cw-left-snh-wro-page':     {forward: 'cw-elevator-wr-do-page', right: 'snh-entrance-page'}, //fixme add back
    'cw-elevator-wr-do-page':   {back: 'cw-left-snh-wro-page', left: 'cw-elevator-page'},
    'cw-wr-dc-page':            {back: 'cw-left-snh-wrc-page', left: 'cw-elevator-page'},
    'snh-entrance-page':     {left: () => state.wrUnlocked ? 'cw-left-snh-wro-page': 'cw-left-snh-wrc-page', right: () => state.hasWrId ? 'cw-right-snh-page': 'cw-right-snh-id-page'},
    //fixme add cw-left-eh-page
    'cw-left-1-page':           {forward: 'cw-left-2-page', right: 'cw-oh2-entrance-page'}, //fixme add left
    'cw-left-2-page':           {back: 'cw-left-1-page', left: 'cw-oh1-entrance-page'}, //fixme add forward: 'cw-left-eh-page'

    //c-wing right progression/hallways
    'cw-right-snh-id-page':     {forward: 'cw-right-bath-id-page', left: 'snh-entrance-page', right: 'cw-elevator-page'},
    'cw-right-snh-page':        {forward: 'cw-right-bath-page', left: 'snh-entrance-page', right: 'cw-elevator-page'},
    'cw-right-bath-id-page':    {back: 'cw-right-snh-id-page', right: 'cw-bath-door-page', forward: 'cw-right-aw-page'},
    'cw-right-bath-page':       {back: 'cw-right-snh-page', right: 'cw-bath-door-page', forward: 'cw-right-aw-page'},
    'cw-right-aw-page':         {back: () => state.hasWrId ? 'cw-right-bath-page': 'cw-right-bath-id-page', forward: 'cw-right-eh-page'}, //fixme add right
    'cw-right-eh-page':          {back: 'cw-right-aw-page', forward: 'cw-right-oh1-page', left: 'cw-eh-entrance-page'},
    'cw-right-oh1-page':        {back: 'cw-right-eh-page', forward: 'cw-right-print-page', right: 'cw-oh1-entrance-page'}, //fixme add right
    'cw-right-print-page':      {back: 'cw-right-oh1-page', left: 'oh2-entrance-page'}, //fixme add right

    //c-wing side halls
    'cw-eh-entrance-page':      {forward: 'eh-door-page', right: 'cw-right-eh-page'}, //fixme add left
    'eh-door-page':             {back: 'cw-eh-entrance-page'},
    'eh-door-plate-page':       {back: 'eh-door-page'},
    'cw-oh1-entrance-page':        {left: 'cw-right-oh1-page', forward: 'oh1-left-1-page'}, //fixme add right
    'oh1-left-1-page':          {back: 'cw-oh1-entrance-page', forward: 'oh1-left-2-page'}, //fixme add left or back
    'oh1-left-2-page':          {back: 'oh1-left-1-page', forward: 'oh1-left-3-page', left: 'oh1-exit-2-page'},
    'oh1-left-3-page':          {back: 'oh1-left-2-page', forward: () => state.hasLiKey ? 'oh1-left-4-page': 'oh1-left-4-key-page'}, //fixme is this really Li key or should it be Clr key ?
    'oh1-left-4-page':          {back: 'oh1-left-3-page', right: 'oh1-right-1-page'},
    'oh1-left-4-key-page':      {back: 'oh1-left-3-page', right: 'oh1-right-1-page'},
    'oh1-right-1-page':         {forward: 'oh1-right-2-page', left: () => state.hasLiKey ? 'oh1-left-4-page': 'oh1-left-4-key-page'},
    'oh1-right-2-page':         {back: 'oh1-right-1-page', forward: 'oh1-right-3-page', right: 'oh1-exit-2-page'},
    'oh1-right-3-page':         {back: 'oh1-right-2-page'}, //fixme add right: oh1-exit-1-page
    'oh1-exit-2-page':          {right: 'oh1-left-2-page', left: 'oh1-right-2-page', forward: 'cw-oh2-entrance-page'},
    'oh1-books-page':           {back: 'oh1-left-4-page'}, //fixme add right
    'oh1-books-key-page':       {back: 'oh1-left-4-key-page'}, //fixme add right

    'cw-oh2-entrance-page':     {back: 'oh1-exit-2-page', forward: 'oh2-entrance-page'},
    'oh2-entrance-page':        {back: 'cw-oh2-entrance-page', right: 'oh2-oh3-entrance-page'},
    'oh2-oh3-entrance-page':    {forward: 'oh3-page', back: 'oh2-entrance-page', right: 'oh2-exit-page'},
    'oh3-page':                 {back: 'oh2-oh3-entrance-page'},
    'oh2-exit-page':            {left: 'oh2-oh3-entrance-page'}, //fixme add forward


    //c-wing inspections/doors
    'cw-chair-id-page':         {back: 'cw-left-bath-id-page'},
    'cw-chair-page':            {back: 'cw-left-bath-wrc-page'},
    'cw-bath-door-page':        {right: () => state.hasWrId ? 'cw-left-bath-wrc-page':'cw-left-bath-id-page', left: () => state.hasWrId ? 'cw-right-bath-page': 'cw-right-bath-id-page'},
    'cw-bath-page':             {back: 'cw-bath-door-page'},
    'cw-bath-sink-page':        {back: 'cw-bath-page'},
    'cw-elevator-page':         {left: () => state.hasWrId ? 'cw-right-snh-page': 'cw-right-snh-id-page', right: () => state.wrUnlocked ? 'cw-elevator-wr-do-page': 'cw-wr-dc-page'},
    'cw-wr-handle-unlocked-page': {back: 'cw-elevator-wr-do-page'},
    'cw-wr-handle-locked-page': {back: 'cw-wr-dc-page'},


    //library
    'mh-li-door-closed-page':    { left: 'mh-li-left-endc-page', right: 'mh-li-right-endc-page' },
    'mh-li-door-handle-page':    { back: 'mh-li-door-closed-page' },
};

// ----- 3. CORE FUNCTIONS ----
// Replace your old getDestination with this:
function getDestination(direction, pageId) {
    return roomLeads[pageId]?.[direction] || null;
}

// Replace your old showPage with this:
async function showPage(pageId) {
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

    //spawn textbox when certain page is shown !
    switch (pageId) {
        case 'camr-main-wp-page': {
            // Wait 20ms for the browser to draw the new image
            await delay(20);
            // Now fire the typewriter
            await spawnThemedBox("What's that in the window ??", "notification-bottom");
            state.foundWp = true;
        }
        case 'camr-main-page': {
            if (state.justFoundWp) {
                state.justFoundWp = false;
                await spawnThemedBox("They're gone!", "notification-bottom");
            }
        }

        //fixme add more as needed

    }
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
        showPage('mh-bd-main-page');
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

    // Sync fullscreen checkbox when user exits fullscreen with Escape key
    document.addEventListener('fullscreenchange', () => {
        const toggle = document.getElementById('fullscreen-toggle');
        toggle.checked = !!document.fullscreenElement;
    });


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
        if (tutorialAborted) return; // Stop if they hit exit during box 1 //fixme

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
        drawMap();
    };

    // Close map button
    document.getElementById('map-close-btn').onclick = () => {
        document.getElementById('map-screen').classList.add('hidden');
    };

    //Restart button
    document.getElementById('restart-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');

        // Reset all state flags
        Object.keys(state).forEach(key => {
            state[key] = false;
        });

        // Hide all inventory items
        document.querySelectorAll('.inv-item').forEach(item => {
            if (!item.classList.contains('empty')) {
                item.classList.add('hidden');
            }
        });

        // Close hint box if open
        document.getElementById('hint-box').classList.remove('hint-open');

        // Return to start of game
        showPage('mh-bd-main-page');

        // Reset wire puzzle
        wirePuzzleInitialized = false;
        document.getElementById('wire-solved-popup').classList.add('hidden');
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
    document.getElementById('bd-door-hitbox').onclick = () => showPage('mh-bd-door-page');

    // Door -> Slot or Handle
    document.getElementById('bd-slot-hitbox').onclick = () => showPage('mh-bd-slot-closed-page');
    document.getElementById('bd-handle-hitbox').onclick = () => showPage('mh-bd-door-handle-page');

    // Inside the Slot
    document.getElementById('bd-closed-hitbox').onclick = () => {
        state.hasBdKey ? showPage('mh-bd-slot-open-page') : showPage('mh-bd-slot-open-key-page');
    };
    document.getElementById('bd-key-hitbox').onclick = async (e) => {
        state.hasBdKey = true;
        const keySlot = document.getElementById('inv-bd-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        showPage('mh-bd-slot-open-page');
        await spawnThemedBox('A key!', "notification-bottom");
    };
    document.getElementById('bd-slot-open-hitbox').onclick = () => showPage('mh-bd-slot-closed-page');

    // bd Door Handle & Locking
    document.getElementById('bd-door-keyhole-hitbox').onclick = async (e) => {
        if (state.hasBdKey) {
            state.bdUnlocked = true;
            const keySlot = document.getElementById('inv-bd-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
            }
            await spawnThemedBox('It\'s unlocked !', "notification-bottom");
        } else {
            await spawnThemedBox('hm... I\'ll need to find a key for this door', "notification-bottom");
        }
    };
    document.getElementById('bd-door-handle-hitbox').onclick = async (e) => {
        if (state.bdUnlocked) {
            showPage('bd-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', "notification-bottom");
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

    document.getElementById('bd-back-handle-keyhole-hitbox').onclick = async (e) => {
        if (state.hasPrKey) {
            state.bdBackDoorUnlocked = true;
            const keySlot = document.getElementById('inv-pr-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
            }
            await spawnThemedBox('It\'s unlocked !', "notification-bottom");
        } else {
            await spawnThemedBox('I need to find another key...', "notification-bottom");
        }
    };
    document.getElementById('bd-back-handle-handle-hitbox').onclick = async (e) => {
        if (state.bdBackDoorUnlocked) {
            showPage('bd-back-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', "notification-bottom");
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
    document.getElementById('mh-cend-right-endc-ki-hitbox').onclick = () => showPage('mh-ki-door-closed-page');

    //handle and locking
    document.getElementById('ki-door-handle-hitbox').onclick = () => showPage('mh-ki-door-handle-page');

    //fixme - made pr book key for kitchen (potentially change)
    document.getElementById('ki-door-handle-keyhole-hitbox').onclick = async (e) => {
        if (state.hasKiKey) {
            state.kiUnlocked = true;
            const keySlot = document.getElementById('inv-ki-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
            }
            await spawnThemedBox('It\'s unlocked!', "notification-bottom");
        }
        else {
            await spawnThemedBox('It\'s locked! Where am I going to find another key ?', "notification-bottom");
        }
    };
    document.getElementById('ki-door-handle-handle-hitbox').onclick = async (e) => {
        if (state.kiUnlocked) {
            showPage('ki-door-open-page');
        } else {
            await spawnThemedBox('This door\'s locked, too', "notification-bottom");
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
    document.getElementById('ki-pt-code-hitbox').onclick= async (e) => {
        await spawnThemedBox('3672', "notification-bottom");
        await spawnThemedBox('Who would write a code here ?', "notification-bottom");
        await spawnThemedBox('And what is it for ?', "notification-bottom");
    }


    // ----- CREEPY ROOM SECTION -----
    document.getElementById('bh-sh-cr-dc-hitbox').onclick = () => showPage('bh-sh-cr-door-closed-page');
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
            showPage('cr-main-2dc-page');
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
    document.getElementById('cr-camr-door-closed-hitbox').onclick = async (e) => {
        if (state.hasCamrKey) {
            showPage('cr-doors-1dc-page');
        } else {
            //fixme add feedback
        }
    }

    //----- CAMERA ROOM SECTION -----
    document.getElementById('cr-doors-1dc-rd-hitbox').onclick = () => {
        showPage('camr-main-page');
        //fixme add checks for if mr on or ml on or whatnot
    }
    document.getElementById('camr-main-window-hitbox').onclick = () => {
        showPage('camr-we-page');
    }
    document.getElementById('camr-main-ml-hitbox').onclick = () => {
        showPage('camr-ml-off-page');
    }
    document.getElementById('camr-ml-off-hitbox').onclick = () => {
        //showPage() fixme show page with password input option
    }
    document.getElementById('camr-main-mr-hitbox').onclick = () => {
        showPage('camr-mr-off-page');
    }
    document.getElementById('camr-main-wp-window-hitbox').onclick = () => {
        showPage('camr-wp-page');
        state.justFoundWp = true;
    }
    document.getElementById('camr-wp-hitbox').onclick = async (e) => {
        await spawnThemedBox('A person ?? How did they get in there ? What\'s going on ?', "notification-bottom");
    }




    // ------- C-WING SECTION -----
    document.getElementById('mh-cend-right-endc-cw-hitbox').onclick = () => showPage('mh-cw-stairs-rubble-page'); //fixme add door sound effect
    document.getElementById('mh-cw-stairs-rubble-hitbox').onclick = async (e) => {
        //fixme add feedback
    }
    document.getElementById('mh-cw-stairs-hitbox').onclick = () => showPage('mh-cw-stairs-page');
    document.getElementById('mh-cw-stairs-door-hitbox').onclick = () => showPage('mh-cw-door-page');
    document.getElementById('mh-cw-door-plate-hitbox').onclick = () => showPage('mh-cw-door-plate-page');
    //^fixme add some stuff on the plate page
    document.getElementById('mh-cw-door-hitbox').onclick = () => showPage('cw-entrance-page');
    document.getElementById('cw-left-bath-id-chair-hitbox').onclick = () => showPage('cw-chair-id-page');
    document.getElementById('cw-id-hitbox').onclick = () => {
        state.hasWrId = true;
        const keySlot = document.getElementById('inv-wr-id')
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        showPage('cw-chair-page');
    }
    document.getElementById('cw-bath-door-hitbox').onclick = async (e) => {
        showPage('cw-bath-page');
        await spawnThemedBox('temp message', "notification-bottom");// fixme
    }
    document.getElementById('cw-bath-sink-hitbox').onclick = () => showPage('cw-bath-sink-page');
    document.getElementById('cw-bath-sink-sink-hitbox').onclick = async (e) => {
        await spawnThemedBox('temp message', "notification-bottom"); //fixme add feedback
    }
    document.getElementById('cw-wr-do-hitbox').onclick = () => showPage('cw-wr-handle-unlocked-page');
    document.getElementById('cw-wr-dc-hitbox').onclick = () => showPage('cw-wr-handle-locked-page');
    document.getElementById('cw-wr-scanner-hitbox').onclick = async (e) => {
        if (state.hasWrId) {
        state.wrUnlocked = true;
        showPage('cw-wr-handle-unlocked-page');
        //fixme currently keeps id in inventory -- do I want it this way ?
        //fixme add feedback
        } else {
            //fixme add feedback
        }
    }
    document.getElementById('cw-elevator-hitbox').onclick = async (e) => {
        //fixme add feedback
    }
    document.getElementById('cw-wr-locked-handle-hitbox').onclick = async (e) => {
        //fixme add feedback
    }
    document.getElementById('cw-wr-unlocked-handle-hitbox').onclick = () => {}; //fixme show wr room main page when added
    document.getElementById('oh3-entrance-hitbox').onclick = () => showPage('oh2-oh3-entrance-page');

    document.getElementById('cw-oh1-entrance-hitbox').onclick = () => showPage('oh1-left-1-page');
    document.getElementById('oh1-left-4-key-books-hitbox').onclick = () => showPage('oh1-books-key-page');
    document.getElementById('oh1-books-hitbox').onclick = async (e) => {
        await spawnThemedBox("I don't see anything else useful here", "notification-bottom");
    }
    document.getElementById('oh1-books-key-hitbox').onclick = async (e) => {
        state.hasLiKey = true;
        const keySlot = document.getElementById('inv-li-key')
        if (keySlot) {
            keySlot.classList.remove('hidden');
        }
        showPage('oh1-books-page');
        //fixme add feedback
    }




    // ------ LIBRARY SECTION ------

    //door, handle, and locking
    document.getElementById('li-door-handle-hitbox').onclick = () => showPage('mh-li-door-handle-page');


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
// Define all rooms with their grid positions and sizes
// Each unit = 10px on canvas. x/y are grid coords, w/h are grid sizes.
const mapRooms = {
    mh:   { x: 4,  y: 14, w: 26, h: 3,  label: 'Main Hall',   key: 'mh' },
    bd:   { x: 12, y: 8,  w: 4,  h: 4,  label: 'Book Drop',   key: 'bd' },
    pr:   { x: 12, y: 2,  w: 4,  h: 4,  label: 'Projector',   key: 'pr' },
    li:   { x: 18, y: 8,  w: 6,  h: 5,  label: 'Library',     key: 'li' },
    lo:   { x: 20, y: 2,  w: 4,  h: 4,  label: 'Lounge',      key: 'lo' },
    ki:   { x: 24, y: 18, w: 4,  h: 5,  label: 'Kitchen',     key: 'ki' },
    bh:   { x: 6,  y: 18, w: 4,  h: 10, label: 'Back Hall',   key: 'bh' },
    cr:   { x: 10, y: 22, w: 7,  h: 6,  label: 'Creepy Room', key: 'cr' },
    cre:  { x: 10, y: 18, w: 4,  h: 3,  label: 'Entrance',    key: 'cre' },
    camr: { x: 10, y: 29, w: 4,  h: 3,  label: 'Camera Room', key: 'camr' },
    sh:   { x: 5,  y: 29, w: 3,  h: 3,  label: 'Side Hall',   key: 'sh' },
};

// Define corridors as thin rectangles connecting rooms
const mapCorridors = [
    { rooms: ['bd', 'mh'],   dir: 'v' },
    { rooms: ['bd', 'pr'],   dir: 'v' },
    { rooms: ['li', 'mh'],   dir: 'v' },
    { rooms: ['lo', 'li'],   dir: 'v' },
    { rooms: ['ki', 'mh'],   dir: 'v' },
    { rooms: ['bh', 'mh'],   dir: 'v' },
    { rooms: ['cr', 'bh'],   dir: 'h' },
    { rooms: ['cre', 'cr'],  dir: 'v' },
    { rooms: ['camr', 'cr'], dir: 'v' },
    { rooms: ['sh', 'bh'],   dir: 'v' },
];

// Which state flags indicate a room has been discovered
const roomDiscovery = {
    mh:   () => state.discoveredBd || state.discoveredMh,
    bd:   () => state.discoveredBd,
    pr:   () => state.discoveredPr,
    li:   () => state.discoveredLi,
    lo:   () => state.discoveredLo,
    ki:   () => state.discoveredKi,
    bh:   () => state.discoveredBh,
    cr:   () => state.discoveredCr,
    cre:  () => state.discoveredCr,
    camr: () => state.discoveredCamr,
    sh:   () => state.discoveredSh,
};

// Which room key corresponds to which page prefix
function getRoomKeyFromPage(pageId) {
    if (pageId.startsWith('bd-'))   return 'bd';
    if (pageId.startsWith('pr-'))   return 'pr';
    if (pageId.startsWith('mh-'))   return 'mh';
    if (pageId.startsWith('li-'))   return 'li';
    if (pageId.startsWith('ki-'))   return 'ki';
    if (pageId.startsWith('bh-'))   return 'bh';
    if (pageId.startsWith('cr-') || pageId.startsWith('sh-cr-')) return 'cr';
    if (pageId.startsWith('camr-')) return 'camr';
    if (pageId.startsWith('bh-sh-')) return 'sh';
    return null;
}

let currentMapRoom = null;

function updateMap(pageId) {
    const roomKey = getRoomKeyFromPage(pageId);
    if (roomKey) {
        // Mark room as discovered
        const discKey = 'discovered' + roomKey.charAt(0).toUpperCase() + roomKey.slice(1);
        state[discKey] = true;
        currentMapRoom = roomKey;
    }
}

function drawMap() {
    const canvas = document.getElementById('map-canvas');
    const CELL = 14;
    const COLS = 34;
    const ROWS = 35;
    canvas.width  = COLS * CELL;
    canvas.height = ROWS * CELL;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0500';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw corridors first (behind rooms)
    // Draw corridors as strict vertical or horizontal lines between room edges
    // Draw corridors as explicit vertical or horizontal lines between room edges
    mapCorridors.forEach(c => {
        if (!c.rooms) return;
        const bothDiscovered = c.rooms.every(key => roomDiscovery[key]?.());
        if (!bothDiscovered) return;

        const r1 = mapRooms[c.rooms[0]];
        const r2 = mapRooms[c.rooms[1]];
        if (!r1 || !r2) return;

        const dir = c.dir || 'v'; // 'v' = vertical, 'h' = horizontal
        let x1, y1, x2, y2;

        if (dir === 'v') {
            const topRoom    = r1.y < r2.y ? r1 : r2;
            const bottomRoom = r1.y < r2.y ? r2 : r1;
            const cx = (bottomRoom.x + bottomRoom.w / 2) * CELL;
            x1 = cx;
            y1 = (topRoom.y + topRoom.h) * CELL;
            x2 = cx;
            y2 = bottomRoom.y * CELL;
        } else {
            const leftRoom  = r1.x < r2.x ? r1 : r2;
            const rightRoom = r1.x < r2.x ? r2 : r1;
            const cy = (leftRoom.y + leftRoom.h / 2) * CELL;
            x1 = (leftRoom.x + leftRoom.w) * CELL;
            y1 = cy;
            x2 = rightRoom.x * CELL;
            y2 = cy;
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#c9a84c';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw rooms
    Object.values(mapRooms).forEach(room => {
        const discovered = roomDiscovery[room.key]?.();
        if (!discovered) return;

        const isCurrent = room.key === currentMapRoom;
        const rx = room.x * CELL;
        const ry = room.y * CELL;
        const rw = room.w * CELL;
        const rh = room.h * CELL;

        // Room fill
        ctx.fillStyle = isCurrent
            ? 'rgba(180, 120, 0, 0.8)'
            : 'rgba(100, 20, 30, 0.85)';
        ctx.fillRect(rx, ry, rw, rh);

        // Room border
        ctx.strokeStyle = isCurrent ? '#c9a84c' : 'rgba(180, 140, 40, 0.6)';
        ctx.lineWidth = isCurrent ? 2 : 1;
        ctx.strokeRect(rx, ry, rw, rh);

        // Room label
        const fontSize = Math.max(8, Math.min(rw, rh) / 3);
        ctx.font = `${fontSize}px serif`;
        ctx.fillStyle = isCurrent ? '#ffffff' : '#c9a84c';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.label, rx + rw / 2, ry + rh / 2);

        // Current room dot
        if (isCurrent) {
            ctx.beginPath();
            ctx.arc(rx + rw / 2, ry + rh / 2 - fontSize, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
    });
}

// ---- WIRE PUZZLE SYSTEM ----
let wirePuzzleInitialized = false;

function openWirePuzzle() {
    document.getElementById('wire-puzzle').classList.remove('hidden');
    if (!wirePuzzleInitialized) {
        initWirePuzzle();
        wirePuzzleInitialized = true;
    } else {
        // Redraw the canvas in case it was cleared while hidden
        redrawWireCanvas();
    }
}

// Persistent wire puzzle variables
let wireColors, wireColorNames, wireNumWires, wireNodeRadius, wireLeftX, wireRightX;
let wireLeftNodes, wireRightNodes, wireConnections, wireDragging, wireDragStart, wireDragCurrent, wireErrorFlash;
let wireCtx, wireCanvas;

function initWirePuzzle() {
    wireCanvas = document.getElementById('wire-canvas');
    wireCtx = wireCanvas.getContext('2d');

    wireCanvas.width = 500;
    wireCanvas.height = 350;

    wireColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
    wireColorNames = ['red', 'blue', 'green', 'yellow', 'purple'];
    wireNumWires = 5;
    wireNodeRadius = 14;
    wireLeftX = 80;
    wireRightX = 420;

    // Shuffle right side order
    const rightOrder = [0, 1, 2, 3, 4];
    for (let i = rightOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rightOrder[i], rightOrder[j]] = [rightOrder[j], rightOrder[i]];
    }

    wireLeftNodes = wireColors.map((c, i) => ({
        x: wireLeftX,
        y: 50 + i * 60,
        color: c,
        index: i
    }));

    wireRightNodes = rightOrder.map((colorIdx, i) => ({
        x: wireRightX,
        y: 50 + i * 60,
        color: wireColors[colorIdx],
        index: colorIdx
    }));

    wireConnections = {};
    wireDragging = false;
    wireDragStart = null;
    wireDragCurrent = null;
    wireErrorFlash = false;

    setupWireCanvasEvents();
    drawWireCanvas();
}

function redrawWireCanvas() {
    wireCanvas = document.getElementById('wire-canvas');
    wireCtx = wireCanvas.getContext('2d');
    drawWireCanvas();
}

function drawWireCanvas() {
    wireCtx.clearRect(0, 0, wireCanvas.width, wireCanvas.height);

    // Draw connections
    Object.entries(wireConnections).forEach(([leftIdx, rightIdx]) => {
        const left = wireLeftNodes[leftIdx];
        const right = wireRightNodes.find(n => n.index === parseInt(rightIdx));
        if (!right) return;
        const isCorrect = left.color === right.color;
        wireCtx.beginPath();
        wireCtx.moveTo(left.x, left.y);
        wireCtx.lineTo(right.x, right.y);
        wireCtx.strokeStyle = isCorrect ? left.color : '#ff0000';
        wireCtx.lineWidth = 4;
        wireCtx.shadowColor = isCorrect ? left.color : '#ff0000';
        wireCtx.shadowBlur = 10;
        wireCtx.stroke();
        wireCtx.shadowBlur = 0;
    });

    // Draw drag line
    if (wireDragging && wireDragStart && wireDragCurrent) {
        wireCtx.beginPath();
        wireCtx.moveTo(wireDragStart.x, wireDragStart.y);
        wireCtx.lineTo(wireDragCurrent.x, wireDragCurrent.y);
        wireCtx.strokeStyle = wireDragStart.color;
        wireCtx.lineWidth = 3;
        wireCtx.setLineDash([6, 4]);
        wireCtx.stroke();
        wireCtx.setLineDash([]);
    }

    // Draw left nodes
    wireLeftNodes.forEach(node => {
        wireCtx.beginPath();
        wireCtx.arc(node.x, node.y, wireNodeRadius, 0, Math.PI * 2);
        wireCtx.fillStyle = wireConnections[node.index] !== undefined ? node.color : 'rgba(0,0,0,0.5)';
        wireCtx.fill();
        wireCtx.strokeStyle = node.color;
        wireCtx.lineWidth = 3;
        wireCtx.shadowColor = node.color;
        wireCtx.shadowBlur = wireConnections[node.index] !== undefined ? 15 : 5;
        wireCtx.stroke();
        wireCtx.shadowBlur = 0;
    });

    // Draw right nodes
    wireRightNodes.forEach(node => {
        const connected = Object.values(wireConnections).includes(node.index);
        wireCtx.beginPath();
        wireCtx.arc(node.x, node.y, wireNodeRadius, 0, Math.PI * 2);
        wireCtx.fillStyle = connected ? node.color : 'rgba(0,0,0,0.5)';
        wireCtx.fill();
        wireCtx.strokeStyle = node.color;
        wireCtx.lineWidth = 3;
        wireCtx.shadowColor = node.color;
        wireCtx.shadowBlur = connected ? 15 : 5;
        wireCtx.stroke();
        wireCtx.shadowBlur = 0;
    });

    // Error flash
    if (wireErrorFlash) {
        wireCtx.fillStyle = 'rgba(255, 0, 0, 0.25)';
        wireCtx.fillRect(0, 0, wireCanvas.width, wireCanvas.height);
    }
}

function getWireNodeAt(x, y, nodes) {
    return nodes.find(n => Math.hypot(n.x - x, n.y - y) <= wireNodeRadius + 4);
}

function getWireCanvasPos(e) {
    const rect = wireCanvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function checkWireSolved() {
    if (Object.keys(wireConnections).length < wireNumWires) return;
    const allCorrect = Object.entries(wireConnections).every(([leftIdx, rightIdx]) => {
        const left = wireLeftNodes[leftIdx];
        const right = wireRightNodes.find(n => n.index === parseInt(rightIdx));
        return left && right && left.color === right.color;
    });
    if (allCorrect) {
        setTimeout(() => {
            document.getElementById('wire-solved-popup').classList.remove('hidden');
        }, 400);
        state.solvedWirePuzzle = true;
    }
}

function setupWireCanvasEvents() {
    wireCanvas.onmousedown = (e) => {
        const pos = getWireCanvasPos(e);
        const node = getWireNodeAt(pos.x, pos.y, wireLeftNodes);
        if (node) {
            wireDragging = true;
            wireDragStart = node;
            wireDragCurrent = pos;
            delete wireConnections[node.index];
            drawWireCanvas();
        }
    };

    wireCanvas.onmousemove = (e) => {
        if (!wireDragging) return;
        wireDragCurrent = getWireCanvasPos(e);
        drawWireCanvas();
    };

    wireCanvas.onmouseup = (e) => {
        if (!wireDragging) return;
        wireDragging = false;
        const pos = getWireCanvasPos(e);
        const rightNode = getWireNodeAt(pos.x, pos.y, wireRightNodes);
        if (rightNode && wireDragStart) {
            Object.keys(wireConnections).forEach(k => {
                if (wireConnections[k] === rightNode.index) delete wireConnections[k];
            });
            wireConnections[wireDragStart.index] = rightNode.index;
            if (wireDragStart.color !== rightNode.color) {
                wireErrorFlash = true;
                drawWireCanvas();
                setTimeout(() => {
                    wireErrorFlash = false;
                    drawWireCanvas();
                }, 500);
            }
            checkWireSolved();
        }
        wireDragStart = null;
        wireDragCurrent = null;
        drawWireCanvas();
    };

    wireCanvas.onmouseleave = () => {
        if (wireDragging) {
            wireDragging = false;
            wireDragStart = null;
            wireDragCurrent = null;
            drawWireCanvas();
        }
    };
}

init();