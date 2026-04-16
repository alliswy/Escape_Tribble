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
    hasWr: false, //wr here is white remote
    hasBr: false,

    hasLoKey: false,
    hasLrBook: false,
    hasSkPaper: false,
    hasLs10note: false,
    hasLs10drive: false,
    hasLorBook: false,
    hasSherlockBook: false,

    bdUnlocked: false,
    bdBackDoorUnlocked: false,
    kiUnlocked: false,
    liUnlocked: false,
    crUnlocked: false,
    camrUnlocked: false,
    wrUnlocked: false,
    loUnlocked: false,

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
    discoveredLs: false,
    discoveredClr: false,
    discoveredStairs: false,
    discoveredCw: false,
    discoveredWr: false,
    discoveredBath: false,
    discoveredSnh: false,
    discoveredOh1: false,
    discoveredOh2: false,
    discoveredOh3: false,
    discoveredPrint: false,

    solvedWirePuzzle: false,
    foundPtCode: false,
    foundWrNote: false,
    foundOctagon: false,
    foundScanner: false,
    foundLiClue: false, //fixme add this when they use the paper on the sherlock book
    foundLoMonitor: false,
    foundArchives: false,
    foundWrPapers: false,

    foundWp: false,

    isProjectorOn: false,
    isLeftMonitorOn: false,
    isRightMonitorOn: false,
    isLiLaptopOn: false,
    isLiTvOn: false,
    isLiReadOn: false,
    isPrinterCalibrated: false,

    wonWordle: false,
    foundWordle: false,
    foundml: false,
    //terminalSolved: false,
    savedKey: "", //this variable is the password for the left monitor in the camera room
    enteredCode: "",
    correctCode: "3672",

    //library/misc
    movedAnimals: false,
    scannedBook: false,
    loMonitorUnlocked: false,
    usedDrive: false,
    hatchOpen: false,

    //stuff for feedback checks
    visitedPages: {},
    notificationsSeen: {},
}

// ----- 2. SELECTORS -----
const arrows = {
    back: document.getElementById('master-back-arrow'),
    forward: document.getElementById('master-forward-arrow'),
    left: document.getElementById('master-left-arrow'),
    right: document.getElementById('master-right-arrow')
};

// Check if they exist and then assign
if (arrows.back)    arrows.back.onclick = goBack;
if (arrows.forward) arrows.forward.onclick = goForward;
if (arrows.left)    arrows.left.onclick = goLeft;
if (arrows.right)   arrows.right.onclick = goRight;

const backArrow = document.getElementById('master-back-arrow');
const forwardArrow = document.getElementById('master-forward-arrow');
const leftArrow = document.getElementById('master-left-arrow');
const rightArrow = document.getElementById('master-right-arrow');
const menu = document.getElementById('menu-screen');
const tutorial = document.getElementById('tutorial');

const startButton = document.getElementById('start-button');
const play = document.getElementById('play');
const allPages = document.querySelectorAll('.fit');
const inventoryTab = document.getElementById('inventory-tab');
const entryPages = [
    'mh-bd-main-page',    // Starting area
    'bd-door-open-page',  //entrance to bd
    'pr-steps-page',      //entrance to pr
    'ki-door-open-page',  // Kitchen
    'cr-main-2dc-page',   //cr entrance
    'camr-main-page',     //camr
    'clr-main-id-page',   //clr
    'bh-entrance-page',   //back hall
    'sh-cr-door-open',    //side hall
    'li-door-open-page',   // Library
    'cw-entrance-page',   // C-Wing
    'bath-page',
    'wr-main-page',
    'ls-in-1-page',       //library storage
    'lo-main-page',       //library office
]; //fixme, double check these are starting pages, and add inv images

// ------------ audio -------------
// --- Audio Assets & Base Volumes ---
const sfx = {
    // Tunnels
    tuRumble:    { audio: new Audio('sounds/earth-rumble.mp3'),      baseVol: 0.6 },
    tuClank:     { audio: new Audio('sounds/low-metal-hit-3.mp3'),   baseVol: 0.8 },
    tuExpl:      { audio: new Audio('sounds/medium-explosion.mp3'),  baseVol: 0.7 },
    tuScratch:   { audio: new Audio('sounds/metal-moving.mp3'),      baseVol: 0.5 },

    // C-Wing
    sinkWater:   { audio: new Audio('sounds/water-in-sink.mp3'),     baseVol: 0.3 },
    printClick:  { audio: new Audio('sounds/printer-clicking.mp3'),  baseVol: 0.2 },
    shufflePapers: { audio: new Audio('sounds/shuffle-papers.mp3'),  baseVol: 0.2 },
    unlock: { audio: new Audio('sounds/unlock.mp3'),  baseVol: 0.5 },
    openDoor: {audio: new Audio('sounds/door-open.mp3'), baseVol: 0.4},
    cwDoor: {audio: new Audio('sounds/cw-door.mp3'), baseVol: 0.5},
    doorOpenClose: {audio: new Audio('sounds/door-open-close.mp3'), baseVol: 0.5},
    doorClose: {audio: new Audio('sounds/door-close.mp3'), baseVol: 0.5},
    steps: {audio: new Audio('sounds/steps.mp3'), baseVol: 0.5},
    markerWhiteboard: {audio: new Audio('sounds/marker-whiteboard.mp3'), baseVol: 0.5},

    scanner: {audio: new Audio('sounds/scanner.mp3'), baseVol: 0.5},
    keypadBeep: {audio: new Audio('sounds/keypad-beep.mp3'), baseVol: 0.5},
    keycardSwipe: {audio: new Audio('sounds/keycard-swipe.mp3'), baseVol: 0.5},
    accessBeep: {audio: new Audio('sounds/access-beep.mp3'), baseVol: 0.5},
    errorBeep: {audio: new Audio('sounds/error-beep.mp3'), baseVol: 0.5},
    ambientNoise: {audio: new Audio('sounds/ambient-noise.m4a'), baseVol: 1},

}; //fixme add more sounds


// ------  SOUNDS FUNCTIONS --------- fixme move these down later for organization


function getSFXMultiplier() {
    const slider = document.getElementById('sfx-slider');
    return slider ? parseFloat(slider.value) / 50 : 1.0;
}

function getMusicMultiplier() {
    const slider = document.getElementById('music-slider'); // Your music slider ID
    return slider ? parseFloat(slider.value) / 50 : 1.2; // Defaulting to 1.2 for "extra loud"
}
//fixme delete this
// // Standard Play function
// function playSound(key) {
//     const entry = sfx[key];
//     if (entry) {
//         const m = getSFXMultiplier();
//         entry.audio.volume = Math.min(Math.max(entry.baseVol * m, 0), 1);
//         entry.audio.currentTime = 0;
//         entry.audio.play();
//     }
// }

// Smooth Fade Out function
function fadeOut(key, durationMs) {
    const entry = sfx[key];
    if (!entry || !entry.audio) return;

    const audio = entry.audio;
    const startVol = audio.volume;
    const steps = 30; // More steps = smoother fade
    const interval = durationMs / steps;

    let currentStep = 0;
    const fadeTimer = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, startVol * (1 - currentStep / steps));

        if (currentStep >= steps) {
            audio.pause();
            clearInterval(fadeTimer);
        }
    }, interval);
}

function playHatchSequence() {
    const m = getSFXMultiplier();

    // 1. Initial Explosion
    const expl = sfx.tuExpl.audio;
    expl.volume = 0.2 * m;
    expl.play();

    setTimeout(() => {
        // 2. Start the Rumble
        const rumble = sfx.tuRumble.audio;
        rumble.volume = 0.3 * m;
        rumble.play();

        // 3. Layer the mechanical "crunch"
        setTimeout(() => {
            const scratch = sfx.tuScratch.audio;
            scratch.volume = 0.1 * m;
            scratch.play();
        }, 25);

        setTimeout(() => {
            const clank = sfx.tuClank.audio;
            clank.volume = 0.03 * m;
            clank.play();
        }, 20);

        // 4. Smoothly fade the rumble away after 2.5 seconds
        // This will reach 0 volume at exactly the 4000ms mark
        setTimeout(() => {
            fadeOut('tuRumble', 1500);
        }, 2200);

    }, 300);
}
//
// function leaveRoomAudio() {
//     stopSound('bath-page', 500);
// } fixme prolly remove this

/**
 * Master SFX Controller
 * Handles UI syncing, volume scaling, and real-time audio updates.
 */
function syncSFXSystems(val) {
    const multiplier = val / 50; // 50 is our 1.0 baseline

    // 1. Update all Slider Values & Labels
    const sliders = ['sfx-slider', 'ingame-sfx-slider'];
    const labels = ['sfx-value', 'ingame-sfx-value'];

    sliders.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

    labels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });

    // 2. Update all active sounds in the library
    for (let key in sfx) {
        // Tell the SFX slider to keep its hands off the music file!
        if (key === 'ambientNoise') continue;

        const entry = sfx[key];
        if (entry && entry.audio) {
            const finalVol = entry.baseVol * multiplier;
            entry.audio.volume = Math.min(Math.max(finalVol, 0), 1);
        }
    }

    for (let page in pageSounds) {
        const data = pageSounds[page];
        // This part is already correct!
        if (data.clip && data.type !== 'music') {
            data.clip.volume = Math.min(Math.max(data.volume * multiplier, 0), 1);
        }
    }
}

//syncs music sounds to music slider
function syncMusicSystems(val) {
    const multiplier = val / 50;

    document.getElementById('music-value').textContent = val;
    document.getElementById('music-slider').value = val;

    // 1. Update the raw audio file in the sfx warehouse
    if (sfx.ambientNoise) {
        const finalVol = sfx.ambientNoise.baseVol * multiplier;
        sfx.ambientNoise.audio.volume = Math.min(Math.max(finalVol, 0), 1);
    }

    // 2. Update any clips tagged as music
    for (let page in pageSounds) {
        const data = pageSounds[page];
        if (data.clip && data.type === 'music') {
            data.clip.volume = Math.min(Math.max(data.volume * multiplier, 0), 1);
        }
    }
}



// ----- NAVIGATION MAP -----
const roomLeads = {
    // Book Drop (BD)
    'mh-bd-main-page':           { right: 'mh-bd-right-endc-page', left: 'mh-bd-left-endc-page' },
    'mh-bd-door-page':           { back: 'mh-bd-main-page' },
    'bd-door-open-page':      { back: 'mh-bd-main-page', forward: 'bd-cart-page', audio: {back: 'doorClose'} },
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
    'pr-steps-page':          { back: 'bd-back-door-open-page', forward: 'pr-main-page'},
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
    'mh-li-right-endc-page':    { back: 'mh-bd-right-endc-page', forward: 'mh-cend-right-endc-kc-page', left: 'mh-li-door-closed-page', right: 'mh-tu-stairs-door-page' },
    'mh-cend-right-endc-kc-page': { back: 'mh-li-right-endc-page', right: 'mh-ki-door-closed-page' },

    'mh-tu-stairs-door-page':    {left: 'mh-li-right-endc-page', right: 'mh-li-left-endc-page'},

    // Main Hall (Left Side)
    'mh-cend-left-endc-page':   { forward: 'mh-li-left-endc-page', left: 'mh-ki-door-closed-page' },
    'mh-li-left-endc-page':     { back: 'mh-cend-left-endc-page', forward: 'mh-bd-left-endc-page', right: 'mh-li-door-closed-page', left: 'mh-tu-stairs-door-page' },
    'mh-bd-left-endc-page':     { back: 'mh-li-left-endc-page', forward: 'mh-bh-left-endc-page', right: 'mh-bd-main-page' },
    'mh-bh-left-endc-page':     { back: 'mh-bd-left-endc-page', forward: 'mh-hall-left-endc-page', left: 'bh-entrance-page'},
    'mh-hall-left-endc-page':   { back: 'mh-bh-left-endc-page', forward: 'mh-sl-left-endc-page' },
    'mh-sl-left-endc-page':     { back: 'mh-hall-left-endc-page', right: 'mh-sld-page' },

    'mh-sld-page':            { left: 'mh-sl-left-endc-page', right: 'mh-sl-right-endc-page' },

    // back hall
    'bh-entrance-page':       { forward: 'bh-2-page', left: 'mh-bh-right-endc-page', right: 'mh-bh-left-endc-page' },
    'bh-2-page':              { back: 'bh-entrance-page', forward: 'bh-3-page' },
    'bh-3-page':              { back: 'bh-2-page', forward: 'bh-4-page' },
    'bh-4-page':            { back: 'bh-3-page', forward: 'bh-end-page', left: 'bh-sh-entrance-page'},
    'bh-sh-entrance-page':   {back: 'bh-4-page', forward: 'bh-sh-cr-dc-page', left: 'bh-rev-1-page'},
    'bh-rev-1-page':            {forward: 'bh-rev-2-page', right: 'bh-sh-entrance-page'},
    'bh-rev-2-page':            {back: 'bh-rev-1-page', forward: 'bh-rev-3-page'},
    'bh-rev-3-page':            {back: 'bh-rev-2-page', forward: 'bh-rev-4-page'},
    'bh-rev-4-page':            {back: 'bh-rev-3-page', right: 'mh-bh-right-endc-page', left: 'mh-bh-left-endc-page'},
    //fixme add another imgae here coming out of the bh but curr in mh
    'bh-sh-cr-dc-page':      {back: 'bh-sh-entrance-page'},
    'bh-end-page':          {back: 'bh-4-page'},
    'bh-sh-cr-do-page':      {back: 'bh-sh-cr-dc-page' },
    'sh-cr-door-open-page':    {back: 'bh-sh-cr-do-page'},
    'bh-sh-cr-door-closed-page':   {back: 'bh-sh-cr-dc-page'},
    'bh-sh-cr-door-handle-page':    {back: 'bh-sh-cr-door-closed-page'},
    'bh-sh-cr-door-keypad-page':    {back: 'bh-sh-cr-door-handle-page'},

    //creepy room
    'cr-main-2dc-page':     {back: 'sh-cr-door-open-page'},
    'cr-main-1dc-page':     {back: 'sh-cr-door-open-page'},
    'cr-main-page':         {back: 'sh-cr-door-open-page'},
    'cr-doors-2dc-page':    {back: 'cr-main-2dc-page'},
    'cr-doors-1dc-page':    {back: 'cr-main-1dc-page'},
    'cr-doors-1dc-cam-page': {back: 'cr-main-1dc-page'},
    'cr-doors-1dc-ld-page':  {back: state.isLeftMonitorOn ? 'cr-doors-1dc-cam-page': 'cr-doors-1dc-page'},
    'cr-doors-cam-page':     {back: 'cr-main-page'},
    'cr-doors-page':        {back: 'cr-main-page'},
    'cr-couches-key-page':  {back: () => state.camrDoorOpen ? state.crlDoorOpen ? 'cr-main-page' : 'cr-main-1dc-page': 'cr-main-2dc-page'},
    'cr-couch-key-page':    {back: 'cr-couches-key-page'},
    'cr-couch-zoom-key-page': {back: 'cr-couch-key-page'},
    'cr-couches-page':        {back: () => state.camrDoorOpen ? state.crlDoorOpen ? 'cr-main-page' : 'cr-main-1dc-page': 'cr-main-2dc-page'},
    'cr-couch-page':         {back: 'cr-couches-page'},
    'cr-couch-zoom-page':    {back: 'cr-couch-page'},
    'clr-main-page':        {back: () => state.isLeftMonitorOn ? 'cr-doors-cam-page' : 'cr-doors-page'},
    'clr-main-id-page':     {back: () => state.isLeftMonitorOn ? 'cr-doors-cam-page' : 'cr-doors-page'},
    'clr-cloth-page':       {back: 'clr-main-page'},
    'clr-cloth-octagon-page': {back: 'clr-cloth-page'},

    //camera room
    'cr-camr-door-closed-page': {back: 'cr-doors-2dc-page'},
    'camr-main-page':           {back: () => state.crlDoorOpen ? 'cr-doors-page' :'cr-doors-1dc-page'},
    'camr-main-ml-on-page':     {back: () => state.crlDoorOpen ? 'cr-doors-cam-page' : 'cr-doors-1dc-cam-page'},
    'camr-main-ml-on-person-page': {back: 'cr-doors-1dc-cam-page'},
    'camr-wp-page':             {back: 'camr-main-page'},
    'camr-we-page':             {back: 'camr-main-page'},
    'camr-mlo-we-page':         {back: 'camr-main-ml-on-page'},
    'camr-main-wp-page':        {back: 'cr-doors-1dc-page'},
    'camr-ml-off-page':         {back: () => state.foundWp ? 'camr-main-page':'camr-main-wp-page'},
    'camr-ml-on-page':          {back: () => state.justTurnedOnMl ? 'camr-main-ml-on-person-page' :'camr-main-ml-on-page'},
    'camr-ml-on-person-page':   {back: 'camr-main-ml-on-person-page'}, //fixme, finish all this stuff w the person in the camera
    //note for next line: if the left monitor is on, they already visited the left monitor, and thus already saw the window person !
    'camr-mr-off-page':         {
        back: () => {
            // 1. Check if the Wordle is currently open
            const wordleContainer = document.getElementById('wordle-minigame');
            const isWordleOpen = wordleContainer && !wordleContainer.classList.contains('hidden');

            // 2. If it's open, "disable" the back button by returning the current page (stay put)
            if (isWordleOpen) {
                console.log("Terminal active: Navigation locked.");
                return 'camr-mr-off-page';
            }

            // 3. Otherwise, run your normal logic
            return state.isLeftMonitorOn ? 'camr-main-mlo-page' : state.foundWp ? 'camr-main-page' : 'camr-main-wp-page';
        }
    },


    //kitchen
    'mh-ki-door-closed-page':    { left: 'mh-cend-right-endc-kc-page', right: 'mh-cend-left-endc-page' },
    'mh-ki-door-handle-page':    { back: 'mh-ki-door-closed-page' },
    'ki-door-open-page':       {back: 'mh-ki-door-closed-page', forward: 'ki-entrance-page', audio: {back: 'doorClose'}},
    'ki-entrance-page':        {back: 'ki-door-open-page'},
    'ki-entrance-code-page':   {back: 'ki-door-open-page'},
    'ki-main-code-page':       {back: 'ki-entrance-code-page'},
    'ki-main-noCode-page':      {back: 'ki-entrance-page'},
    'ki-entrance-noCode-page':  {back: 'ki-entrance-page'},
    'ki-pt-code-page':          {back: 'ki-main-code-page'},
    'ki-pt-noCode-page':        {back: 'ki-main-noCode-page'},


    //c-wing left-progression/entrance/snack hall
    'stairs-rubble-page': {back: 'mh-cend-right-endc-kc-page',},
    'stairs-page':        {back: 'stairs-rubble-page', forward: 'mh-cw-door-page'},
    'mh-cw-door-page':          {back: 'stairs-page'},
    'mh-cw-door-plate-page':    {back: 'mh-cw-door-page'},
    'cw-stairs-door-page':       {back: 'cw-stairs-entrance-page'},
    'cw-stairs-entrance-page':      {forward: 'cw-stairs-door-page', right: 'cw-left-bath-page', left: 'cw-right-aw-page'},
    'cw-entrance-page':         {back: 'mh-cw-door-page', forward: 'cw-entrance-2-page'},
    'cw-entrance-2-page':       {back: 'cw-entrance-page', forward: 'cw-entrance-3-page'},
    'cw-entrance-3-page':       {back: 'cw-entrance-2-page', left: 'cw-left-bath-page', right: 'cw-right-eh-page'},
    'cw-left-bath-page':    {back: 'cw-left-eh-page', left: 'cw-bath-door-page', forward: () => state.wrUnlocked ? 'cw-left-snh-wro-page': 'cw-left-snh-wrc-page'},
    'cw-left-snh-wrc-page':     {back:'cw-left-bath-page', forward: 'cw-wr-dc-page', right: 'snh-entrance-page'},
    'cw-left-snh-wro-page':     {back: 'cw-left-bath-page', forward: 'cw-elevator-wr-do-page', right: 'snh-entrance-page'},
    'cw-elevator-wr-do-page':   {back: 'cw-left-snh-wro-page', left: 'cw-elevator-page'},
    'cw-wr-dc-page':            {back: 'cw-left-snh-wrc-page', left: 'cw-elevator-page'},
    'snh-entrance-page':     {left: () => state.wrUnlocked ? 'cw-left-snh-wro-page': 'cw-left-snh-wrc-page', right: 'cw-right-snh-page'},
    'cw-left-eh-page':          {back: 'cw-left-2-page', forward: 'cw-left-bath-page', left: 'cw-stairs-entrance-page'},
    'cw-left-1-page':           {forward: 'cw-left-2-page', right: 'cw-oh2-entrance-page', left: 'cw-oh2-exit-page'},
    'cw-left-2-page':           {back: 'cw-left-1-page', forward: 'cw-left-eh-page', left: 'cw-oh1-entrance-page'},

    //c-wing right progression/hallways
    'cw-right-snh-page':        {forward: 'cw-right-bath-page', left: 'snh-entrance-page', right: 'cw-elevator-page'},
    'cw-right-bath-page':       {back: 'cw-right-snh-page', right: 'cw-bath-door-page', forward: 'cw-right-aw-page'},
    'cw-right-aw-page':         {back: 'cw-right-bath-page', forward: 'cw-right-eh-page', right: 'cw-stairs-entrance-page'}, //fixme add right
    'cw-right-eh-page':          {back: 'cw-right-aw-page', forward: 'cw-right-oh1-page', left: 'cw-eh-entrance-page'},
    'cw-right-oh1-page':        {back: 'cw-right-eh-page', forward: 'cw-right-print-page', right: 'cw-oh1-entrance-page'}, //fixme add right
    'cw-right-print-page':      {back: 'cw-right-oh1-page', forward: () => state.isPrinterCalibrated ? 'print-main-paper-page' :'print-main-page', left: 'cw-oh2-entrance-page', right: 'cw-oh2-exit-page'},

    //c-wing side halls
    'print-main-page':          {back: 'cw-right-print-page'},
    'print-page':               {back: 'print-main-page'},
    'print-main-paper-page':    {back: 'cw-right-print-page'},
    'print-paper-page':         {back: 'print-main-paper-page'},
    'print-screen-page':        {back: () => state.isPrinterCalibrated ? 'print-paper-page' : 'print-page'}, //fixme add more for this page
    'cw-eh-entrance-page':      {forward: 'eh-door-page', right: 'cw-right-eh-page', left: 'cw-left-eh-page'},
    'eh-door-page':             {back: 'cw-eh-entrance-page'},
    'eh-door-plate-page':       {back: 'eh-door-page'},
    'cw-oh1-entrance-page':        {left: 'cw-right-oh1-page', right: 'cw-left-2-page', forward: 'oh1-left-1-page'},
    'cw-oh2-exit-page':         {back: 'oh2-exit-page', left: 'cw-right-print-page', right: 'cw-left-1-page'}, //fixme add forward (?)
    'oh1-left-1-page':          {back: 'cw-oh1-entrance-page', forward: 'oh1-left-2-page'}, //fixme add left or back
    'oh1-left-2-page':          {back: 'oh1-left-1-page', forward: 'oh1-left-3-page', left: 'oh1-exit-2-page'},
    'oh1-left-3-page':          {back: 'oh1-left-2-page', forward: () => state.hasClrKey ? 'oh1-left-4-page': 'oh1-left-4-key-page'}, //fixme is this really Li key or should it be Clr key ?
    'oh1-left-4-page':          {back: 'oh1-left-3-page', right: 'oh1-right-1-page'},
    'oh1-left-4-key-page':      {back: 'oh1-left-3-page', right: 'oh1-right-1-page'},
    'oh1-right-1-page':         {forward: 'oh1-right-2-page', left: () => state.hasClrKey ? 'oh1-left-4-page': 'oh1-left-4-key-page'},
    'oh1-right-2-page':         {back: 'oh1-right-1-page', forward: 'oh1-right-3-page', right: 'oh1-exit-2-page'},
    'oh1-right-3-page':         {back: 'oh1-right-2-page'}, //fixme add right: oh1-exit-1-page
    'oh1-exit-2-page':          {right: 'oh1-left-2-page', left: 'oh1-right-2-page', forward: 'cw-oh2-entrance-page'},
    'oh1-books-page':           {back: 'oh1-left-4-page'},
    'oh1-books-key-page':       {back: 'oh1-left-4-key-page'},

    'cw-oh2-entrance-page':     {back: 'oh1-exit-2-page', forward: 'oh2-entrance-page', right: 'cw-right-print-page', left: 'cw-left-1-page'},
    'oh2-entrance-page':        {back: 'cw-oh2-entrance-page', right: 'oh2-oh3-entrance-page'},
    'oh2-oh3-entrance-page':    {forward: 'oh3-page', back: 'oh2-entrance-page', right: 'oh2-exit-page'},
    'oh3-page':                 {back: 'oh2-oh3-entrance-page'},
    'oh2-exit-page':            {left: 'oh2-oh3-entrance-page', forward: 'cw-oh2-exit-page'},


    //c-wing inspections/doors
    'cw-bath-door-page':        {right: 'cw-left-bath-page', left: 'cw-right-bath-page'},
    'bath-page':             {back: 'cw-bath-door-page'},
    'bath-sink-page':        {back: 'bath-page'},
    'cw-elevator-page':         {left: 'cw-right-snh-page', right: () => state.wrUnlocked ? 'cw-elevator-wr-do-page': 'cw-wr-dc-page'},
    'cw-wr-handle-unlocked-page': {back: 'cw-elevator-wr-do-page'},
    'cw-wr-handle-locked-page': {back: 'cw-wr-dc-page'},


    //writing room pages
    'wr-left-page':         {back: 'cw-elevator-wr-do-page', forward: () => state.hasLiKey ? 'wr-left-desk-page' : 'wr-left-desk-key-page', right: 'wr-mid-page'},
    'wr-left-desk-key-page': {back: 'wr-left-page', forward: 'wr-desk-key-page'},
    'wr-desk-key-page':      {back: 'wr-left-desk-key-page'},
    'wr-left-desk-page':        {back: 'wr-left-page', forward: 'wr-desk-page'},
    'wr-desk-page':             {back:'wr-left-desk-page'},
    'wr-mid-page':              {back: 'cw-elevator-wr-do-page', left: 'wr-left-page', right: () => state.foundWrNote ? 'wr-right-note-page' :'wr-right-page'},
    'wr-right-page':            {back :'cw-elevator-wr-do-page', left: 'wr-mid-page'},
    'wr-papers-page':           {back: 'wr-right-note-page' },
    'wr-right-note-page':       {back :'cw-elevator-wr-do-page', left: 'wr-mid-page' },
    'wr-note-page':             {back: 'wr-right-note-page'},

    //library
    'mh-li-door-closed-page':    { left: 'mh-li-left-endc-page', right: 'mh-li-right-endc-page' },
    'mh-li-door-handle-page':    { back: 'mh-li-door-closed-page' },
    'li-door-open-page':         {back: 'mh-li-door-closed-page', forward: () => state.isLiTvOn ? 'li-entrance-tvo-page' :'li-entrance-page', audio: {back: 'doorClose'}},
    'li-entrance-page':          {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'}, //fixme add check for if one door is open
    'li-entrance-nb-page':       {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'}, //fixme add check for if one door is open
    'li-entrance-tvo-page':      {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'}, //fixme add check for if one door is open
    'li-entrance-tvo-nb-page':   {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'}, //fixme add check for if one door is open
    'li-2dc-page':               {back: () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page': 'li-main-2dc-page'},
    'li-main-2dc-page':          {back: 'li-entrance-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-2dc-ro-page':       {back: 'li-entrance-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-2dc-tvo-page':      {back: 'li-entrance-tvo-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-2dc-ro-tvo-page':   {back: 'li-entrance-tvo-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-rw-page':           {left:  () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page' : 'li-main-2dc-page'},
    'li-main-lw-page':           {back: () => state.hasLorBook ? state.isLiTvOn ? 'li-entrance-tvo-nb-page' : 'li-entrance-nb-page' : state.isLiTvOn ? 'li-entrance-tvo-page' : 'li-entrance-page', right: () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page' : 'li-main-2dc-page'}, //fixme add do check

    //library mid-wall pages
    'li-mid-wall-page':     {back: 'li-main-2dc-page'}, //fixme check for do
    'li-mid-wall-ro-page':  {back: 'li-main-2dc-ro-page'},
    'li-mid-wall-tvo-page': {back: 'li-main-2dc-tvo-page'},
    'li-mid-wall-ro-tvo-page': {back: 'li-main-2dc-ro-tvo-page'},
    'li-tv-2r-page':        { back: () => state.isLiReadOn ? 'li-mid-wall-ro-page' : 'li-mid-wall-page' },
    'li-tv-br-page':        { back: () => state.isLiReadOn ? 'li-mid-wall-ro-page' : 'li-mid-wall-page' },
    'li-tv-wr-page':        { back: () => state.isLiReadOn ? 'li-mid-wall-ro-page' : 'li-mid-wall-page' },
    'li-tv-wr-tvo-page':    {back: () => state.isLiReadOn ? 'li-mid-wall-ro-tvo-page' : 'li-mid-wall-tvo-page'},
    'li-tv-page':           { back: () => state.isLiReadOn ? 'li-mid-wall-ro-page' : 'li-mid-wall-page' },
    'li-tv-on-page':        {back: () => state.isLiReadOn ? 'li-mid-wall-ro-tvo-page': 'li-mid-wall-tvo-page'},
    'li-2r-page':           {back: 'li-tv-2r-page'},
    'li-wr-page':           {back: 'li-tv-wr-page'},
    'li-wr-tvo-page':       {back: 'li-tv-wr-tvo-page'},
    'li-br-page':           {back: 'li-tv-br-page'},
    'li-nr-page':           {back: 'li-tv-page'},
    'li-nr-tvo-page':       {back: 'li-tv-on-page'},
    'li-read-page':         {back: () => state.isLiTvOn ? 'li-mid-wall-tvo-page' : 'li-mid-wall-page'},
    'li-read-on-page':      {back: () => state.isLiTvOn ? 'li-mid-wall-ro-tvo-page' : 'li-mid-wall-ro-page'},

    //library right wall pages
    'li-animals-1-page':    {back: 'li-main-rw-page'},
    'li-animals-2-page':    {back: 'li-animals-1-page'},
    'li-animals-open-1-page': {back: 'li-main-rw-page'},
    'li-animals-open-2-page': {back: 'li-animals-open-1-page'},
    'li-animals-open-key-page': {back: 'li-animals-open-1-page'},

    //library left wall pages
    'li-left-lt-page':      {back: 'li-main-lw-page'},
    'li-lt-page':           {back: 'li-left-lt-page'},
    'li-laptop-page':       {back: 'li-lt-page'},
    'li-laptop-star-page':  {back: 'li-lt-star-page'},
    'li-lt-star-page':      {back: () => (state.scannedBook && !state.hasSkPaper) ? 'li-lt-sk-paper-page' : 'li-left-lt-page'},
    'li-lt-sk-paper-page':  {}, //they're forced to take the paper
    'li-lt-sk-page':        {back: 'li-main-lw-sk-page'},
    'li-main-lw-sk-page':   {right: () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page' : 'li-main-2dc-page'}, //fixme add check for doors open

    //mw books pages
    'li-mw-books-page':     {back: 'li-main-lw-page' }, //fixme
    'li-mw-books-nb-page':  {back: 'li-main-lw-page'},
    'li-tolkein-page':      {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-esme-page':         {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-russo-page':        {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-ruta-page':         {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-tolkein-nb-page':   {back: 'li-mw-books-nb-page'},

    //lw books page
    'li-rw-books-page':     {back: 'li-main-rw-page'},
    'li-rw-book-page':      {back: 'li-main-lw-page'}, //fixme
    'li-onoseta-page':      {back: 'li-rw-books-page'},
    'li-barnes-page':         {back: 'li-rw-books-page'},
    'li-boulley-page':        {back: 'li-rw-books-page'},
    'li-alston-page':        {back: 'li-rw-books-page'},
    'li-smith-page':        {back: 'li-rw-books-page'},

    'li-rw-books-birb-page':   {back: 'li-main-rw-page'}, //fixme fix back
    'li-rw-books-birb-nb-page': {back: 'li-main-rw-page'}, //fixme is that the page I want back ?
    'li-birb-book-page':        {back: 'li-rw-books-birb-page'},
    'li-birb-page':             {back: 'li-rw-books-birb-nb-page'},

    //library office pages
    'li-office-door-closed-page':   {back: 'li-2dc-page'}, //fixme add stuff for this later
    'li-office-door-open-page':     {back: 'li-office-door-closed-page'}, //fixme add back later
    'lo-main-page':                 {back: 'li-office-door-open-page', left: 'lo-main-left-page', right: 'lo-desk-page'},
    'lo-main-left-page':            {back: 'lo-main-page' },
    'lo-storage-entrance-page':     {back: 'lo-main-left-page', forward: 'ls-in-1-page' },
    'lo-main-right-page':           {back: 'ls-lo-entrance-page' }, //fixme add right image exiting the office
    'lo-desk-page':                 {back: 'lo-main-page', forward: 'lo-desk-2-page'},
    'lo-desk-2-page':               {back: 'lo-desk-page'},
    'lo-monitor-page':              {back: 'lo-desk-2-page'},
    'lo-monitor-drive-page':        {back: 'lo-desk-2-page'},

    //library storage pages
    'ls-lo-entrance-page':          {back: 'ls-out-10-page', forward: 'lo-main-right-page'},
    'ls-archives-sk-page':           {right: 'ls-out-5-page', left: 'ls-in-5-page'},
    'ls-archives-note-page':        {back: 'ls-archives-sk-page'},
    'ls-black-1997-page':           {back: 'ls-archives-sk-page'},
    'ls-harrell-1993-page':         {back: 'ls-archives-sk-page'},
    'ls-mcduffie-1993-page':        {back: 'ls-archives-sk-page'},
    'ls-keser-1994-page':           {back: 'ls-archives-sk-page'},
    'ls-archives-sk-2-page':        {back: 'ls-archives-sk-page'},
    'ls-archives-page':             {left: 'ls-in-5-page', right: 'ls-out-5-page'},

    'ls-in-1-page':  { back: 'lo-storage-entrance-page', forward: 'ls-in-2-page' },
    'ls-in-2-page':  { back: 'ls-in-1-page', forward: 'ls-in-3-page' },
    'ls-in-3-page':  { back: 'ls-in-2-page', forward: 'ls-in-4-page' },
    'ls-in-4-page':  { back: 'ls-in-3-page', forward: 'ls-in-5-page' },
    'ls-in-5-page':  { back: 'ls-in-4-page', forward: 'ls-in-6-page', right: () => (state.hasLs10note && state.hasLs10drive) ? 'ls-archives-sk-page' : 'ls-archives-page' },
    'ls-in-6-page':  { back: 'ls-in-5-page', forward: 'ls-in-7-page' },
    'ls-in-7-page':  { back: 'ls-in-6-page', forward: 'ls-in-8-page' },
    'ls-in-8-page':  { back: 'ls-in-7-page', forward: 'ls-in-9-page' },
    'ls-in-9-page':  { back: 'ls-in-8-page', forward: () => state.hasLs10note ? state.hasLs10drive ? 'ls-in-10-page' : 'ls-in-10-sk-nd-page' : 'ls-in-10-sk-nd-page' },
    'ls-in-10-page': { right: 'ls-10-right-page' },

    'ls-in-10-sk-page':     {right: 'ls-10-right-page'},
    'ls-in-10-sk-nd-page':  {right: 'ls-10-right-page'},
    'ls-10-sk-page':        {back: 'ls-in-10-sk-page'},
    'ls-10-sk-nd-page':     {back: 'ls-in-10-sk-nd-page'},

    'ls-10-right-page':     {left: () => state.hasLs10note ? state.hasLs10drive ? 'ls-in-10-page' : 'ls-in-10-sk-nd-page' : 'ls-in-10-sk-nd-page', right: 'ls-out-1-page'},

    'ls-out-1-page':  { forward: 'ls-out-2-page' },
    'ls-out-2-page':  { back: 'ls-out-1-page', forward: 'ls-out-3-page' },
    'ls-out-3-page':  { back: 'ls-out-2-page', forward: 'ls-out-4-page' },
    'ls-out-4-page':  { back: 'ls-out-3-page', forward: 'ls-out-5-page' },
    'ls-out-5-page':  { back: 'ls-out-4-page', forward: 'ls-out-6-page', left: () => (state.hasLs10note && state.hasLs10drive) ? 'ls-archives-sk-page' : 'ls-archives-page' },
    'ls-out-6-page':  { back: 'ls-out-5-page', forward: 'ls-out-7-page' },
    'ls-out-7-page':  { back: 'ls-out-6-page', forward: 'ls-out-8-page' },
    'ls-out-8-page':  { back: 'ls-out-7-page', forward: 'ls-out-9-page' },
    'ls-out-9-page':  { back: 'ls-out-8-page', forward: 'ls-out-10-page' },
    'ls-out-10-page': { back: 'ls-out-9-page', forward: 'ls-lo-entrance-page'},

    //tunnel pages
    'tu-stairs-page':       {back: 'mh-tu-stairs-door-page'},
    'tu-stairs-ho-page':    {back: 'mh-tu-stairs-door-page'},

};

function createSoundClip(sfxEntry, volume = 1, loop = true, startCrop = 0, endCrop = 0) {
    return {
        clip: sfxEntry.audio, // Add .audio here!
        volume: volume,
        loop: loop,
        startCrop: startCrop,
        endCrop: endCrop
    };
}

const pageSounds = {
    //ambient noise throughout the whole game (music)
    'globalAmbience': {
        ...createSoundClip(sfx.ambientNoise, 1, true, 1.5, 1.5),
        type: 'music'
    },

    'bath-page': createSoundClip(sfx.sinkWater, 0.04, true, 0.5, 1),
    'bath-sink-page': createSoundClip(sfx.sinkWater, 0.09, true, 0.5, 1),

    //action sounds fixme this may break something not sure yet
    'unlock': createSoundClip(sfx.unlock, 0.5, false, 0.4, 3.9),
    'doorClose': createSoundClip(sfx.doorClose, 0.7, false, 1.03,0),
    'keycardSwipe': createSoundClip(sfx.keycardSwipe, 0.5, false, 1.4, 9.7),
    'accessBeep': createSoundClip(sfx.accessBeep, 0.5, false, 0, 0.6),
    'steps': createSoundClip(sfx.steps, 0.5, false, 0.5, 9),
    'markerWhiteboard': createSoundClip(sfx.markerWhiteboard, 0.3, false, 3, 45), //fixme check boundaries on this one, and add it to the desired page
}

let activeLoop = null; // To stop the loop when we change pages
// Variable to track the currently playing LOOPING sound
let currentlyPlayingId = null;

function triggerSound(id) {
    // 1. CHECK THE REGISTRY (Clips)
    const data = pageSounds[id];

    if (data) {
        const { clip, volume, loop, startCrop, endCrop, type } = data;

        // Prevent restarting loops
        if (loop && id === currentlyPlayingId) return;

        // Cleanup old timers/fades
        if (clip.activeFade) { clearInterval(clip.activeFade); clip.activeFade = null; }
        if (clip.actionTimer) { clearTimeout(clip.actionTimer); clip.actionTimer = null; }
        if (loop && activeLoop) { cancelAnimationFrame(activeLoop); activeLoop = null; }

        const m = (type === 'music') ? getMusicMultiplier() : getSFXMultiplier();
        clip.volume = Math.min(Math.max(volume * m, 0), 1);
        clip.loop = false;

        if (loop) {
            currentlyPlayingId = id;
            const checkTime = () => {
                if (currentlyPlayingId !== id) return;
                if (clip.currentTime >= (clip.duration - endCrop)) {
                    clip.currentTime = startCrop;
                }
                activeLoop = requestAnimationFrame(checkTime);
            };
            clip.currentTime = startCrop;
            clip.play();
            activeLoop = requestAnimationFrame(checkTime);
        } else {
            clip.currentTime = startCrop;
            clip.play();
            const playDuration = (clip.duration - startCrop - endCrop) * 1000;
            if (playDuration > 0) {
                clip.actionTimer = setTimeout(() => {
                    clip.pause();
                    clip.currentTime = startCrop;
                }, playDuration);
            }
        }
    }
    // 2. FALLBACK TO RAW SFX (For things that don't have clips)
    else if (sfx[id]) {
        const entry = sfx[id];
        const m = getSFXMultiplier();

        // Reset and play immediately (simple logic)
        entry.audio.volume = Math.min(Math.max(entry.baseVol * m, 0), 1);
        entry.audio.currentTime = 0;
        entry.audio.play();
    }
}

function stopAllAudio() {
    // 1. Stop the looping heartbeat (requestAnimationFrame)
    if (activeLoop) {
        cancelAnimationFrame(activeLoop);
        activeLoop = null;
    }

    // 2. Pause the actual audio clip that was playing
    if (currentlyPlayingId) {
        const data = pageSounds[currentlyPlayingId];
        if (data && data.clip) {
            data.clip.pause();
            data.clip.currentTime = 0; // Reset to start
        }
        currentlyPlayingId = null; // Clear the tracker
    }

    // 3. Clear any one-shot timers (like your unlock/swipe sounds)
    // You can loop through your registry and clear all .actionTimer if needed
}

function stopSound(pageId, fadeDuration = 50) {
    const soundData = pageSounds[pageId];
    if (!soundData || !soundData.clip) return;

    const audio = soundData.clip;
    const startVol = audio.volume;
    const steps = 20;
    const interval = fadeDuration / steps;
    let currentStep = 0;

    // 1. Start a fade timer
    audio.activeFade = setInterval(() => {
        currentStep++;

        // Gradually decrease volume
        audio.volume = Math.max(0, startVol * (1 - currentStep / steps));

        // 2. Once silent, kill everything
        if (currentStep >= steps) {
            clearInterval(audio.activeFade);
            audio.pause();
            audio.currentTime = 0;

            // DISCREPANCY FIX: You must nullify the loop heartbeat
            // or it will try to play again even after the fade.
            if (activeLoop) {
                cancelAnimationFrame(activeLoop);
                activeLoop = null;
            }
        }
    }, interval);
}

// ----- 3. CORE FUNCTIONS ----
// Replace your old getDestination with this:
function getDestination(direction, pageId) {
    return roomLeads[pageId]?.[direction] || null;
}

let lastPage = null; //tracks prev page

async function showPage(pageId) {
    const target = document.getElementById(pageId);
    if (!target) return;

    const previousPageId = lastPage ? lastPage.id : null;

    // ONLY hide the last page we were on
    if (lastPage) {
        lastPage.classList.add('hidden');
    } else {
        allPages.forEach(p => p.classList.add('hidden'));
    }
    target.classList.remove('hidden');
    lastPage = target;

    // AUTO-HIDE ARROWS: If the roomLeads data doesn't have a path, hide the arrow
    // This 0ms timeout breaks the "Long Task" and lowers INP
    setTimeout(() => {
        const currentPaths = roomLeads[pageId] || {};

        // Toggle ALL arrows based on the new room's paths
        arrows.back.classList.toggle('hidden', !currentPaths.back);
        arrows.forward.classList.toggle('hidden', !currentPaths.forward);
        arrows.left.classList.toggle('hidden', !currentPaths.left);
        arrows.right.classList.toggle('hidden', !currentPaths.right);

        updateMap(pageId);
        preloadWholeRoom(pageId);

        // Run the notification without 'await' to keep the frame rate high
        triggerNotification(pageId);
        if (previousPageId) {
            stopSound(previousPageId);
        }
        triggerSound(pageId);
    }, 0);
}

function preloadWholeRoom(pageId) {
    // 1. Figure out the "prefix" (e.g., 'camr', 'li', 'mh-bd')
    // This splits the ID at the first dash and takes the first part
    const prefix = pageId.split('-')[0];

    // 2. Find all images that belong to this room
    // This looks for any ID that starts with your prefix (e.g., id^="camr")
    const roomImages = document.querySelectorAll(`[id^="${prefix}-"] img, img[id^="${prefix}-"]`);

    roomImages.forEach(img => {
        if (img.getAttribute('loading') === 'lazy') {
            img.removeAttribute('loading');
            // Setting the src to itself tells the browser: "Download this NOW."
            img.src = img.src;
        }
    });
}

function warmUpGame() {
    console.log("Warming up entry pages...");
    entryPages.forEach(pageId => {
        const container = document.getElementById(pageId);
        if (container) {
            const img = container.tagName === 'IMG' ? container : container.querySelector('img');
            if (img) {
                img.removeAttribute('loading');
                img.fetchPriority = "high";
                // Setting src to itself forces the "lazy" status to break
                img.src = img.src;
            }
        }
    });
}

async function triggerNotification(pageId) {
    //spawn textbox when certain page is shown !
    switch (pageId) {
        case 'camr-main-wp-page': {
            await delay(20);
            document.getElementById('camr-main-wp-ml-hitbox').classList.add('hidden');
            document.getElementById('camr-main-wp-mr-hitbox').classList.add('hidden');
            document.getElementById('master-back-arrow').classList.add('hidden');

            // Trigger the initial window notification once
            if (!state.notificationsSeen['wp-init']) {
                await spawnThemedBox("What's that in the window ??", "notification-top");
                state.notificationsSeen['wp-init'] = true;
            }

            state.foundWp = true;
        } break;

        case 'camr-main-page': {
            // Triggered only if you've found the WP, but haven't seen this specific text
            if (state.foundWp && !state.notificationsSeen['wp-gone']) {
                await spawnThemedBox("They're gone!", "notification-top");
                state.notificationsSeen['wp-gone'] = true;
            }
        } break;

        case 'camr-main-ml-on-person-page': {
            // Using the pageId itself as the label for the first-time visit
            if (!state.notificationsSeen['camr-main-ml-on-person-init']) {
                await spawnThemedBox("Wait, there's something in the camera feed", "notification-top");
                state.notificationsSeen['camr-main-ml-on-person-init'] = true;
            }
        } break;

        ///this is not a notification but needed this logic for it
        case 'li-main-rw-page': {
            // Functional logic for the hitbox remains the same
            if (!state.scannedBook || !state.hasSherlockBook) {
                document.getElementById('li-main-rw-animals-hitbox').classList.add('hidden');
            } else {
                document.getElementById('li-main-rw-animals-hitbox').classList.remove('hidden');
            }
        } break;

        case 'mh-bd-main-page': {
            await delay(20);
            if (!state.notificationsSeen['mh-bd-main-init']) {
                await spawnThemedBox("Wait, what? Where am I ?", "notification-top");
                state.notificationsSeen['mh-bd-main-init'] = true;
            }
        } break;
        // case 'bd-door-open-page': {
        //     await delay(20);
        //     if (!state.notificationsSeen['bd-door-open-init']) {
        //         await spawnThemedBox('Another room.... I wonder what\'s behind that back door', "notification-top");
        //         state.notificationsSeen['bd-door-open-init'] = true;
        //     }
        // } break; fixme may remove this
        case 'pr-wr-box-page': {
            await delay(20);
            if (!state.notificationsSeen['pr-wr-box-init']) {
                await spawnThemedBox("These wires aren't in the right places.", "notification-top");
                state.notificationsSeen['pr-wr-box-init'] = true;
            }
        } break;
        case 'li-lt-sk-paper-page': {
            await delay(20);
            if (!state.notificationsSeen['li-lt-sk-paper-init']) {
                await spawnThemedBox('AH ! Where did that skeleton come from ?!?', "notification-top");
                state.notificationsSeen['li-lt-sk-paper-init'] = true;
            }
        }break;
        case 'clr-main-page': {
            await delay(20);
            if (!state.notificationsSeen['clr-main-init']) {
                await spawnThemedBox("That person from the camera feed, they're not here", "notification-top");
                await spawnThemedBox("Something's wrong with this place", "notification-top");
                await spawnThemedBox("Also what the heck ! What's with that giant ID card ??", "notification-top");
                state.notificationsSeen['clr-main-init'] = true;
            }
        } break;
        case 'ls-in-10-sk-nd-page': {
            await delay(20);
            if (!state.notificationsSeen['ls-in-10-sk-init']) {
                await spawnThemedBox("It's that skeleton again...", "notification-top");
                state.notificationsSeen['ls-in-10-sk-init'] = true;
            }
        }break;
        case 'lo-monitor-page': {
            document.getElementById('lo-monitor-drive-hitbox').classList.add('hidden');
        }break;
        case 'bath-page': {
            await delay(20);
            if (!state.notificationsSeen['bath-init']) {
                await spawnThemedBox("This bathroom looks straight out of the 1950s", "notification-top");
                state.notificationsSeen['bath-init'] = true;
            }
        } break;
        case 'ls-archives-sk-page': {
            state.foundArchives = true;
        }

    }
}

function goBack()    { move('back'); }
function goForward() { move('forward'); }
function goLeft()    { move('left'); }
function goRight()   { move('right'); }

function move(dir) {
    const current = Array.from(allPages).find(p => !p.classList.contains('hidden'));
    if (!current) return;

    const roomData = roomLeads[current.id];
    let dest = getDestination(dir, current.id);

    // 1. Check for transition audio before moving
    // It looks for roomLeads[current.id].audio[dir]
    if (roomData && roomData.audio && roomData.audio[dir]) {
        triggerSound(roomData.audio[dir]);
    }

    // 2. Resolve destination
    if (typeof dest === 'function') {
        dest = dest();
    }

    // 3. Navigate
    if (dest) showPage(dest);
}

//this function makes it look like the lights in the room flicker
function triggerFlicker(elementId) {
    const el = document.getElementById(elementId);
    if (!el) {
        console.error("Flicker Error: Element ID '" + elementId + "' not found.");
        return;
    }

    // Ensure we add the class that matches your CSS
    el.classList.add('flicker-dark');

    setTimeout(() => {
        el.classList.remove('flicker-dark');
    }, 600);
}

// ---------- HINT SYSTEM LOGIC ------------
const hintRules = [
    {
        condition: () => !state.bdUnlocked && !state.hasBdKey,
        text: "Try looking in the book drop"
    },
    {
        condition: () => !state.bdUnlocked && state.hasBdKey,
        text: "They key you're holding opens the book drop door. Make sure to click on the keyhole to unlock the door before opening it by clicking on the handle"
    },
    {
        condition: () => state.bdUnlocked && !state.bdBackDoorUnlocked && !state.hasPrKey,
        text: "Try looking in the book depository in the book drop room"
    },
    {
        condition: () => !state.bdBackDoorUnlocked && state.hasPrKey,
        text: "The key you're holding opens the door in the book drop room. Don't forget to click on the keyhole to unlock the door before opening it"
    },
    {
        condition: () => state.bdBackDoorUnlocked && !state.solvedWirePuzzle,
        text: "Try inspecting the back section with all the wires in the projector room"
    },
    {
        condition: () => state.solvedWirePuzzle && !state.isProjectorOn,
        text: "Try inspecting the projector. Maybe it can be turned on now that you've fixed the wires."
    },
    {
        condition: () => state.solvedWirePuzzle && !state.hasPwBook && state.isProjectorOn,
        text: "Look around in the projector room for a collectible item"
    },
    {
        condition: () => !state.kiUnlocked && !state.hasKiKey,
        text: "Try inspecting the book in your inventory. Click on an inventory item to inspect it closer."
    },
    {
        condition: () => !state.kiUnlocked && state.hasKiKey,
        text: "The key you're holding unlocks the kitchen door in the main hallway. Don't forget to unlock the door before opening it."
    },
    {
        condition: () => state.kiUnlocked && !state.foundPtCode,
        text: "Try looking around in the kitchen for a clue"
    },
    {
        condition: () => state.foundPtCode && !state.crUnlocked, //fixme add check for if they found back hallway
        text: "Try looking around the back hallway for a door you can unlock. The code from the kitchen may be useful there."
    },
    {
        condition: () => state.crUnlocked && !state.hasCamrKey,
        text: "Try looking around in the creepy room for a key."
    },
    {
        condition: () => !state.camrUnlocked && state.hasCamrKey,
        text: "The key you're holding unlocks a door in the creepy room."
    },
    {
        condition: () => state.camrUnlocked && !state.wonWordle && !state.isLeftMonitorOn && !state.foundWordle,
        text: "Try looking closer at the right monitor in the camera room"
    },
    {
        condition: () => !state.wonWordle && !state.isLeftMonitorOn && state.foundWordle,
        text: "You'll need to solve the wordle to continue." //fixme add an option to skip the wordle
    },
    {
        condition: () => state.wonWordle && !state.isLeftMonitorOn && !state.foundMl,
        text: "Try looking closer at the left monitor in the camera room"
    },
    {
        condition: () => state.wonWordle && !state.isLeftMonitorOn && state.foundMl,
        text: "For the left monitor in the camera room, the password is 5 letters, and so is the wordle..."
    },
    {
        condition: () => state.isLeftMonitorOn && !state.hasClrKey,
        text: "Make sure you check every corner of the c-wing. There may be something useful hiding for you there."
    },
    {
        condition: () => state.isLeftMonitorOn && state.hasClrKey && !state.crlDoorOpen,
        text: "The key you're holding opens a door in the creepy room"
    },
    {
        condition: () => state.hasClrKey && !state.crlDoorOpen,
        text: "The key you're holding opens a door in the creepy room"
    },
    {
        condition: () => state.crlDoorOpen && !state.foundOctagon,
        text: "Try inspecting the cloth in the counseling room"
    },
    {
        condition: () => state.foundOctagon && !state.hasWrId,
        text: "The ID in the counseling room may be useful"
    },
    {
        condition: () => state.hasWrId && !state.wrUnlocked,
        text: "You may be able to unlock the room in the c-wing with the ID you're holding"
    },
    {
        condition: () => state.wrUnlocked && !state.hasLiKey,
        text: "Look around in the classroom for a key"
    },
    {
        condition: () => state.hasLiKey && !state.foundWrNote && !state.liUnlocked,
        text: "There may be some more things to find in the classroom, or you can search the main hall for a new room to unlock"
    },
    {
        condition: () => state.hasLiKey && state.foundWrNote && !state.liUnlocked,
        text: "The key you're holding unlocks the door next to the book drop in the main hall"
    },
    {
        condition: () => state.liUnlocked && !state.isLiTvOn && !state.hasBr,
        text: "Try searching near the tv for a new item"
    },
    {
        condition: () => state.liUnlocked && state.hasBr && !state.isLiTvOn,
        text: "The remote you're holding looks a lot like a tv remote. Maybe it will work on the tv"
    },
    {
        condition: () => state.isLiTvOn && !state.hasWr,
        text: "There's another remote near the tv that may be useful"
    },
    {
        condition: () => state.isLiTvOn && state.hasWr && !state.isLiReadOn,
        text: "The READ sign in the library looks like it can be turned on with the remote you're holding"
    },
    {
        condition: () => state.isLiTvOn && state.isLiReadOn && !state.foundScanner,
        text: "Look around the library for a hint"
    },
    {
        condition: () => state.isLiTvOn && state.isLiReadOn && state.foundScanner && !state.hasLorBook,
        text: "Search the walls in the library and inspect each book. You need to find the Lord of the Rings book"
    },
    {
        condition: () => state.isLiTvOn && state.isLiReadOn && state.hasLorBook && !state.scannedBook,
        text: "Try scanning the Lord of the Rings book with the scanner near the laptop"
    },
    {
        condition: () => state.scannedBook && !state.hasSkPaper,
        text: "Look around the library again for a hint"
    },
    {
        condition: () => state.hasSkPaper && !state.hasLoKey && !state.hasSherlockBook,
        text: "Maybe the piece of paper can be used on a book in the room. Look around the shelves for a book that you can collect."
    },
    {
        condition: () => state.hasSkPaper && !state.hasLoKey && state.hasSherlockBook && !state.foundLiClue,
        text: "Try using the paper on the bookmarked page of the book you collected. Make sure to inspect the book first, then use the paper"
    },
    {
        condition: () => state.foundLiClue && !state.hasLoKey,
        text: "\"under animals\"-- maybe you should search under the stuffed animals in the library"
    },
    {
        condition: () => state.hasLoKey && !state.loUnlocked,
        text: "The key you're holding unlocks the office at the back of the library"
    },
    {
        condition: () => state.loUnlocked && !state.loMonitorUnlocked && !state.foundLoMonitor,
        text: "Try inspecting the monitor in the library office"
    },
    {
        condition: () => state.foundLoMonitor && !state.loMonitorUnlocked && (!state.isProjectorOn || !state.isLiTvOn || !state.isLiLaptopOn || !state.foundOctagon),
        text: "The key to the library monitor is 4 digits, all numbers. Throughout the map are scattered 4 shapes. Find them all to solve the puzzle"
    },
    {
        condition: () => state.foundLoMonitor && !state.loMonitorUnlocked && (state.isProjectorOn && state.isLiTvOn && state.isLiLaptopOn && state.foundOctagon) && !state.isLiReadOn,
        text: "Each shape has a certain number of vertices and a color. You'll need to find a clue to what the order of the colors is to determine the library office monitor code. Try finding a remote and turning on the READ sign in the library"
    },
    {
        condition: () => state.foundLoMonitor && !state.loMonitorUnlocked && (state.isProjectorOn && state.isLiTvOn && state.isLiLaptopOn && state.foundOctagon) && state.isLiReadOn,
        text: "You hold all pieces to the library monitor code, you need simply to connect them. Each shape has a certain number of vertices. For example, a square has 4. The READ sign indicates the order in which these numbers should be typed in as the code"
    },
    {
        condition: () => state.loMonitorUnlocked && !state.hasLs10drive,
        text: "You need a usb drive. Look around the library storage area to see if you can find one."
    },
    {
        condition: () => state.hasLs10drive && !state.usedDrive,
        text: "Try using the drive on the library office monitor"
    },
    {
        condition: () => state.usedDrive && !state.foundArchives,
        text: "You'll need to inspect the archives to determine the final code for the library office monitor. They are located in the library storage area"
    },
    {
        condition: () => state.foundArchives && !state.hatchOpen,
        text: "The final code is hidden in the archives. Use the sticky note to determine the correct order. Inspect each thesis, and note the last two digits of each publication date. Input those numbers in the order indicated on the sticky note."
    },
    {
        condition: () => state.hatchOpen,
        text: "Look around for the exit hatch to escape through the tunnels!"
    },
    //fixme bug check for if progression is completed out of order





    {
        // Default hint (always keep at the bottom)
        condition: () => true,
        text: "ERROR: No hints available right now."
    }
];

function getCurrentHint() {
    // .find() stops at the first object where the condition returns true
    const match = hintRules.find(rule => rule.condition());
    return match ? match.text : "No hints available.";
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

function refreshInventorySlots() {
    const content = document.getElementById('inventory-content');
    const items = content.querySelectorAll('.inv-item:not(.empty)');
    const emptySlots = content.querySelectorAll('.inv-item.empty');

    // Count how many real items are currently visible (not hidden)
    let visibleItemsCount = 0;
    items.forEach(item => {
        if (!item.classList.contains('hidden')) {
            visibleItemsCount++;
        }
    });

    // Let's say your inventory capacity is 8
    const maxCapacity = 8;
    const neededEmptySlots = maxCapacity - visibleItemsCount;

    // Show or hide empty slots based on remaining space
    emptySlots.forEach((slot, index) => {
        if (index < neededEmptySlots) {
            slot.classList.remove('hidden'); // Show this empty box
        } else {
            slot.classList.add('hidden');    // Hide this empty box
        }
    });
}

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

//------- WORDLE STUFF ------ //

//word bank for the wordle
const WORD_BANK = [
    "APPLE","BEACH","BREAD","BRUSH","CANDY","CHESS","CLEAN","DANCE","DREAM","DRIVE",
    "EARTH","FEAST","FIELD","FRUIT","GRAPE","GREEN","HAPPY","HEART","HOUSE","JUICE",
    "LEMON","LUNCH","MONEY","OCEAN","PARTY","PEACE","PIZZA","RIVER","SLEEP","SMILE",
    "SNACK","SOUTH","SPOON","STARS","STUDY","SUNNY","SWEET","TIGER","TOAST","TOUCH",
    "TRAIN","TRUCK","TULIP","WATER","WHALE","WORLD","WRITE","YOUTH","ZEBRA",

    "ABOVE","ADULT","AFTER","AGREE","ALIVE","ALLOW","AMONG","ANGRY","APPLY","ARENA",
    "ARISE","ARMOR","ASIDE","ASSET","AUDIO","AWFUL","BASIC","BASIN","BEGIN","BELOW",
    "BENCH","BIRTH","BLACK","BLANK","BLAST","BLEND","BLOCK","BOARD","BOATS","BONUS",
    "BRAIN","BRAVE","BREAK","BRIEF","BRING","BROKE","BUILD","BUILT","BURNT","CABLE",
    "CLAMS","CAMEL","CANAL","CARDS","CARRY","CATCH","CAUSE","CHAIN","CHAIR","CHART",
    "CHECK","CHEEK","CHEST","CHIEF","CHILD","CHOIR","CIVIL","CLAIM","CLASS","CLEAR",
    "CLIMB","CLOCK","CLOSE","CLOTH","CLOUD","COACH","COAST","COLOR","COMIC","COUNT",
    "COURT","COVER","CRAFT","CRANE","CREAM","CRIME","CROSS","CROWD","CROWN","CRUSH",
    "CURVE","DAILY","DATES","DEALT","DELAY","DELTA","DEPTH","DIARY","DIGIT","DIRTY",
    "DRINK","DRONE","DROWN","DRUMS","DUSTY","EAGER","EARLY","EIGHT","ELBOW","ELITE",
    "EMPTY","ENEMY","ENJOY","ENTER","EQUAL","EVENT","EVERY","EXACT","EXIST","EXTRA",
    "FAITH","FALSE","FAULT","FAVOR","FENCE","FIFTH","FIFTY","FIGHT","FINAL","FIRST",
    "FIXED","FLAME","FLASH","FLEET","FLOAT","FLOOD","FLOOR","FLOUR","FLUTE","FOCUS",
    "FORGE","FORMS","FORTH","FORTY","FOUND","FRAME","FRESH","FRONT","FROST","FUNNY",
    "GIANT","GIVEN","GLASS","GLOVE","GOING","GRACE","GRADE","GRAIN","GRAND","GRANT",
    "GRASS","GREAT","GREET","GROUP","GUARD","GUESS","GUIDE","HABIT","HANDS","HEAVY",
    "HELLO","HILLS","HONEY","HOTEL","HUMAN","IDEAL","IMAGE","INDEX","INNER","INPUT",
    "ISSUE","ITEMS","JOINT","JUDGE","KNIFE","KNOCK","LABEL","LABOR","LAKES","LARGE",
    "LASER","LATER","LAUGH","LAYER","LEADS","LEARN","LEASE","LEAST","LEAVE","LEGAL",
    "LEVEL","LIGHT","LIMIT","LINKS","LIVES","LOCAL","LOGIC","LUCKY","MAGIC","MAJOR",
    "MAKER","MARCH","MATCH","MAYBE","MEDIA","METAL","MIGHT","MINOR","MODEL","MONTH",
    "MORAL","MOTOR","MOUNT","MOUTH","MOVIE","MUSIC","NEEDS","NEVER","NIGHT","NOISE",
    "NORTH","NOTES","NOVEL","NURSE","OFFER","OFTEN","ORDER","OTHER","OWNER","PANEL",
    "PAPER","PARTY","PEACE","PHONE","PHOTO","PIANO","PILOT","PITCH","PLACE","PLAIN",
    "PLANE","PLANT","PLATE","POINT","POUND","POWER","PRESS","PRICE","PRIDE","PRIZE",
    "PROOF","PROUD","QUEEN","QUICK","QUIET","QUITE","RADIO","RAISE","RANGE","RAPID",
    "RATIO","REACH","READY","RELAX","REPLY","RESET","RIGHT","ROBOT","ROCKY","ROUGH",
    "ROUND","ROUTE","ROYAL","RURAL","SCALE","SCENE","SCOPE","SCORE","SENSE","SERVE",
    "SHAKE","SHARE","SHARP","SHEET","SHELF","SHIFT","SHINE","SHIRT","SHOCK","SHORE",
    "SHORT","SHOUT","SIGHT","SINCE","SKILL","SLIDE","SMALL","SMITH","SMOKE","SOLID",
    "SOLVE","SOUND","SPACE","SPEAK","SPEED","SPEND","SPICE","SPORT","STAGE","STAIR",
    "STAKE","STAND","START","STATE","STEAM","STEEL","STICK","STILL","STOCK","STONE",
    "STOOD","STORE","STORM","STORY","STRIP","STUCK","STYLE","SUGAR","SUITE","SUPER",
    "TAKEN","TASTE","TAXES","TEACH","TEETH","TERMS","THANK","THEFT","THEIR","THEME",
    "THERE","THESE","THICK","THING","THINK","THIRD","THOSE","THREE","THROW","TIGHT",
    "TIMES","TIRED","TITLE","TODAY","TOKEN","TOTAL","TOUGH","TOWER","TRACK","TRADE",
    "TREAT","TREND","TRIAL","TRIBE","TRICK","TRUST","TRUTH","TWICE","UNDER","UNITS",
    "UNTIL","UPPER","UPSET","URBAN","USAGE","USUAL","VALID","VALUE","VIDEO","VIRUS",
    "VISIT","VITAL","VOICE","WASTE","WATCH","WHEEL","WHERE","WHICH","WHILE","WHITE",
    "WHOLE","WOMAN","WORRY","WORTH","WRONG", "GHOST"
];

let targetWord = "";
let currentGuessCount = 0;
let isGameOver = false;

function startWordle(onWinCallback) {
    // Reset and pick a new word
    targetWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)].toUpperCase();
    currentGuessCount = 0;
    isGameOver = false;

    const container = document.getElementById('wordle-minigame');
    container.classList.remove('hidden');

    container.innerHTML = `
        <div id="wordle-ui-wrapper" style="text-align:center;">
            <h2 style="color:#4a9eff; font-family:monospace;">SYSTEM OVERRIDE</h2>
            <div class="wordle-grid" id="wordle-grid" style="display:grid; grid-template-columns:repeat(5, 50px); gap:8px; justify-content:center; margin-bottom:15px;"></div>
            <input type="text" maxlength="5" id="wordle-input" placeholder="KEYWORD..." autocomplete="off" style="width:250px; padding:10px; background:#1a1a1a; border:1px solid #4a9eff; color:white; text-align:center; font-size:1.2rem;">
            <div style="margin-top:15px;">
                <button onclick="closeWordle()" style="background:#333; color:#aaa; border:none; padding:5px 15px; cursor:pointer; font-size:0.8rem;">ABORT</button>
            </div>
        </div>
    `;

    const grid = document.getElementById('wordle-grid');
    for(let i = 0; i < 30; i++) {
        const tile = document.createElement('div');
        tile.className = 'wordle-tile';
        tile.id = `tile-${i}`;
        // CSS for tile
        Object.assign(tile.style, {
            width: '50px', height: '50px', border: '2px solid #3a3a3c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 'bold', color: 'white', textTransform: 'uppercase'
        });
        grid.appendChild(tile);
    }

    const input = document.getElementById('wordle-input');
    input.focus();

    input.addEventListener('keydown', (e) => {
        if (isGameOver) return;

        if (e.key === "Enter") {
            const currentGuess = input.value.toUpperCase();

            // 1. Check if it's 5 letters
            if (currentGuess.length !== 5) {
                triggerInputError(input);
                return;
            }

            // 2. THE WORD LIST CHECK:
            // This checks if the typed word exists anywhere in your WORD_BANK array
            if (!WORD_BANK.includes(currentGuess)) {
                //fixme idk something was wrong here w the second line, bug check this shouldn't be themed box for that feedback
                //spawnThemedBox("NOT IN WORD LIST", "notification-top"); // Use your existing notification system
                triggerInputError(input);
                return;
            }

            // 3. If it passes both, process the guess
            processGuess(currentGuess, onWinCallback);
            input.value = "";
        }
    });

    // Helper function to show the player the word was rejected
    function triggerInputError(inputEl) {
        inputEl.style.borderColor = "#ff4a4a"; // Red flash
        inputEl.style.transform = "translateX(5px)"; // Tiny shake
        setTimeout(() => {
            inputEl.style.borderColor = "#4a9eff";
            inputEl.style.transform = "translateX(0)";
        }, 200);
    }
}

function processGuess(guess, onWin) {
    const startIdx = currentGuessCount * 5;
    const guessArr = guess.split("");
    const targetArr = targetWord.split("");
    let targetCopy = [...targetArr];

    // Pass 1: Greens (Correct)
    guessArr.forEach((letter, i) => {
        const tile = document.getElementById(`tile-${startIdx + i}`);
        tile.textContent = letter;
        if (letter === targetArr[i]) {
            tile.classList.add('correct');
            targetCopy[i] = null;
        }
    });

    // Pass 2: Yellows/Grays
    guessArr.forEach((letter, i) => {
        const tile = document.getElementById(`tile-${startIdx + i}`);
        if (!tile.classList.contains('correct')) {
            const matchIndex = targetCopy.indexOf(letter);
            if (matchIndex > -1) {
                tile.classList.add('present');
                targetCopy[matchIndex] = null;
            } else {
                tile.classList.add('absent');
            }
        }
    });

    if (guess === targetWord) {
        isGameOver = true;
        // Save the win data to your state
        state.wonWordle = true;
        state.savedKey = targetWord;

        setTimeout(() => {
            showSuccessUI(); // Show the success screen inside the terminal
            onWin();         // Still run your callback for game logic (unlocking doors, etc.)
        }, 600);
    } else {
        currentGuessCount++;
        // --- FAILURE STATE (Hidden Answer) ---
        if (currentGuessCount >= 6) {
            isGameOver = true;
            showFailureUI(onWin); // We pass the win callback so the new game knows what the prize is
        }
    }
}

function showFailureUI(onWin) {
    const wrapper = document.getElementById('wordle-ui-wrapper');
    const input = document.getElementById('wordle-input');

    // Hide the input box so they stop typing
    if (input) input.style.display = 'none';

    const failMenu = document.createElement('div');
    failMenu.innerHTML = `
        <div style="margin-top: 20px; border-top: 1px solid #ff4a4a; padding-top: 15px;">
            <p style="color: #ff4a4a; font-weight: bold; margin-bottom: 15px;">
                [ERROR] UNAUTHORIZED ACCESS DETECTED
            </p>
            <button id="retry-btn" style="background: #4a9eff; color: white; border: none; padding: 12px 25px; cursor: pointer; font-family: monospace; font-weight: bold; letter-spacing: 1px;">
                REBOOT TERMINAL
            </button>
        </div>
    `;
    wrapper.appendChild(failMenu);

    // Clicking REBOOT calls startWordle again, which clears the board and picks a NEW word
    document.getElementById('retry-btn').onclick = () => {
        startWordle(onWin);
    };
}

function showSuccessUI() {
    const wrapper = document.getElementById('wordle-ui-wrapper');
    const input = document.getElementById('wordle-input');

    // Hide the input box
    if (input) input.style.display = 'none';

    // Create the success message
    const successMenu = document.createElement('div');
    successMenu.innerHTML = `
        <div style="margin-top: 20px; border-top: 1px solid #538d4e; padding-top: 15px;">
            <p style="color: #538d4e; font-weight: bold; margin-bottom: 5px;">
                [SUCCESS] ENCRYPTION BYPASSED
            </p>
            <p style="color: #aaa; font-family: monospace; font-size: 0.9rem; margin-bottom: 15px;">
                KEYWORD OBTAINED: <span style="color: white; letter-spacing: 2px; font-size: 1.1rem;">${state.savedKey}</span>
            </p>
            <button onclick="closeWordle()" style="background: #538d4e; color: white; border: none; padding: 10px 20px; cursor: pointer; font-family: monospace; font-weight: bold;">
                EXIT TERMINAL
            </button>
        </div>
    `;
    wrapper.appendChild(successMenu);
}

function closeWordle() {
    // 1. Hide the Wordle overlay
    document.getElementById('wordle-minigame').classList.add('hidden');

    // 2. Bring back the Back Arrow
    const backArrow = document.getElementById('master-back-arrow');
    if (backArrow) {
        backArrow.style.visibility = 'visible';
        backArrow.style.pointerEvents = 'auto';
    }

    // 3. Bring back the Monitor Hitbox
    const hitbox = document.getElementById('camr-mr-off-hitbox');
    if (hitbox) {
        hitbox.style.display = 'block';
    }
}

// ------ FINAL PUZZLE INITIAL LOGIN PIN SECTION ----

const termPage = document.getElementById('terminal-login-page');
const termInput = document.getElementById('terminal-input');
const termFeedback = document.getElementById('terminal-feedback');
const loginHeader = document.querySelector('#terminal-window .terminal-content div:first-child');

// Called when clicking the monitor hitbox
function openTerminal() {
    termPage.classList.remove('hidden');
    document.getElementById('lo-monitor-hitbox').classList.add('hidden');

    if (state.usedDrive) {
        document.getElementById('lo-monitor-drive-monitor-hitbox').classList.add('hidden');
        termInput.style.display = "none";
        if (loginHeader) loginHeader.style.display = "none";
        termFeedback.style.display = "none";

        const finalError = document.getElementById('final-error-feedback');
        if (finalError) finalError.innerText = "";

        document.getElementById('final-auth-section').classList.remove('hidden');
        setTimeout(() => document.getElementById('final-terminal-input').focus(), 10);
        return; // Don't run the rest of the function
    } else if (state.loMonitorUnlocked) {
        termInput.style.display = "none";
        if (loginHeader) loginHeader.style.display = "none";

        // Match the large font size here too
        termFeedback.style.fontSize = "1.8rem";
        termFeedback.style.color = "#00ff41";
        termFeedback.innerHTML = "ACCESS GRANTED.<br>INSERT FLASH DRIVE TO CONTINUE";
        document.getElementById('lo-monitor-drive-hitbox').classList.remove('hidden');
    } else {
        termInput.style.display = "block";
        if (loginHeader) loginHeader.style.display = "block";
        // Reset font size for typing mode
        termFeedback.style.fontSize = "1.2rem";
        termInput.value = "";
        termFeedback.innerText = "";
        setTimeout(() => termInput.focus(), 10);
    }
}

function closeTerminal() {
    // 1. Hide the terminal
    termPage.classList.add('hidden');

    // 2. Re-enable the monitor hitbox
    if (state.usedDrive) {
        document.getElementById('lo-monitor-drive-hitbox').classList.remove('hidden');
    } else {
        document.getElementById('lo-monitor-hitbox').classList.remove('hidden');
        document.getElementById('lo-monitor-drive-hitbox').classList.add('hidden');
    }
}

termInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const feedback = document.getElementById('terminal-feedback');
        const header = document.getElementById('auth-header');
        const prompt = document.getElementById('pin-prompt');

        if (termInput.value === "8450") {
            state.loMonitorUnlocked = true;

            // 1. Make the success text significantly larger
            feedback.style.fontSize = "1.8rem";
            feedback.style.color = "#00ff41";
            feedback.innerHTML = "ACCESS GRANTED.<br>INSERT FLASH DRIVE TO CONTINUE";
            document.getElementById('lo-monitor-drive-hitbox').classList.remove('hidden');

            // 2. Hide everything else
            termInput.style.display = "none";
            if (header) header.style.display = "none";
            if (prompt) prompt.style.display = "none";
            if (loginHeader) loginHeader.style.display = "none";

        } else {
            // Keep "Denied" text at a standard size
            feedback.style.fontSize = "1.2rem";
            feedback.innerText = "> ACCESS DENIED";
            feedback.style.color = "#ff4444";
            termInput.value = "";
        }
    }
});

// Ensure typing is always active while the overlay is up
termPage.addEventListener('click', (e) => {
    if (e.target.id !== 'terminal-close-btn') {
        // If the drive is used, focus the 8-digit box. Otherwise, the 4-digit box.
        if (state.usedDrive) {
            document.getElementById('final-terminal-input').focus();
        } else {
            termInput.focus();
        }
    }
});

async function useDrive() {
    if (state.hasLs10drive) {
        state.usedDrive = true;
        const keySlot = document.getElementById('inv-ls-drive');
        if (keySlot) {
            keySlot.classList.add('hidden');
            refreshInventorySlots();
        }
        showPage('lo-monitor-drive-page');
        document.getElementById('lo-monitor-drive-monitor-hitbox').classList.add('hidden');

        // 1. Hide EVERYTHING from the previous stage
        termFeedback.style.display = "none";
        termInput.style.display = "none";
        if (loginHeader) loginHeader.style.display = "none";

        // Add these two lines to clear the old prompts
        if (document.getElementById('auth-header')) document.getElementById('auth-header').style.display = "none";
        if (document.getElementById('pin-prompt')) document.getElementById('pin-prompt').style.display = "none";

        document.getElementById('lo-monitor-drive-hitbox').classList.add('hidden');

        // 2. Show the final 8-digit section
        const finalSection = document.getElementById('final-auth-section');
        const finalInput = document.getElementById('final-terminal-input');

        finalSection.classList.remove('hidden');
        // Force it to display as a block/flex since 'hidden' usually sets display:none
        finalSection.style.display = "block";

        setTimeout(() => finalInput.focus(), 50);
    } else {
        await spawnThemedBox("I guess I should look around this area for a flash drive", "notification-top");
    }
}

const finalInput = document.getElementById('final-terminal-input');
const finalError = document.getElementById('final-error-feedback');

// 1. Only allow numbers to be typed
finalInput.addEventListener('input', (e) => {
    // Replaces anything that isn't 0-9 with an empty string
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// 2. Handle the Enter key
finalInput.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
        if (finalInput.value === "97939394") {
            console.log("PIN Correct! Starting flicker..."); // Debugging check
            finalInput.disabled = true;
            finalError.style.color = "#00ff41";
            finalError.innerText = "ACCESS GRANTED. DECRYPTING...";

            await delay(500);
            playHatchSequence();
            setTimeout(() => {
                // Flickering the page container
                triggerFlicker('lo-monitor-drive-page');

                // ALSO flicker the terminal-login-page so the UI glitches too
                triggerFlicker('terminal-login-page');
            }, 700);

            state.hatchOpen = true;
            await delay(4000);
            await spawnThemedBox("What the heck was that ???", "notification-top");
        } else {
            finalError.innerText = "> INCORRECT AUTHORIZATION KEY";
            finalInput.value = "";
        }
    }
});


// ---- PRINTER SYNC MINIGAME ----
// --- Settings ---
const CONSTANT_SPEED = 3.0;
const totalLevels = 6; // UPDATED TO 6

// --- State ---
let currentLevel = 1;
let barPos = 0;
let barDir = 1;
let isRunning = true;
let lastPos = 0; // For "Smart Random"

let currentTarget = { pos: 0, width: 22 };

const monitor = document.getElementById('printer-monitor-area');
const bar = document.getElementById('scanner-bar');
const target = document.getElementById('static-target');

function generateRandomTarget() {
    // Scaling for 6 levels:
    // Level 1: 22% | Level 6: 7%
    const newWidth = 25 - (currentLevel * 3);

    const maxLeft = 100 - newWidth;
    let newPos;

    // SMART RANDOM: Forces the box to move significantly from the last spot
    let attempts = 0;
    do {
        newPos = Math.floor(Math.random() * maxLeft);
        attempts++;
    } while (Math.abs(newPos - lastPos) < 25 && attempts < 10);

    lastPos = newPos;
    currentTarget = { pos: newPos, width: newWidth };

    // Update the DOM elements
    const targetEl = document.getElementById('static-target');
    const levelEl = document.getElementById('level-num');

    if (targetEl) {
        targetEl.style.left = currentTarget.pos + "%";
        targetEl.style.width = currentTarget.width + "%";
    }
    if (levelEl) {
        levelEl.innerText = currentLevel;
    }
}

function update() {
    if (!isRunning) return;

    barPos += CONSTANT_SPEED * barDir;
    const maxPos = monitor.clientWidth - bar.clientWidth;

    if (barPos >= maxPos) { barPos = maxPos; barDir = -1; }
    else if (barPos <= 0) { barPos = 0; barDir = 1; }

    bar.style.left = barPos + "px";
    requestAnimationFrame(update);
}

function checkSync() {
    if (!isRunning) return;

    const containerWidth = monitor.clientWidth;
    const barMidPercent = ((barPos + (bar.clientWidth / 2)) / containerWidth) * 100;

    const targetStart = currentTarget.pos;
    const targetEnd = currentTarget.pos + currentTarget.width;

    if (barMidPercent >= targetStart && barMidPercent <= targetEnd) {
        currentLevel++;

        if (currentLevel > totalLevels) {
            win();
        } else {
            generateRandomTarget();
            flash("white");
        }
    } else {
        reset();
    }
}

function reset() {
    currentLevel = 1;
    generateRandomTarget();
    flash("red");
}

function win() {
    isRunning = false;
    document.getElementById('msg').innerText = "CALIBRATION SUCCESSFUL";
    document.getElementById('msg2').innerText = "PRINTING...";
    state.isPrinterCalibrated = true;
}

function flash(type) {
    if (type === "white") {
        monitor.style.borderColor = "white";
        setTimeout(() => monitor.style.borderColor = "#00ff00", 100);
    } else {
        monitor.style.backgroundColor = "rgba(255,0,0,0.5)";
        setTimeout(() => monitor.style.backgroundColor = "black", 150);
    }
}

function exitPrinterGame() {
    // 1. Kill the animation loop
    isRunning = false;

    // 2. FORCE hide the minigame specifically
    const minigame = document.getElementById('printer-sync-minigame');
    if (minigame) {
        minigame.classList.add('hidden');
    }

    // 3. Now show the room page
    // Note: Use 'print-screen-page' or 'print-page'—whichever matches your HTML
    showPage('print-screen-page');

    console.log("Minigame manually hidden and returning to room.");
}




// ------ creepy room keypad functionality  ------

// 2. THIS HANDLES THE TYPING (Keep this outside/separate)
async function inputKey(num) {
    triggerSound('keypadBeep');
    enteredCode += num;
    console.log("Input: " + enteredCode);

    if (enteredCode.length === 4) {
        if (enteredCode === "3672") {
            state.crUnlocked = true;
            await spawnThemedBox('It worked ! I should be able to open the door now', 'notification-top');
            // Go to the next room
        } else {
            await spawnThemedBox('It didn\'t work', 'notification-top'); //fixme feedback
            enteredCode = ""; // Reset to try again
        }
    }
}


// --------- LEFT MONITOR PASSWORD PAGE ------
function checkSecurityPass() {
    const input = document.getElementById('security-pass-input');
    const feedback = document.getElementById('security-feedback');
    const status = document.getElementById('status-text');

    const userAttempt = input.value.trim().toUpperCase();
    const correctKey = state.savedKey ? state.savedKey.toUpperCase() : "";

    // THIS IS THE "SUCCESS BLOCK" (The 'if' part)
    if (state.wonWordle && userAttempt === correctKey) {
        triggerSound('accessBeep');
        // 1. Show the "Authorizing" state immediately
        feedback.innerText = "AUTHORIZING...";
        feedback.style.color = "#26e600";
        status.innerText = "VERIFYING KEY...";

        // 2. Change status halfway through (at 1.2 seconds)
        setTimeout(() => {
            status.innerText = "BYPASSING FIREWALL...";
        }, 1500);

        // 3. Final Redirect (at 3 seconds)
        // This gives them enough time to actually read the "Firewall" message
        setTimeout(() => {
            closeSecurityTerminal();
            state.cameraAccessed = true;
            state.justTurnedOnMl = true;
            state.isLeftMonitorOn = true;
            showPage('camr-ml-on-page');
        }, 3000);

    }
    // THIS IS THE "FAILURE BLOCK" (The 'else' part)
    else {
        triggerSound('errorBeep');
        feedback.innerText = "[ERROR] INCORRECT PASSWORD";
        feedback.style.color = "#ff4444";
        status.innerText = "ACCESS DENIED";
        input.value = "";
    }
}


// The Reset (Disconnect)
function closeSecurityTerminal() {
    document.getElementById('security-login-minigame').classList.add('hidden');

    const backArrow = document.getElementById('master-back-arrow');
    const hitbox = document.getElementById('camr-ml-off-hitbox');

    // Bring everything back
    if (backArrow) {
        backArrow.style.visibility = 'visible';
        backArrow.style.pointerEvents = 'auto';
    }
    if (hitbox) {
        hitbox.style.display = 'block';
    }
}



// ----- 5. INITIALIZE EVENT LISTENERS -----

function init() {
    //Menu System
    runMenuTypewriter();
    window.addEventListener('load', () => {
        setTimeout(() => {
            warmUpGame();
        }, 1000); // Wait 1 second after the page is visible to start background loading
    });
    startButton.onclick = () => {
        // 1. IMMEDIATE ACTION (This fixes the "Input Delay")
        menu.classList.add('hidden');

        // 2. WAIT ONE FRAME (Let the menu disappear first)
        requestAnimationFrame(() => {
            // 3. SHOW THE BASE UI (The "Skeleton" of the game)
            play.classList.remove('hidden');
            document.getElementById('inventory-drawer').classList.remove('hidden');
            document.getElementById('hamburger-menu').classList.remove('hidden');

            // 4. WAIT ANOTHER FRAME (Let the UI settle)
            requestAnimationFrame(() => {
                // 5. SHOW THE INTERACTIVE TOOLS
                document.getElementById('hint-btn').classList.remove('hidden');
                document.getElementById('hint-box').classList.remove('hidden');

                // 6. FINAL STEP: Load the content
                if (hasSaveFile()) {
                    const saveData = loadGame();
                    if (saveData) {
                        showPage(saveData.currentPage);
                        return;
                    }
                }
                triggerSound('globalAmbience'); //fixme move this when I add tutorial
                showPage('mh-bd-main-page');
            });
        });
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
        syncMusicSystems(e.target.value);
    };

    //SFX volume slider
    document.getElementById('sfx-slider').oninput = (e) => {
        syncSFXSystems(e.target.value);
    };

    //Fullscreen toggle
    document.getElementById('fullscreen-toggle').onchange = (e) => {
        if(e.target.checked) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };


    //Exit button fixme temporarily removed exit button. All it does is close the window, and no websites have this bc its unnecessary
   /* document.getElementById('exit-button').onclick = () => {
        window.close();
    };*/


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

    // In-game settings button
    document.getElementById('ingame-settings-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');
        document.getElementById('ingame-settings').classList.remove('hidden');

        // Sync fullscreen checkbox state
        document.getElementById('ingame-fullscreen-toggle').checked = !!document.fullscreenElement;
    };

// In-game settings close button
    document.getElementById('ingame-settings-close-btn').onclick = () => {
        document.getElementById('ingame-settings').classList.add('hidden');
    };

// In-game music slider
    document.getElementById('ingame-music-slider').oninput = (e) => {
        const val = e.target.value;

        // 1. Update UI for the current slider
        document.getElementById('ingame-music-value').textContent = val;

        // 2. Keep main menu slider in sync
        const mainSlider = document.getElementById('music-slider');
        const mainLabel = document.getElementById('music-value');
        if (mainSlider) mainSlider.value = val;
        if (mainLabel) mainLabel.textContent = val;

        // 3. THE MISSING LINK: Actually change the sound volume!
        syncMusicSystems(val);
    };

// In-game SFX slider
    document.getElementById('ingame-sfx-slider').oninput = (e) => {
        syncSFXSystems(e.target.value);
    };

// In-game fullscreen toggle
    document.getElementById('ingame-fullscreen-toggle').onchange = (e) => {
        if (e.target.checked) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        // Keep main menu toggle in sync
        document.getElementById('fullscreen-toggle').checked = e.target.checked;
    };

// Sync in-game fullscreen toggle when Escape is pressed
    document.addEventListener('fullscreenchange', () => {
        const isFullscreen = !!document.fullscreenElement;
        document.getElementById('ingame-fullscreen-toggle').checked = isFullscreen;
        document.getElementById('fullscreen-toggle').checked = isFullscreen;
    });

    //Restart button
    document.getElementById('restart-btn').onclick = () => {
        stopAllAudio();
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

        // Reset wire puzzle
        wirePuzzleInitialized = false;
        document.getElementById('wire-solved-popup').classList.add('hidden');

        // Clear save so a fresh game starts next time
        clearSave();

        // Return to start of game
        triggerSound('ambientNoise');
        const currentMusicVol = document.getElementById('music-slider').value;
        const currentSFXVol = document.getElementById('sfx-slider').value;
        syncMusicSystems(currentMusicVol);
        syncSFXSystems(currentSFXVol);

        showPage('mh-bd-main-page');
    };

    //Quit to main menu button
    document.getElementById('quit-btn').onclick = () => {
        stopAllAudio();
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
        document.getElementById('hint-text').innerText = getCurrentHint();
        //document.getElementById('hint-box').classList.remove('hidden');
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
            refreshInventorySlots();
        }
        showPage('mh-bd-slot-open-page');
        await delay(20);
        await spawnThemedBox('A key!', "notification-top");
    };
    document.getElementById('bd-slot-open-hitbox').onclick = () => showPage('mh-bd-slot-closed-page');

    // bd Door Handle & Locking
    document.getElementById('bd-door-keyhole-hitbox').onclick = async (e) => {
        if (state.hasBdKey) {
            state.bdUnlocked = true;
            const keySlot = document.getElementById('inv-bd-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            triggerSound('unlock');
            await delay(20);
            await spawnThemedBox('It\'s unlocked !', "notification-top");
        } else {
            await spawnThemedBox('hm... I\'ll need to find a key for this door', "notification-top");
        }
    };
    document.getElementById('bd-door-handle-hitbox').onclick = async (e) => {
        if (state.bdUnlocked) {
            triggerSound('openDoor');
            showPage('bd-door-open-page');
        } else {
            await delay(20);
            await spawnThemedBox('I need to unlock the door first', "notification-top");
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
    document.getElementById('bd-fb-key-hitbox').onclick = async (e) => {
        state.hasPrKey = true;
        const keySlot = document.getElementById('inv-pr-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('bd-fb-open-page');
        await delay(20);
        await spawnThemedBox('Another key!', "notification-top");
    };

    // door behind book drop and locking
    document.getElementById('bd-back-door-hitbox').onclick = () => showPage('bd-back-door-handle-page');

    document.getElementById('bd-back-handle-keyhole-hitbox').onclick = async (e) => {
        if (state.hasPrKey) {
            state.bdBackDoorUnlocked = true;
            const keySlot = document.getElementById('inv-pr-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            triggerSound('unlock');
            await delay(20);
            await spawnThemedBox('It\'s unlocked !', "notification-top");
        } else {
            await spawnThemedBox('I need to find another key...', "notification-top");
        }
    };
    document.getElementById('bd-back-handle-handle-hitbox').onclick = async (e) => {
        if (state.bdBackDoorUnlocked) {
            triggerSound('openDoor');
            showPage('bd-back-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', "notification-top");
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

    document.getElementById('pr-pw-book-projector-hitbox').onclick = async (e) => {
        if (state.solvedWirePuzzle) {
            state.isProjectorOn = true;
            showPage ('pr-pw-book-projector-on-page');
        } else {
            await spawnThemedBox("I wonder if I could get this projector to turn on", "notification-top");
        }
    }

    document.getElementById('pr-po-wr-hitbox').onclick = () => showPage('pr-wr-main-page');

    document.getElementById('pr-pw-noBook-projector-hitbox').onclick = async (e) => {
        if (state.solvedWirePuzzle) {
            state.isProjectorOn = true;
            showPage ('pr-pw-noBook-projector-on-page');
        } else {
            await spawnThemedBox("I wonder if I could get this projector to turn on", "notification-top");
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
            refreshInventorySlots();
        }
        // fixme
        showPage('pr-pw-hole-noBook-page');
        openOverlay('pw-book', 'inv-images/pw-book.png');
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

    document.getElementById('ki-door-handle-keyhole-hitbox').onclick = async (e) => {
        if (state.hasKiKey) {
            triggerSound('unlock');
            state.kiUnlocked = true;
            const keySlot = document.getElementById('inv-ki-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            const keySlot2 = document.getElementById('inv-pw-book');
            if (keySlot2) {
                keySlot2.classList.add('hidden');
                refreshInventorySlots();
            }
            await delay(20);
            await spawnThemedBox('It\'s unlocked!', "notification-top");
        }
        else {
            await spawnThemedBox('It\'s locked! Where am I going to find another key ?', "notification-top");
        }
    };
    document.getElementById('ki-door-handle-handle-hitbox').onclick = async (e) => {
        if (state.kiUnlocked) {
            triggerSound('openDoor');
            showPage('ki-door-open-page');
        } else {
            await spawnThemedBox('This door\'s locked, too', "notification-top");
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
        await spawnThemedBox('3672', "notification-top");
        await spawnThemedBox('Who would write a code here ?', "notification-top");
        await spawnThemedBox('And what is it for ?', "notification-top");
    }


    // ----- CREEPY ROOM SECTION -----
    document.getElementById('bh-sh-cr-dc-hitbox').onclick = () => showPage('bh-sh-cr-door-closed-page');
    document.getElementById('bh-sh-cr-do-hitbox').onclick = () => showPage('sh-cr-door-open-page');

    document.getElementById('bh-sh-cr-door-closed-hitbox').onclick = () => showPage('bh-sh-cr-door-handle-page');
    document.getElementById('bh-sh-cr-door-handle-handle-hitbox').onclick = async (e) => {
        if (state.crUnlocked) {
            showPage('sh-cr-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', 'notification-top');
        }
    }
    document.getElementById('bh-sh-cr-door-handle-keypad-hitbox').onclick = () => {
        showPage('bh-sh-cr-door-keypad-page');
        enteredCode = ""; //resets entered code
    }

    document.getElementById('cr-door-open-hitbox').onclick= () => {
        if (!state.camrDoorOpen) {
            showPage('cr-main-2dc-page');
        } else if(!state.crlDoorOpen) {
            showPage('cr-main-1dc-page');
        } else {
            showPage('cr-main-page');
        }
    }

    document.getElementById('cr-main-2dc-couches-hitbox').onclick = () => {
        if (state.hasCamrKey) {
            showPage('cr-couches-page');
        } else {
            showPage('cr-couches-key-page');
        }
    }
    document.getElementById('cr-main-couches-hitbox').onclick = () => showPage('cr-couches-page');
    document.getElementById('cr-main-1dc-couches-hitbox').onclick = () => showPage('cr-couches-page');
    document.getElementById('cr-couches-key-couch-hitbox').onclick = () => showPage('cr-couch-key-page');
    document.getElementById('cr-couch-key-zoom-hitbox').onclick = () => showPage('cr-couch-zoom-key-page');
    document.getElementById('cr-couch-key-hitbox').onclick = async (e) => {
        state.hasCamrKey = true;
        const keySlot = document.getElementById('inv-camr-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('cr-couch-zoom-page');
        await delay(20);
        await spawnThemedBox("Another key ! Maybe this will unlock one of the doors in this room", "notification-top");
    }
    document.getElementById('cr-couches-couch-hitbox').onclick = () => showPage('cr-couch-page');
    document.getElementById('cr-couch-zoom-hitbox').onclick = () => showPage('cr-couch-zoom-page');
    document.getElementById('cr-couch-hitbox').onclick = async (e) => {
        await spawnThemedBox("There's nothing left in the cushions", "notification-top");
    }

    document.getElementById('cr-main-2dc-doors-hitbox').onclick = () => showPage('cr-doors-2dc-page');
    //fixme add image: document.getElementById('dr-doors-2dc-rd-hitbox').onclick = () => showPage('');
    document.getElementById('cr-main-doors-hitbox').onclick = () => {
        state.isLeftMonitorOn ? showPage('cr-doors-cam-page') : showPage('cr-doors-page');
    }

    document.getElementById('cr-main-1dc-doors-hitbox').onclick = () => {
        if (state.isLeftMonitorOn) {
            showPage('cr-doors-1dc-cam-page')//fixme -- I don't remember why I put this fixme here..., maybe to do with the ghost ?
        } else {
            showPage('cr-doors-1dc-page');
        }
    }
    document.getElementById('cr-doors-1dc-cam-rd-hitbox').onclick = () => showPage('camr-main-ml-on-page');
    document.getElementById('cr-doors-cam-rd-hitbox').onclick = () => showPage('camr-main-ml-on-page');

    document.getElementById('cr-doors-2dc-rd-hitbox').onclick = () => showPage('cr-camr-door-closed-page');
    document.getElementById('cr-camr-door-closed-hitbox').onclick = async (e) => {
        if (state.hasCamrKey) {
            triggerSound('unlock');
            const keySlot = document.getElementById('inv-camr-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            state.camrUnlocked = true; state.camrDoorOpen = true;
            showPage('cr-doors-1dc-page');
        } else {
            await spawnThemedBox("I need to find a key for this door", "notification-top");
        }
    }
    document.getElementById('cr-doors-1dc-cam-ld-hitbox').onclick = () => showPage('cr-doors-1dc-ld-page');
    document.getElementById('cr-1dc-ld-door-closed-hitbox').onclick = async (e) => {
        if (state.hasClrKey) {
            triggerSound('unlock');
            state.crlUnlocked = true;
            const keySlot = document.getElementById('inv-clr-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('clr-main-id-page');
            await spawnThemedBox('What is that ?? And ID card ? Why is it so large ??', 'notification-top');
        } else {
            await spawnThemedBox('I need to find a key for this door', "notification-top");
        }
    }
    document.getElementById('clr-main-cloth-hitbox').onclick = async (e) => {
        showPage('clr-cloth-page');
    }
    document.getElementById('clr-cloth-hitbox').onclick = () => {showPage('clr-cloth-octagon-page'); state.foundOctagon = true;}
    document.getElementById('clr-cloth-octagon-hitbox').onclick = async (e) => {
        await spawnThemedBox("Another shape...", "notification-top");
    }
    document.getElementById('clr-main-id-id-hitbox').onclick = async (e) => {
        state.hasWrId = true;
        const keySlot = document.getElementById('inv-wr-id');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('clr-main-page');
        openOverlay('wr-id', 'inv-items/wr-id.png');
        await spawnThemedBox("The Demon Decon's ID card. It's huge !!", "notification-top");
    }

    //----- CAMERA ROOM SECTION -----
    document.getElementById('cr-doors-1dc-rd-hitbox').onclick = () => {
        state.isLeftMonitorOn ? showPage('camr-main-ml-on-page') : showPage('camr-main-page');
    }
    document.getElementById('camr-main-window-hitbox').onclick = () => {
        showPage('camr-we-page');
    }
    document.getElementById('camr-main-ml-hitbox').onclick = () => {
        showPage('camr-ml-off-page');
    }
    document.getElementById('camr-ml-off-hitbox').onclick = () => {
        state.foundMl = true;
        const secContainer = document.getElementById('security-login-minigame');
        const backArrow = document.getElementById('master-back-arrow');
        const hitbox = document.getElementById('camr-ml-off-hitbox');

        if (state.cameraAccessed) {
            showPage('camr-ml-on-page');
            return;
        }

        secContainer.classList.remove('hidden');

        // Hide UI elements
        if (backArrow) backArrow.style.visibility = 'hidden';
        if (hitbox) hitbox.style.display = 'none';
    };
    document.getElementById('camr-main-mr-hitbox').onclick = () => {
        showPage('camr-mr-off-page');
    }
    document.getElementById('camr-main-wp-window-hitbox').onclick = () => {
        showPage('camr-wp-page');
        state.justFoundWp = true;
    }
    document.getElementById('camr-wp-hitbox').onclick = async (e) => {
        await spawnThemedBox('A person ?? How did they get in there ? What\'s going on ?', "notification-top");
    }
    document.getElementById('camr-main-ml-on-person-hitbox').onclick = async (e) => {
        showPage('camr-ml-on-person-page');
    }
    document.getElementById('camr-ml-on-person-hitbox').onclick = async (e) => {
        await spawnThemedBox("There's a person in that room ! Are they ok ? I need to get in there.", "notification-top");
    }

    document.getElementById('camr-mr-off-hitbox').onclick = async (e) => {
        state.foundWordle = true;
        const container = document.getElementById('wordle-minigame');
        const backArrow = document.getElementById('master-back-arrow');
        const hitbox = document.getElementById('camr-mr-off-hitbox');

        // 1. Guard: If Wordle is already open, do nothing.
        if (container && !container.classList.contains('hidden')) {
            return;
        }

        // 2. Open the terminal
        container.classList.remove('hidden');

        // --- NEW: HIDE GAME UI ---
        if (backArrow) backArrow.style.visibility = 'hidden';
        if (hitbox) hitbox.style.display = 'none';
        // -------------------------

        if (state.wonWordle) {
            // If already solved, rebuild the UI to show the win screen
            container.innerHTML = `
            <div id="wordle-ui-wrapper">
                <h2 style="color:#538d4e; margin-bottom:10px;">TERMINAL DECRYPTED</h2>
                <div class="wordle-grid" id="static-grid"></div>
            </div>
        `;

            const grid = document.getElementById('static-grid');
            for (let letter of state.savedKey) {
                const tile = document.createElement('div');
                tile.className = 'wordle-tile correct';
                tile.textContent = letter;
                grid.appendChild(tile);
            }

            showSuccessUI();
        } else {
            // Start a fresh game if not solved
            startWordle(() => {
                // Callback when they win: You might want to show the arrow again here!
            });
        }
    };




    // ------- C-WING SECTION -----
    document.getElementById('mh-cend-right-endc-cw-hitbox').onclick = () => showPage('stairs-rubble-page'); //fixme add door sound effect
    document.getElementById('mh-cw-stairs-rubble-hitbox').onclick = async (e) => {
        await spawnThemedBox("What happened here ? It looks like the upper floors have been demolished.", "notification-top");
    }
    document.getElementById('mh-cw-stairs-hitbox').onclick = () => {
        showPage('stairs-page');
    }
    document.getElementById('mh-cw-stairs-door-hitbox').onclick = () => {
        triggerSound('steps'); //fixme only on way down rn
        showPage('mh-cw-door-page');
    }
    document.getElementById('mh-cw-door-plate-hitbox').onclick = () => showPage('mh-cw-door-plate-page');
    //^fixme add some stuff on the plate page
    document.getElementById('mh-cw-door-hitbox').onclick = () => showPage('cw-entrance-page');
    document.getElementById('cw-stairs-door-hitbox').onclick = () => {} //fixme add page to show here goign up the stairs,
    //fixme then add a page going through the door into the hallway
    document.getElementById('cw-bath-door-hitbox').onclick = async (e) => {
        showPage('bath-page');
    }
    document.getElementById('bath-sink-hitbox').onclick = () => showPage('bath-sink-page');
    document.getElementById('bath-sink-sink-hitbox').onclick = async (e) => {
        await spawnThemedBox("This sink is so old you can't turn the water off", "notification-top");
    }
    //document.getElementById('cw-wr-do-hitbox').onclick = () => showPage('cw-wr-handle-unlocked-page'); //fixme why are there two of these and why does the second run instead
    document.getElementById('cw-wr-dc-hitbox').onclick = () => showPage('cw-wr-handle-locked-page');
    document.getElementById('cw-wr-scanner-hitbox').onclick = async (e) => {
        if (state.hasWrId) {
            triggerSound('keycardSwipe');
        state.wrUnlocked = true;
        const keySlot = document.getElementById('inv-wr-od');
        if (keySlot) {
                keySlot.classList.add('hidden');
            refreshInventorySlots();
        }
        showPage('cw-wr-handle-unlocked-page');
        await delay (20);
        await spawnThemedBox("It's unlocked now !", "notification-top");
        } else {
            await spawnThemedBox("I'll need to find a keycard to unlock this door", 'notification-top');
        }
    }
    document.getElementById('cw-elevator-hitbox').onclick = async (e) => {
        await spawnThemedBox("It's not working", "notification-top");
    }
    document.getElementById('cw-wr-locked-handle-hitbox').onclick = async (e) => {
        spawnThemedBox("I need to unlock the door first", "notification-top");
    }
    document.getElementById('cw-wr-unlocked-handle-hitbox').onclick = () => {
        triggerSound('doorOpenClose')
        showPage('wr-mid-page')
    }; //fixme show wr room main page when added
    document.getElementById('oh3-entrance-hitbox').onclick = () => showPage('oh2-oh3-entrance-page');

    document.getElementById('cw-oh1-entrance-hitbox').onclick = () => showPage('oh1-left-1-page');
    document.getElementById('oh1-left-4-key-books-hitbox').onclick = () => showPage('oh1-books-key-page');
    document.getElementById('oh1-books-hitbox').onclick = async (e) => {
        await spawnThemedBox("I don't see anything else useful here", "notification-top");
    }
    document.getElementById('oh1-books-key-hitbox').onclick = async (e) => {
        state.hasClrKey = true;
        const keySlot = document.getElementById('inv-clr-key')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('oh1-books-page');
        await delay(20);
        await spawnThemedBox("Another key !", "notification-top");
        triggerSound('printClick');
        setTimeout(async () => {
            await spawnThemedBox("Is that a printer making noise ?", "notification-top");
            setTimeout(async () => {
                await spawnThemedBox("Maybe I should go check it out", "notification-top");
            }, 2000);
        }, 1500);
    }
    document.getElementById('printer-hitbox').onclick = () => showPage('print-page');
    document.getElementById('printer-paper-hitbox').onclick = async (e) => {
        showPage('print-paper-page');
        await delay(20);
        await spawnThemedBox("what's this?", "notification-top");
    }
    document.getElementById('print-screen-hitbox').onclick = () => showPage('print-screen-page');
    document.getElementById('print-screen-2-hitbox').onclick = () => {
        showPage('printer-sync-minigame');
        u[j .m] //fixme
        // 3. Reset the state
        currentLevel = 1;
        isRunning = true;

        generateRandomTarget();
        update();
    }
    document.getElementById('print-paper-hitbox').onclick = async (e) => {
        openOverlay("print-paper", "cw-images/cw-sideHall-images/print-paper-item.png");
        await delay(20);
        await spawnThemedBox("A... fax to the president of the US ? from 1963 ?!? what's this about ?", "notification-top");
    };
    document.getElementById('cw-right-print-room-hitbox').onclick = () => {state.isPrinterCalibrated ? showPage('print-main-paper-page') : showPage('print-main-page')};



    //------ WRITING ROOM SECTION -----
    document.getElementById('cw-wr-do-hitbox').onclick = () => {
        triggerSound('doorOpenClose');
        showPage('wr-mid-page');
    }
    document.getElementById('wr-left-desk-key-hitbox').onclick = () => showPage('wr-desk-key-page');
    document.getElementById('wr-desk-key-hitbox').onclick = async () => {
        state.hasLiKey = true;
        const keySlot = document.getElementById('inv-li-key')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('wr-desk-page');
            if (!state.foundWrPapers) {
                await delay(30);
                triggerSound('shufflePapers');

                await delay(1000);
                await spawnThemedBox("What's that noise ? Is someone moving stuff around in this room?", "notification-top");
                await delay(1500);
                await spawnThemedBox("I should look around the room to see if anything changed", "notification-top");
            }
    }
    document.getElementById('wr-desk-hitbox').onclick = async (e) => {
        await spawnThemedBox("I don't see anything else useful here", "notification-bottom");
    }
    document.getElementById('wr-left-desk-hitbox').onclick = () => showPage('wr-desk-page');
    document.getElementById('wr-right-papers-hitbox').onclick = async (e) => {
        showPage('wr-papers-page');
        await delay(20);
        await spawnThemedBox("who left these papers here ?", "notification-top");
        state.foundWrPapers = true;
    }
    document.getElementById('wr-right-note-papers-hitbox').onclick = () => showPage('wr-papers-page');
    document.getElementById('wr-papers-tu-hitbox').onclick = async (e) => {
        openOverlay('wr-tu', "wr-images/wr-tu.png");
        await delay(20);
        await spawnThemedBox("A cutout of a newspaper article about underground tunnels", "notification-top");
    }
    document.getElementById('wr-papers-ogb-hitbox').onclick = async (e) => {
        openOverlay('wr-ogb', 'wr-images/wr-ogb.png');
        await delay(20);
        await spawnThemedBox("The old gold and black. That's the school newspaper", "notification-top");
    }
    document.getElementById('wr-papers-reddit-hitbox').onclick = async (e) =>  {
        openOverlay('wr-reddit', 'wr-images/wr-reddit.png');
        await delay (20);
        await spawnThemedBox("A printout of some random reddit post ?", "notification-top");
    }
    document.getElementById('wr-right-note-note-hitbox').onclick = async (e) => {
        showPage('wr-note-page');
        await delay(20);
        await spawnThemedBox("Who wrote this note ? Someone else is definitely down here with me...", "notification-top");
    }
    document.getElementById('wr-note-hitbox').onclick = () => {
        //fixme allow them to read wr-note more easily,, do same thing w the tu, ogb, and reddit
    }


    // ------ LIBRARY SECTION ------

    //door, handle, and locking
    document.getElementById('li-door-handle-hitbox').onclick = () => {
        if (state.liUnlocked) {
            triggerSound('openDoor');
            showPage('li-door-open-page');
        } else {
            showPage('mh-li-door-handle-page');
        }
    }
    document.getElementById('li-door-handle-keyhole-hitbox').onclick = async (e) => {
        if (state.hasLiKey) {
            triggerSound('unlock');
            state.liUnlocked = true;
            const keySlot = document.getElementById('inv-li-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            await spawnThemedBox("It's unlocked !", 'notification-top');
        } else {
            await spawnThemedBox('I need to find a key for this door', 'notification-top');
        }
    }
    document.getElementById('li-door-handle-handle-hitbox').onclick = async (e) => {
        if (state.liUnlocked) {
            triggerSound('openDoor');
            showPage('li-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', "notification-top");
        }
    }
    document.getElementById('li-main-lw-lt-hitbox').onclick = () => {
        if (state.hasSkPaper) {
            showPage('li-left-lt-star-page'); //fixme add this image
        } else {
           showPage('li-left-lt-page');
        } //fixme later add check for if they did what was needed for this page
    }
    document.getElementById('li-left-lt-hitbox').onclick = () => showPage('li-lt-page');
    document.getElementById('li-lt-laptop-hitbox').onclick = () => showPage('li-laptop-page');
    document.getElementById('li-lt-scanner-hitbox').onclick = async(e) => {
        if (state.hasLorBook) {
            triggerSound('scanner');
            state.scannedBook = true;
            const keySlot = document.getElementById('inv-lor-book')
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-lt-star-page');
        } else {
            await spawnThemedBox('I need to find a book to scan', "notification-top");
        }
    }

    document.getElementById('li-laptop-hitbox').onclick = async (e) => {
        await spawnThemedBox('I wonder what happens if I scan this book', 'notification-top');
        await spawnThemedBox('I should look around and see if I can find it.', 'notification-top');
        state.foundScanner = true;
    }
    document.getElementById('li-main-lw-mw-hitbox').onclick = () => showPage('li-mw-books-page');
    document.getElementById('li-lt-sk-paper-hitbox').onclick = () => {
        state.hasSkPaper = true;
        const keySlot = document.getElementById('inv-sk-paper')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-lt-sk-page');
    }
    document.getElementById('li-entrance-lw-hitbox').onclick = () => showPage('li-main-lw-page');
    document.getElementById('li-entrance-nb-lw-hitbox').onclick = () => showPage('li-main-lw-page');
    document.getElementById('li-entrance-tvo-lw-hitbox').onclick = () => showPage('li-main-lw-page');
    document.getElementById('li-entrance-tvo-nb-lw-hitbox').onclick = () => showPage('li-main-lw-page');


    //mid wall books section
    document.getElementById('li-mw-tolkein-hitbox').onclick = () => showPage('li-tolkein-page');
    document.getElementById('li-mw-esme-hitbox').onclick    = () => showPage('li-esme-page');
    document.getElementById('li-mw-ruta-hitbox').onclick    = () => showPage('li-ruta-page');
    document.getElementById('li-mw-russo-hitbox').onclick   = () => showPage('li-russo-page');
    document.getElementById('li-mw-nb-esme-hitbox').onclick    = () => showPage('li-esme-page');
    document.getElementById('li-mw-nb-ruta-hitbox').onclick    = () => showPage('li-ruta-page');
    document.getElementById('li-mw-nb-russo-hitbox').onclick   = () => showPage('li-russo-page');
    //fixme document.getElementById('li-rw-smith-hitbox').onclick   = () => showPage('li-smith-page');
    document.getElementById('li-tolkein-hitbox').onclick = () => {
        state.hasLorBook = true;
        const keySlot = document.getElementById('inv-lor-book')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-tolkein-nb-page');
    }

    //mid wall section
    document.getElementById('li-main-doors-hitbox').onclick = () => showPage('li-2dc-page');
    document.getElementById('li-main-ro-doors-hitbox').onclick = () => showPage('li-2dc-page');
    document.getElementById('li-main-tvo-doors-hitbox').onclick = () => showPage('li-2dc-page');
    document.getElementById('li-main-ro-tvo-doors-hitbox').onclick = () => showPage('li-2dc-page');
    document.getElementById('li-2dc-door-hitbox').onclick = () => showPage('li-office-door-closed-page');

    document.getElementById('li-main-mw-hitbox').onclick = () => showPage('li-mid-wall-page');
    document.getElementById('li-main-ro-mw-hitbox').onclick = () => showPage('li-mid-wall-ro-page');
    document.getElementById('li-main-ro-tvo-mw-hitbox').onclick = () => showPage('li-mid-wall-ro-tvo-page');
    document.getElementById('li-main-tvo-mw-hitbox').onclick = () => showPage('li-mid-wall-tvo-page');
    document.getElementById('li-mw-tv-hitbox').onclick = () => {
        if (state.hasBr && state.hasWr) {
            showPage('li-tv-page');
        } else if (state.hasBr) {
            showPage('li-tv-wr-page');
        } else if (state.hasWr) {
            showPage('li-tv-br-page');
        } else {
            showPage('li-tv-2r-page');
        }
    }
    document.getElementById('li-mw-tvo-tv-hitbox').onclick = () => {
        if (state.hasBr && state.hasWr) {
            showPage('li-tv-on-page');
        } else {
            showPage('li-tv-wr-tvo-page');
        }
    }
    document.getElementById('li-mw-ro-tv-hitbox').onclick = () => {
        if (state.hasBr && state.hasWr) {
            showPage('li-tv-page');
        } else {
            showPage('li-tv-br-page');
        }
    }
    document.getElementById('li-mw-ro-tvo-tv-hitbox').onclick = () => showPage('li-tv-on-page');
    document.getElementById('li-mw-read-hitbox').onclick = () => showPage('li-read-page');
    document.getElementById('li-mw-tvo-read-hitbox').onclick = () => showPage('li-read-page');
    document.getElementById('li-mw-ro-read-hitbox').onclick = () => showPage('li-read-on-page');
    document.getElementById('li-mw-ro-tvo-read-hitbox').onclick = () => showPage('li-read-page');
    document.getElementById('li-read-page').onclick = async (e) => {
        if (state.hasWr) {
            state.isLiReadOn = true;
            const keySlot = document.getElementById('inv-wr');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-read-on-page');
            await delay(20);
            await spawnThemedBox("Nice, it's on now. Not sure why I felt the need to do that tho.", "notification-top");
        } else {
            await spawnThemedBox("This sign looks like it can be turned on.", "notification-top");
        }
    }
    document.getElementById('li-read-on-hitbox').onclick = async (e) => {
        await spawnThemedBox("I wonder if the colors are of any importance", "notification-top");
    }

    document.getElementById('li-tv-remotes-hitbox').onclick = () => showPage('li-2r-page');
    document.getElementById('li-tv-br-hitbox').onclick = () => showPage('li-br-page');
    document.getElementById('li-tv-wr-hitbox').onclick = () => showPage('li-wr-page');
    document.getElementById('li-tv-tvo-wr-hitbox').onclick = () => showPage('li-wr-tvo-page');
    document.getElementById('li-2r-wr-hitbox').onclick = () => {
        state.hasWr = true;
        const keySlot = document.getElementById('inv-wr');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-br-page');
    }
    document.getElementById('li-2r-br-hitbox').onclick = () => {
        state.hasBr = true;
        const keySlot = document.getElementById('inv-Br');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-wr-page');
    }
    document.getElementById('li-wr-hitbox').onclick = () => {
        state.hasWr = true;
        const keySlot = document.getElementById('inv-wr');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-nr-page');
    }
    document.getElementById('li-wr-tvo-hitbox').onclick = () => {
        state.hasWr = true;
        const keySlot = document.getElementById('inv-wr');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-nr-tvo-page');
    }
    document.getElementById('li-br-hitbox').onclick = () => {
        state.hasBr = true;
        const keySlot = document.getElementById('inv-Br');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-nr-page');
    }
    document.getElementById('li-tv-on-hitbox').onclick = async () => {
        await spawnThemedBox("What's up with all these shapes?", "notification-top");
    }
    document.getElementById('li-tv-hitbox').onclick = async (e) => {
        if (state.hasBr) {
            state.isLiTvOn = true;
            const keySlot = document.getElementById('inv-br');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-tv-on-page');
            await delay(20);
            await spawnThemedBox("It's on now !", "notification-top");
        } else {
            await spawnThemedBox("I'll need a remote if I want to turn the tv on", "notification-top");
        }
    }
    document.getElementById('li-tv-wr-tv-hitbox').onclick = async (e) => {
        if (state.hasBr) {
            state.isLiTvOn = true;
            const keySlot = document.getElementById('inv-br');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-tv-wr-tvo-page');
            await delay(20);
            await spawnThemedBox("It's on now !", "notification-top");
        } else {
            await spawnThemedBox("I'll need a remote if I want to turn the tv on", "notification-top");
        }
    }
    document.getElementById('li-tv-wr-tvo-hitbox').onclick = async (e) => {
        if (state.hasBr) {
            //fixme add feedback
        } else {
            //fixme add feedback
        }
    }
    document.getElementById('li-read-hitbox').onclick = async (e) => {
        if (state.hasWr) {
            state.isLiReadOn = true;
            const keySlot = document.getElementById('inv-wr');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-read-on-page');
            await delay(20);
            await spawnThemedBox("Nice, it's on now. Not sure why I felt the need to do that tho.", "notification-top");
        } else {
            await spawnThemedBox("This sign looks like it can be turned on.", "notification-top");
        }
    }

    // --------- library right wall section -----------
    //document.getElementById('li-rw-onoseta-hitbox').onclick = () => showPage('li-onoseta-page');
    document.getElementById('li-rw-alston-hitbox').onclick  = () => showPage('li-alston-page');
    document.getElementById('li-rw-barnes-hitbox').onclick  = () => showPage('li-barnes-page');
    document.getElementById('li-rw-boulley-hitbox').onclick = () => showPage('li-boulley-page');
    document.getElementById('li-rw-books-birb-hitbox').onclick = () => showPage('li-birb-book-page');
    document.getElementById('li-birb-book-hitbox').onclick = async (e) => {
        state.hasSherlockBook = true;
        const keySlot = document.getElementById('inv-sh-book');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-birb-page');
        openOverlay('sherlock-book', 'inv-images/sherlock-book.png');
        //fixme add feedback
        //fixme finish adding interaction with this book, currently non-functional
    }

    document.getElementById('li-main-rw-rw-hitbox').onclick = async (e) => {
        if (state.hasSkPaper && !state.hasSherlockBook) {
            showPage('li-rw-books-birb-page');
            await spawnThemedBox('What ? that bird wasn\'t there a second ago', "notification-top");
        } else {
            showPage('li-rw-books-page');
        }
    }

    document.getElementById('li-main-rw-animals-hitbox').onclick = () => {
        state.movedAnimals ? showPage('li-animals-open-1-page') : showPage('li-animals-1-page');
    }
    document.getElementById('li-animals-1-hitbox').onclick = () => showPage('li-animals-2-page');
    document.getElementById('li-animals-2-hitbox').onclick = () => {
        state.movedAnimals = true;
        showPage('li-animals-open-key-page');
    }
    document.getElementById('li-animals-open-key-hitbox').onclick = () => {
        state.hasLoKey = true;
        const keySlot = document.getElementById('inv-lo-key');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-animals-open-2-page');
    }
    document.getElementById('li-animals-open-1-hitbox').onclick = () => {
        state.hasLoKey ? showPage('li-animals-open-2-page') : showPage('li-animals-open-key-page');
    }


    // --------- LIBRARY OFFICE SECTION -----------//
    document.getElementById('li-office-door-closed-hitbox').onclick = async (e) => {
        if (state.hasLoKey) {
            triggerSound('unlock');
            state.loUnlocked = true;
            const keySlot = document.getElementById('inv-lo-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            triggerSound('openDoor');
            showPage('li-office-door-open-page');
        } else {
            await spawnThemedBox("I need one more key...", "notification-top");
        }
    }
    document.getElementById('li-office-door-open-hitbox').onclick = () => showPage('lo-main-page');
    document.getElementById('lo-main-left-ls-entrance-hitbox').onclick = () => showPage('lo-storage-entrance-page');
    document.getElementById('lo-storage-entrance-hitbox').onclick = () => showPage('ls-in-1-page');
    document.getElementById('lo-main-right-desk-hitbox').onclick = () => showPage('lo-desk-page');
    document.getElementById('lo-desk-hitbox').onclick = () => showPage('lo-desk-2-page');
    document.getElementById('lo-desk-monitor-hitbox').onclick = () => {showPage('lo-monitor-page'); state.foundLoMonitor = true;}
    //fixme add stuff for the monitor page
    document.getElementById('lo-monitor-drive-hitbox').onclick = async (e) => {
        useDrive();
    }




    // ---------- LIBRARY STORAGE SECTION -----------//
    document.getElementById('ls-lo-entrance-hitbox').onclick = () => showPage('lo-main-right-page');
    document.getElementById('ls-archives-sk-hitbox').onclick = () => showPage('ls-archives-sk-2-page');
    document.getElementById('ls-archives-note-hitbox').onclick = () => showPage('ls-archives-note-page');
    document.getElementById('ls-archives-mcduffie-hitbox').onclick = () => showPage('ls-mcduffie-1993-page');
    document.getElementById('ls-archives-black-hitbox').onclick = () => showPage('ls-black-1997-page');
    document.getElementById('ls-archives-keser-hitbox').onclick = () => showPage('ls-keser-1994-page');
    document.getElementById('ls-archives-harrell-hitbox').onclick = () => showPage('ls-harrell-1993-page');

    document.getElementById('ls-in-10-sk-nd-sk-hitbox').onclick = () => showPage('ls-10-sk-nd-page');
    document.getElementById('ls-in-10-sk-page').onclick = () => showPage('ls-10-sk-page');
    document.getElementById('ls-10-sk-nd-note-hitbox').onclick = () => {
        state.hasLs10note = true;
        const keySlot = document.getElementById('inv-ls-note')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-drive-page');
        openOverlay('ls-10-note', 'ls-images/ls-10-note.png');
    }
    document.getElementById('ls-10-sk-note-hitbox').onclick = () => {
        state.hasLs10note = true;
        const keySlot = document.getElementById('inv-ls-note')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-page');
        openOverlay('ls-10-note', 'ls-images/ls-10-note.png');
    }
    document.getElementById('ls-10-sk-nd-drive-hitbox').onclick = () => {
        state.hasLs10drive = true;
        const keySlot = document.getElementById('inv-ls-drive')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-note-page');
        openOverlay('ls-10-drive', 'ls-images/ls-10-drive.png'); //I want it to overlay immediately and the character to comment on it
        //fixme add feedback
    }
    document.getElementById('ls-10-sk-drive-hitbox').onclick = () => {
        state.hasLs10drive = true;
        const keySlot = document.getElementById('inv-ls-drive')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-page');
        openOverlay('ls-10-drive', 'ls-images/ls-10-drive.png');
        //fixme add feedback
    }



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
                    document.getElementById('pw-book-key-hitbox').onclick = async (e) => {
                        state.hasKiKey = true;
                        const keySlot = document.getElementById('inv-ki-key');
                        if (keySlot) {
                            keySlot.classList.remove('hidden');
                            refreshInventorySlots();
                        }
                        document.getElementById("item-overlay").classList.add("hidden");
                        openOverlay("pw-book", "inv-images/pw-book-open.png"); //fixme will the repeated item name cause issues?
                        await delay(20);
                        await spawnThemedBox("Another key.... Which door is this one for ?", "notification-top");
                    }
                } break;
                case 'inv-images/pw-book-open.png': {
                    document.getElementById('pw-book-open-hitbox').classList.remove('hidden');
                } break;
            }
        }
        if (itemName === "sherlock-book") {
            switch (imgSrc) {
                case 'inv-images/sherlock-book.png': {
                    document.getElementById('sherlock-book-hitbox').classList.remove('hidden');
                    document.getElementById("sherlock-book-hitbox").onclick = () => {
                        openOverlay("sherlock-book", "inv-images/sherlock-book-open.png")
                    };
                } break;
                case 'inv-images/sherlock-book-open.png': {
                    document.getElementById('sherlock-book-open-hitbox').classList.remove('hidden');
                    document.getElementById("sherlock-book-open-hitbox").onclick = () => {
                        if (state.hasSkPaper) {
                            openOverlay("sherlock-book", "inv-images/sherlock-book-open-paper.png");
                        } else {
                            console.log('Error with progression has occurred'); //fixme check that they have to get the paper before being able to access the book
                        }
                    };
                } break;
                case 'inv-images/sherlock-book-open-paper.png': {
                    document.getElementById('sherlock-book-open-un-hitbox').classList.remove('hidden')
                    document.getElementById('sherlock-book-open-der-hitbox').classList.remove('hidden');
                    document.getElementById('sherlock-book-open-animals-hitbox').classList.remove('hidden');
                    document.getElementById('sherlock-book-open-un-hitbox').onclick = async () => {
                        await spawnThemedBox("un-", "notification-top");
                    }
                    document.getElementById('sherlock-book-open-der-hitbox').onclick = async () => {
                        await spawnThemedBox("der-", "notification-top");
                    }
                    document.getElementById('sherlock-book-open-un-hitbox').onclick = async () => {
                        await spawnThemedBox("animals", "notification-top");
                    }
                    //fixme make it so if they click one more time they'll see un-der-animals maybe ?
                } break;
            }
        }
    }

    document.getElementById("item-close-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // IMPORTANT

        const overlay = document.getElementById("item-overlay");
        overlay.classList.add("hidden");

        currentOverlayItem = null;
    });

    // Close when clicking the blurred backdrop (the background, not the image)
    document.querySelector('.overlay-backdrop').addEventListener("click", () => {
        overlay.classList.add("hidden");
        currentOverlayItem = null;
    });

    // ---------- TUNNELS SECTION ----------
    document.getElementById('mh-tu-stairs-door-hitbox').onclick = () => {
        if (!state.hatchOpen) {
            showPage('tu-stairs-page');
        } else {
            showPage('tu-stairs-ho-page');
        }
    }
    document.getElementById('tu-rubble-hitbox').onclick = async () => {
        await spawnThemedBox("The stairs are completely blocked.", "notification-top");
    }
    document.getElementById('tu-hatch-hitbox').onclick = async () => {
        await spawnThemedBox("I wonder if I can unlock this hatch somehow", "notification-top");
    }
    document.getElementById('mh-li-right-endc-sd-hitbox').onclick = () => showPage('mh-tu-stairs-door-page');






}

// ---- MAP SYSTEM ----
// Define all rooms with their grid positions and sizes
// Each unit = 10px on canvas. x/y are grid coords, w/h are grid sizes.
const mapRooms = {
    // A-Wing
    mh:   { x: 4,  y: 24, w: 43, h: 3,  label: 'Main Hall',    key: 'mh'   },
    pr:   { x: 11, y: 8,  w: 6,  h: 6,  label: 'Projector',    key: 'pr'   },
    bd:   { x: 11, y: 16, w: 6,  h: 7,  label: 'Book Drop',     key: 'bd'   },
    li:   { x: 18, y: 13, w: 11, h: 10, label: 'Library',       key: 'li'   },
    lo:   { x: 24, y: 4,  w: 7,  h: 7,  label: 'Lib Office',    key: 'lo'   },
    ls:   { x: 3,  y: 4,  w: 20, h: 6,  label: 'Lib Storage',   key: 'ls'   },
    stairs:{ x: 41, y: 20, w: 5, h: 4,  label: 'Stairs',        key: 'stairs'},
    ki:   { x: 41, y: 27, w: 5,  h: 8,  label: 'Kitchen',       key: 'ki'   },
    bh:   { x: 3,  y: 27, w: 4,  h: 17, label: 'Back Hall',     key: 'bh'   },
    sh:   { x: 3,  y: 45, w: 4,  h: 5,  label: 'Side Hall',     key: 'sh'   },
    cre:  { x: 8,  y: 36, w: 8,  h: 3,  label: 'Entrance',      key: 'cre'  },
    clr:  { x: 9,  y: 38, w: 5,  h: 5,  label: 'Camera L Rm',   key: 'clr'  },
    cr:   { x: 15, y: 36, w: 10, h: 9,  label: 'Creepy Room',   key: 'cr'   },
    camr: { x: 16, y: 46, w: 8,  h: 5,  label: 'Camera Room',   key: 'camr' },
    // C-Wing
    cw:   { x: 16, y: 5,  w: 4,  h: 35, label: 'C-Wing',        key: 'cw'   },
    wr:   { x: 14, y: 0,  w: 9,  h: 4,  label: 'Classroom',     key: 'wr'   },
    bath: { x: 7,  y: 6,  w: 8,  h: 6,  label: 'Bathroom',      key: 'bath' },
    snh:  { x: 20, y: 6,  w: 10, h: 4,  label: 'Snack Hall',    key: 'snh'  },
    oh1:  { x: 6,  y: 15, w: 4,  h: 15, label: 'Office Hall',   key: 'oh1'  },
    oh2:  { x: 10, y: 27, w: 9,  h: 3,  label: 'Office Hall',   key: 'oh2'  },
    oh3:  { x: 19, y: 23, w: 3,  h: 7,  label: 'Office Hall',   key: 'oh3'  },
    print:{ x: 5,  y: 33, w: 8,  h: 7,  label: 'Printer Room',  key: 'print'},
};

const mapCorridors = [
    // A-Wing
    { rooms: ['pr',   'bd'],    dir: 'v', wing: 'a' },
    { rooms: ['bd',   'mh'],    dir: 'v', wing: 'a' },
    { rooms: ['ls',   'li'],    dir: 'v', wing: 'a' },
    { rooms: ['li',   'mh'],    dir: 'v', wing: 'a' },
    { rooms: ['lo',   'li'],    dir: 'v', wing: 'a' },
    { rooms: ['stairs','mh'],   dir: 'v', wing: 'a' },
    { rooms: ['ki',   'mh'],    dir: 'v', wing: 'a' },
    { rooms: ['bh',   'mh'],    dir: 'v', wing: 'a' },
    { rooms: ['bh',   'sh'],    dir: 'v', wing: 'a' },
    { rooms: ['bh',   'cre'],   dir: 'h', wing: 'a' },
    { rooms: ['cre',  'cr'],    dir: 'h', wing: 'a' },
    { rooms: ['clr',  'cr'],    dir: 'h', wing: 'a' },
    { rooms: ['cr',   'camr'],  dir: 'v', wing: 'a' },
    // C-Wing
    { rooms: ['cw',   'wr'],    dir: 'v', wing: 'c' },
    { rooms: ['cw',   'bath'],  dir: 'h', wing: 'c' },
    { rooms: ['cw',   'snh'],   dir: 'h', wing: 'c' },
    { rooms: ['cw',   'oh1'],   dir: 'h', wing: 'c' },
    { rooms: ['oh1',  'oh2'],   dir: 'v', wing: 'c' },
    { rooms: ['oh2',  'oh3'],   dir: 'h', wing: 'c' },
    { rooms: ['oh1',  'print'], dir: 'v', wing: 'c' },
];

const roomDiscovery = {
    mh:    () => state.discoveredMh || state.discoveredBd,
    bd:    () => state.discoveredBd,
    pr:    () => state.discoveredPr,
    ls:    () => state.discoveredLs,
    li:    () => state.discoveredLi,
    lo:    () => state.discoveredLo,
    stairs:() => state.discoveredStairs,
    ki:    () => state.discoveredKi,
    bh:    () => state.discoveredBh,
    sh:    () => state.discoveredSh,
    cre:   () => state.discoveredCr,
    cr:    () => state.discoveredCr,
    clr:   () => state.discoveredClr,
    camr:  () => state.discoveredCamr,
    cw:    () => state.discoveredCw,
    wr:    () => state.discoveredWr,
    bath:  () => state.discoveredBath,
    snh:   () => state.discoveredSnh,
    oh1:   () => state.discoveredOh1,
    oh2:   () => state.discoveredOh2,
    oh3:   () => state.discoveredOh3,
    print: () => state.discoveredPrint,
};

function getRoomKeyFromPage(pageId) {
    if (pageId.startsWith('ls-'))     return 'ls';
    if (pageId.startsWith('lo-'))     return 'lo';
    if (pageId.startsWith('li-'))     return 'li';
    if (pageId.startsWith('bd-'))     return 'bd';
    if (pageId.startsWith('pr-'))     return 'pr';
    if (pageId.startsWith('mh-'))     return 'mh';
    if (pageId.startsWith('ki-'))     return 'ki';
    if (pageId.startsWith('bh-sh-'))  return 'sh';
    if (pageId.startsWith('bh-'))     return 'bh';
    if (pageId.startsWith('sh-'))     return 'sh';
    if (pageId.startsWith('clr-'))    return 'clr';
    if (pageId.startsWith('camr-'))   return 'camr';
    if (pageId.startsWith('cr-'))     return 'cr';
    if (pageId.startsWith('stairs-')) return 'stairs';
    if (pageId.startsWith('cw-'))     return 'cw';
    if (pageId.startsWith('wr-'))     return 'wr';
    if (pageId.startsWith('bath-'))   return 'bath';
    if (pageId.startsWith('snh-'))    return 'snh';
    if (pageId.startsWith('oh1-'))    return 'oh1';
    if (pageId.startsWith('oh2-'))    return 'oh2';
    if (pageId.startsWith('oh3-'))    return 'oh3';
    if (pageId.startsWith('print-'))  return 'print';
    return null;
}

function isInCWing(pageId) {
    return pageId.startsWith('cw-')    ||
        pageId.startsWith('wr-')    ||
        pageId.startsWith('bath-')  ||
        pageId.startsWith('snh-')   ||
        pageId.startsWith('oh1-')   ||
        pageId.startsWith('oh2-')   ||
        pageId.startsWith('oh3-')   ||
        pageId.startsWith('print-') ||
        pageId.startsWith('stairs-');
}

let currentMapRoom = null;
let currentWing = 'a';

function updateMap(pageId) {
    const roomKey = getRoomKeyFromPage(pageId);
    if (roomKey) {
        const discKey = 'discovered' + roomKey.charAt(0).toUpperCase() + roomKey.slice(1);
        if (state[discKey] !== undefined) state[discKey] = true;
        currentMapRoom = roomKey;
    }
    currentWing = isInCWing(pageId) ? 'c' : 'a';
}

function drawMap() {
    const wing = currentWing === 'c' ? 'c' : 'a';
    const canvas = document.getElementById('map-canvas');
    const CELL = 14;

    const aRooms = {
        mh:    mapRooms.mh,   pr:   mapRooms.pr,  bd:   mapRooms.bd,
        li:    mapRooms.li,   lo:   mapRooms.lo,  ls:   mapRooms.ls,
        stairs:mapRooms.stairs, ki: mapRooms.ki,  bh:   mapRooms.bh,
        sh:    mapRooms.sh,   cre:  mapRooms.cre, clr:  mapRooms.clr,
        cr:    mapRooms.cr,   camr: mapRooms.camr,
    };

    const cRooms = {
        cw:   mapRooms.cw,  wr:    mapRooms.wr,  bath:  mapRooms.bath,
        snh:  mapRooms.snh, oh1:   mapRooms.oh1, oh2:   mapRooms.oh2,
        oh3:  mapRooms.oh3, print: mapRooms.print,
    };

    const rooms = wing === 'c' ? cRooms : aRooms;
    const corridors = mapCorridors.filter(c => c.wing === wing);

    // Calculate canvas size from room extents
    let maxX = 0, maxY = 0;
    Object.values(rooms).forEach(r => {
        maxX = Math.max(maxX, r.x + r.w);
        maxY = Math.max(maxY, r.y + r.h);
    });
    canvas.width  = (maxX + 2) * CELL;
    canvas.height = (maxY + 2) * CELL;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0500';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw corridors
    corridors.forEach(c => {
        const bothDiscovered = c.rooms.every(key => roomDiscovery[key]?.());
        if (!bothDiscovered) return;

        const r1 = rooms[c.rooms[0]];
        const r2 = rooms[c.rooms[1]];
        if (!r1 || !r2) return;

        let x1, y1, x2, y2;
        if (c.dir === 'v') {
            const top    = r1.y < r2.y ? r1 : r2;
            const bottom = r1.y < r2.y ? r2 : r1;
            const cx = (bottom.x + bottom.w / 2) * CELL;
            x1 = cx; y1 = (top.y + top.h) * CELL;
            x2 = cx; y2 = bottom.y * CELL;
        } else {
            const left  = r1.x < r2.x ? r1 : r2;
            const right = r1.x < r2.x ? r2 : r1;
            const cy = (left.y + left.h / 2) * CELL;
            x1 = (left.x + left.w) * CELL; y1 = cy;
            x2 = right.x * CELL;           y2 = cy;
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#c9a84c';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw rooms
    Object.values(rooms).forEach(room => {
        if (!roomDiscovery[room.key]?.()) return;

        const isCurrent = room.key === currentMapRoom;
        const rx = room.x * CELL;
        const ry = room.y * CELL;
        const rw = room.w * CELL;
        const rh = room.h * CELL;

        ctx.fillStyle = isCurrent ? 'rgba(180,120,0,0.8)' : 'rgba(100,20,30,0.85)';
        ctx.fillRect(rx, ry, rw, rh);

        ctx.strokeStyle = isCurrent ? '#c9a84c' : 'rgba(180,140,40,0.6)';
        ctx.lineWidth = isCurrent ? 2 : 1;
        ctx.strokeRect(rx, ry, rw, rh);

        const fontSize = Math.max(8, Math.min(rw, rh) / 3);
        ctx.font = `${fontSize}px serif`;
        ctx.fillStyle = isCurrent ? '#ffffff' : '#c9a84c';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.label, rx + rw / 2, ry + rh / 2);

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

async function checkWireSolved() {
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

// ---- SAVE SYSTEM ----
const SAVE_KEY = 'escapeTribble_save';

function saveGame(currentPageId) {
    const inventoryState = {};
    document.querySelectorAll('.inv-item').forEach(item => {
        if (item.id) {
            inventoryState[item.id] = !item.classList.contains('hidden');
        }
    });

    const wireSave = {
        initialized: wirePuzzleInitialized,
        solved: state.solvedWirePuzzle,
        connections: wirePuzzleInitialized ? { ...wireConnections } : {},
        leftNodes: wirePuzzleInitialized ? wireLeftNodes.map(n => ({ ...n })) : [],
        rightNodes: wirePuzzleInitialized ? wireRightNodes.map(n => ({ ...n })) : [],
    };

    const saveData = {
        state: { ...state },
        currentPage: currentPageId,
        inventory: inventoryState,
        wire: wireSave,
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
        console.error('Autosave failed:', e);
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;

        const saveData = JSON.parse(raw);

        // Restore state
        Object.keys(saveData.state).forEach(key => {
            state[key] = saveData.state[key];
        });

        // Restore inventory UI
        Object.entries(saveData.inventory).forEach(([id, visible]) => {
            const el = document.getElementById(id);
            if (el) {
                visible ? el.classList.remove('hidden') : el.classList.add('hidden');
            }
        });

        // Restore wire puzzle
        if (saveData.wire.initialized) {
            wirePuzzleInitialized = true;
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
            wireLeftNodes = saveData.wire.leftNodes;
            wireRightNodes = saveData.wire.rightNodes;
            wireConnections = saveData.wire.connections;
            wireDragging = false;
            wireDragStart = null;
            wireDragCurrent = null;
            wireErrorFlash = false;
            setupWireCanvasEvents();
        }

        if (saveData.wire.solved) {
            document.getElementById('wire-solved-popup').classList.add('hidden');
        }

        return saveData;
    } catch (e) {
        console.error('Load failed:', e);
        return false;
    }
}

function hasSaveFile() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}

init();