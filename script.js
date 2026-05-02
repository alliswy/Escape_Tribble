//PERSONAL NOTE: paste the following into console on inspection for ease of testing
// Object.keys(state).forEach(key => state[key] = true);
//
// // Show all key images in the inventory UI
// document.querySelectorAll('.inv-item').forEach(item => item.classList.remove('hidden'));
//
// console.log("God Mode Activated: All keys obtained and doors unlocked.");

/* TODO
    - add missing pages/fix temp pages:
        - projector page
        - cw temp page
        - cw missing connection pages
        - etc.
    - make sure save system is localized, since Stephen made it and idk how it works
    - finish adding sounds (just go through the game and add them as needed)
    - finish the cr ghost interactions
    - check that everything desired in the library is added
    - tutorial
        - add hints
        - move hitbox logic into state updating functions
    - make sure all sound volumes are balanced
    - add final pages in the game (tunnels, escape) -- figure out how I want to do this
    - connect end of game to the credits/thank you for playing page
    - add photo of outside of tribble somewhere in the game
    - add emojis for the temp inv items
    - check all png's work
    - make sure game will work if a lot of people go to play it at once
    - add better page transitions in the menu and loading screen
    - add credits/contact pages
    - Before loading, or while loading I want a memo saying:
        1)    This game is designed for desktop use. Mobile devices may not display or function correctly. For the best experience, please play on a computer.
        2)    If you're a student, for the best experience, play while sitting alone in the Tribble basement late in the evening.
    - launch the game on google !!
 */





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
    hasAptKey: false,
    hasWb: false,

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
    aptUnlocked: false,

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
    discoveredTu: false,
    discoveredWr: false,
    discoveredBath: false,
    discoveredSnh: false,
    discoveredOh1: false,
    discoveredOh2: false,
    discoveredOh3: false,
    discoveredPrint: false,
    discoveredApt: false,

    solvedWirePuzzle: false,
    foundPtCode: false,
    foundWrNote: false,
    foundOctagon: false,
    foundScanner: false,
    foundLiClue: false,
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
    cameraAccessed: false,

    //library/misc
    movedAnimals: false,
    scannedBook: false,
    loMonitorUnlocked: false,
    usedDrive: false,
    hatchOpen: false,

    //stuff for feedback checks
    visitedPages: {},
    notificationsSeen: {},

    currTutorialStep: "init",
    isTutorialActive: false,
    isWbOpen: false,
    canPickUpBottle: false,
    currentPage: "",
    prevPage: "",
    filledBottle: false,

    gameCompleted: false,
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

const startButton = document.getElementById('start-button');
const infoButton = document.getElementById('info-button');
const loadSaveButton = document.getElementById('load-save-button');
const play = document.getElementById('play');
const allPages = document.querySelectorAll('.fit');
const inventoryTab = document.getElementById('inventory-tab');

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
    cwDoor: {audio: new Audio('sounds/cw-door.m4a'), baseVol: 0.3},
    doorOpenClose: {audio: new Audio('sounds/door-open-close.mp3'), baseVol: 0.5},
    doorClose: {audio: new Audio('sounds/door-close.mp3'), baseVol: 0.5},
    steps: {audio: new Audio('sounds/steps.mp3'), baseVol: 0.5},
    markerWhiteboard: {audio: new Audio('sounds/marker-whiteboard.mp3'), baseVol: 0.5},
    stiffPaper: {audio: new Audio('sounds/paper-1.mp3'), baseVol: 0.5},
    floppyPaper: {audio: new Audio('sounds/paper-2.mp3'), baseVol: 0.3},

    scanner: {audio: new Audio('sounds/scanner.mp3'), baseVol: 0.5},
    keypadBeep: {audio: new Audio('sounds/keypad-beep.mp3'), baseVol: 0.5},
    keycardSwipe: {audio: new Audio('sounds/keycard-swipe.mp3'), baseVol: 0.5},
    accessBeep: {audio: new Audio('sounds/access-beep.mp3'), baseVol: 0.5},
    errorBeep: {audio: new Audio('sounds/error-beep.mp3'), baseVol: 0.5},
    lightFlicker: {audio: new Audio('sounds/light-flicker.mp3'), baseVol: 0.5},

    //apartment sfx
    aptDoor: {audio: new Audio('sounds/apt-door.mp3'), baseVol: 0.5},
    fillBottle: {audio: new Audio('sounds/fill-bottle.mp3'), baseVol: 0.5},
    ambientNoise: {audio: new Audio('sounds/ambient-noise.m4a'), baseVol: 0.8},
    aptAmbience: {audio: new Audio('sounds/apt-ambience.mp3'), baseVol: 0.5},
    spookyMusic: {audio: new Audio('sounds/spooky-music.mp3'), baseVol: 0.03},

    //book drop and pr sounds
    hatch: {audio: new Audio('sounds/hatch.mp3'), baseVol: 1},
    grabBook: {audio: new Audio('sounds/grab-book.mp3'), baseVol: 0.5},
    bdBook: {audio: new Audio('sounds/bd-book.mp3'), baseVol: 0.5},
    pwBook: {audio: new Audio('sounds/open-book.mp3'), baseVol: 0.5},

    //library sounds
    bones: {audio: new Audio('sounds/bones.mp3'), baseVol: 1},

    //cr sounds
    ghostSound: {audio: new Audio('sounds/Ghost-sound.mp3'), baseVol: 0.3},
    keyboard: {audio: new Audio('sounds/keyboard-click.mp3'), baseVol: 0.75},

    //cw sound
    printPage: {audio: new Audio('sounds/printPage.m4a'), baseVol: 0.1},

    //etc sounds
    driveNotif: {audio: new Audio('sounds/drive-notif.mp3'), baseVol: 0.5},
    paperTowel: {audio: new Audio('sounds/paper-towel.mp3'), baseVol: 0.5},
    bottleOpen: {audio: new Audio('sounds/bottle-open.mp3'), baseVol: 0.5},
    prBuzzing: {audio: new Audio('sounds/pr-buzzing.m4a'), baseVol: 0.5},

};

// Slightly slow down menu/end spooky track for mood.
const SPOOKY_PLAYBACK_RATE = 0.9;
sfx.spookyMusic.audio.defaultPlaybackRate = SPOOKY_PLAYBACK_RATE;
sfx.spookyMusic.audio.playbackRate = SPOOKY_PLAYBACK_RATE;


// ------  SOUNDS FUNCTIONS ---------
function getSFXMultiplier() {
    const slider = document.getElementById('sfx-slider');
    return slider ? parseFloat(slider.value) / 50 : 1.0;
}

function getMusicMultiplier() {
    const slider = document.getElementById('music-slider'); // Your music slider ID
    return slider ? parseFloat(slider.value) / 50 : 1.2; // Defaulting to 1.2 for "extra loud"
}

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
        // Keep music tracks fully controlled by the music slider.
        if (key === 'ambientNoise' || key === 'aptAmbience' || key === 'spookyMusic') continue;

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

    // 1. Update all raw music files in the sfx warehouse
    ['ambientNoise', 'aptAmbience', 'spookyMusic'].forEach((id) => {
        const entry = sfx[id];
        if (!entry?.audio) return;
        const finalVol = entry.baseVol * multiplier;
        entry.audio.volume = Math.min(Math.max(finalVol, 0), 1);
    });

    // 2. Update any clips tagged as music
    for (let page in pageSounds) {
        const data = pageSounds[page];
        if (data.clip && data.type === 'music') {
            data.clip.volume = Math.min(Math.max(data.volume * multiplier, 0), 1);
        }
    }
}


function createSoundClip(
    sfxEntry,
    volume = 1,
    loop = true,
    startCrop = 0,
    endCrop = 0
) {
    return {
        clip: sfxEntry.audio,
        volume,
        loop,
        startCrop,
        endCrop
    };
}

const pageSounds = {
    globalAmbience: {
        ...createSoundClip(sfx.ambientNoise, 0.8, true, 1.5, 1.5),
        type: 'music',
        isGlobal: true
    },
    tutorialAmbience: {   // NEW
        ...createSoundClip(sfx.aptAmbience, 0.10, true, 1.5, 1),
        type: 'music',
        isGlobal: true
    },
    spookyMusic: {   // NEW
        ...createSoundClip(sfx.spookyMusic, 0.02, true, 0.01, 0.02),
        type: 'music',
        isGlobal: true
    },

    'bath-page': createSoundClip(sfx.sinkWater, 0.04, true, 0.5, 1),
    'bath-sink-page': createSoundClip(sfx.sinkWater, 0.09, true, 0.5, 1),
    'pr-pw-book-projector-on-page': createSoundClip(sfx.prBuzzing, 1.2, true, 0.5, 6),
    'pr-pw-noBook-projector-on-page': createSoundClip(sfx.prBuzzing, 1.2, true, 0.5, 6),

    unlock: createSoundClip(sfx.unlock, 0.5, false, 0.4, 3.9),
    doorClose: createSoundClip(sfx.doorClose, 0.7, false, 1.03, 0),
    keycardSwipe: createSoundClip(sfx.keycardSwipe, 0.5, false, 1.4, 9.9),
    accessBeep: createSoundClip(sfx.accessBeep, 0.5, false, 0, 0.6),
    steps: createSoundClip(sfx.steps, 0.5, false, 0.5, 9),
    markerWhiteboard: createSoundClip(sfx.markerWhiteboard, 0.3, false, 3, 53),
    lightFlicker: createSoundClip(sfx.lightFlicker, 0.5, false, 8, 11),

    //apartment sounds
    aptDoorOpen: createSoundClip(sfx.aptDoor, 0.5, false, 0.2, 3.8),
    aptDoorClose: createSoundClip(sfx.aptDoor, 0.5, false, 3, 1),
    fillBottle: createSoundClip(sfx.fillBottle, 0.5, false, 1, 20.5),

    //bd and pr sounds
    bdBookOpen: createSoundClip(sfx.bdBook, 0.5, false, 0, 7.5),
    bdBookClose: createSoundClip(sfx.bdBook, 0.5, false, 7.5, 0),
    hatchOpen: createSoundClip(sfx.hatch, 1, false, 0, 0.3),
    hatchClose: createSoundClip(sfx.hatch, 1, false, 0.3, 0),
    grabBook: createSoundClip(sfx.grabBook, 0.5, false, 2.2, 15.4),
    pwBook: createSoundClip(sfx.pwBook, 0.5, false, 0, 8),

    //library sounds
    bones: createSoundClip(sfx.bones, 1, false, 1, 3),

    //cw sounds
    openBathDoor: createSoundClip(sfx.doorOpenClose, 0.5, false,0, 2,),
    paperTowel: createSoundClip(sfx.paperTowel, 0.2, false, 0,13.9),
    cwDoor: createSoundClip(sfx.cwDoor, 0.2, false, 2.5, 0),
    bottleOpen: createSoundClip(sfx.bottleOpen, 0.3, false, 1, 6),
};

let activeGlobalLoop = null;
let activeRoomLoop = null;
const AUDIO_UNLOCK_KEY = 'audioUnlockedByInteraction';

let currentGlobalId = null;
let currentRoomId = null;
let userHasInteractedWithPage =
    localStorage.getItem(AUDIO_UNLOCK_KEY) === 'true';
let autoplayRecoveryInterval = null;
let autoplayRecoveryAttempts = 0;
let hasShownAutoplayBlockedWarning = false;

function hasBlockedTrackedAudio() {
    const globalClip = currentGlobalId ? pageSounds[currentGlobalId]?.clip : null;
    const roomClip = currentRoomId ? pageSounds[currentRoomId]?.clip : null;

    return Boolean(
        (globalClip?.paused && globalClip?.blockedByAutoplay) ||
        (roomClip?.paused && roomClip?.blockedByAutoplay)
    );
}

function scheduleAutoplayRecovery() {
    if (autoplayRecoveryInterval) return;

    autoplayRecoveryAttempts = 0;
    autoplayRecoveryInterval = setInterval(() => {
        autoplayRecoveryAttempts++;
        resumeBlockedAudioIfNeeded();

        // Keep retrying briefly for flaky browser/device readiness after reload.
        if (!hasBlockedTrackedAudio() || autoplayRecoveryAttempts >= 20) {
            clearInterval(autoplayRecoveryInterval);
            autoplayRecoveryInterval = null;
            autoplayRecoveryAttempts = 0;
        }
    }, 250);
}

function resumeBlockedAudioIfNeeded() {
    if (currentGlobalId) {
        const globalSound = pageSounds[currentGlobalId];
        if (globalSound?.clip?.paused) {
            safePlay(globalSound.clip, { suppressAutoplayWarning: false });
        }
    }

    if (currentRoomId) {
        const roomSound = pageSounds[currentRoomId];
        if (roomSound?.clip?.paused) {
            safePlay(roomSound.clip, { suppressAutoplayWarning: false });
        }
    }
}

function markUserInteraction() {
    userHasInteractedWithPage = true;
    localStorage.setItem(AUDIO_UNLOCK_KEY, 'true');
    resumeBlockedAudioIfNeeded();
}

window.addEventListener('pointerdown', markUserInteraction);
window.addEventListener('keydown', markUserInteraction);
window.addEventListener('touchstart', markUserInteraction, { passive: true });
window.addEventListener('focus', resumeBlockedAudioIfNeeded);
window.addEventListener('pageshow', resumeBlockedAudioIfNeeded);

function safePlay(audio, { suppressAutoplayWarning = true } = {}) {
    if (!audio) return false;

    const playPromise = audio.play();
    if (!playPromise || typeof playPromise.catch !== 'function') {
        audio.blockedByAutoplay = false;
        return true;
    }

    playPromise
        .then(() => {
            audio.blockedByAutoplay = false;
            hasShownAutoplayBlockedWarning = false;
        })
        .catch(err => {
            const isAutoplayBlock = err?.name === 'NotAllowedError';
            if (isAutoplayBlock) {
                audio.blockedByAutoplay = true;

                // Best-effort recovery: many browsers allow muted autoplay
                // after refresh if the user has previously interacted with the site.
                if (userHasInteractedWithPage) {
                    const wasMuted = audio.muted;
                    audio.muted = true;
                    const mutedRetry = audio.play();

                    if (mutedRetry && typeof mutedRetry.then === 'function') {
                        mutedRetry
                            .then(() => {
                                audio.blockedByAutoplay = false;
                                // Let playback stabilize, then restore mute state.
                                setTimeout(() => {
                                    audio.muted = wasMuted;
                                }, 120);
                            })
                            .catch(() => {
                                audio.muted = wasMuted;
                            });
                    } else {
                        audio.muted = wasMuted;
                    }
                }

                scheduleAutoplayRecovery();
                if (!suppressAutoplayWarning && !hasShownAutoplayBlockedWarning) {
                    console.warn('Audio autoplay blocked until user interaction.');
                    hasShownAutoplayBlockedWarning = true;
                }
                return;
            }

            console.error('Audio play failed:', err);
        });

    return true;
}

const SILENT_AUDIO_PAGES = new Set([]);
const SPOOKY_AUDIO_PAGES = new Set([
    'menu-screen',
    'info-screen',
    'settings-screen',
    'end-progression-page',
    'end-video-page',
    'thanks-page'
]);

function stopGlobalAudio() {
    if (activeGlobalLoop) {
        cancelAnimationFrame(activeGlobalLoop);
        activeGlobalLoop = null;
    }

    currentGlobalId = null;

    ['globalAmbience', 'tutorialAmbience', 'spookyMusic'].forEach(id => {
        const sound = pageSounds[id];
        if (!sound?.clip) return;

        const audio = sound.clip;

        if (audio.activeFade) {
            clearInterval(audio.activeFade);
            audio.activeFade = null;
        }

        if (audio.actionTimer) {
            clearTimeout(audio.actionTimer);
            audio.actionTimer = null;
        }

        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
    });
}

function getDesiredGlobalAudioId(pageId = state.currentPage) {
    if (!pageId || SILENT_AUDIO_PAGES.has(pageId)) return null;

    if (pageId === 'printer-sync-minigame') return 'globalAmbience';

    if (SPOOKY_AUDIO_PAGES.has(pageId)) return 'spookyMusic';

    if (state.isTutorialActive) return 'tutorialAmbience';

    const pageEl = document.getElementById(pageId);
    const isGameplayPage = !!pageEl?.classList.contains('fit');
    if (isGameplayPage) return 'globalAmbience';

    return 'spookyMusic';
}

function startGlobalAudio(pageId = state.currentPage, options = {}) {
    const { forceRestart = false } = options;
    const desiredGlobalId = getDesiredGlobalAudioId(pageId);

    if (!desiredGlobalId) {
        stopGlobalAudio();
        return;
    }

    if (
        !forceRestart &&
        currentGlobalId === desiredGlobalId &&
        isPlaying(desiredGlobalId)
    ) {
        return;
    }

    if (currentGlobalId && currentGlobalId !== desiredGlobalId) {
        stopGlobalAudio();
    }

    triggerSound(desiredGlobalId, { fadeIn: 2000 });
}

function setVolume(id, newVolume) {
    const sound = pageSounds[id];
    if (!sound?.clip) return;

    const multiplier =
        sound.type === 'music'
            ? getMusicMultiplier()
            : getSFXMultiplier();

    sound.clip.volume = Math.min(
        Math.max(newVolume * multiplier, 0),
        1
    );
}

function setRoomAudio(pageId) {
    const sound = pageSounds[pageId];
    const ambience = pageSounds.globalAmbience.clip;

    if (pageId === 'bath-page') {
        ambience.volume = getMusicMultiplier() * 0.3;
    } else if (pageId === 'bath-sink-page') {
        ambience.volume = getMusicMultiplier() * 0.2;
    } else {
        ambience.volume = getMusicMultiplier();
    }

    if (currentRoomId && currentRoomId !== pageId) {
        stopSound(currentRoomId);
    }

    if (!sound) {
        currentRoomId = null;
        return;
    }

    if (sound.isGlobal) return;

    triggerSound(pageId);
}

function triggerSound(id, options = {}) {
    const fadeInDuration = options.fadeIn || 0;
    const sound = pageSounds[id];

    if (sound) {
        const {
            clip,
            volume,
            loop,
            startCrop,
            endCrop,
            type,
            isGlobal
        } = sound;

        const multiplier =
            type === 'music'
                ? getMusicMultiplier()
                : getSFXMultiplier();

        const targetVolume = Math.min(
            Math.max(volume * multiplier, 0),
            1
        );

        if (clip.activeFade) {
            clearInterval(clip.activeFade);
            clip.activeFade = null;
        }

        if (clip.actionTimer) {
            clearTimeout(clip.actionTimer);
            clip.actionTimer = null;
        }

        const startPlayback = () => {
            if (id === 'spookyMusic') {
                clip.defaultPlaybackRate = SPOOKY_PLAYBACK_RATE;
                clip.playbackRate = SPOOKY_PLAYBACK_RATE;
            }
            clip.pause();
            clip.currentTime = startCrop;
            safePlay(clip);
        };

        const applyFadeIn = () => {
            if (fadeInDuration <= 0) {
                clip.volume = targetVolume;
                return;
            }

            clip.volume = 0;

            const steps = 30;
            const interval = fadeInDuration / steps;
            let step = 0;

            clip.activeFade = setInterval(() => {
                step++;

                clip.volume = Math.min(
                    targetVolume * (step / steps),
                    targetVolume
                );

                if (step >= steps) {
                    clearInterval(clip.activeFade);
                    clip.activeFade = null;
                }
            }, interval);
        };

        clip.loop = false;

        if (loop) {
            if (isGlobal) {
                if (currentGlobalId === id) return;

                if (activeGlobalLoop) {
                    cancelAnimationFrame(activeGlobalLoop);
                    activeGlobalLoop = null;
                }

                currentGlobalId = id;
            } else {
                if (currentRoomId === id) return;

                if (activeRoomLoop) {
                    cancelAnimationFrame(activeRoomLoop);
                    activeRoomLoop = null;
                }

                currentRoomId = id;
            }

            startPlayback();
            applyFadeIn();

            const monitorLoop = () => {
                if (isGlobal) {
                    if (currentGlobalId !== id) return;
                } else {
                    if (currentRoomId !== id) return;
                }

                // Safety net: if the browser hits the natural end before
                // our crop check, force playback back into a loop.
                if (clip.paused || clip.ended) {
                    if (clip.blockedByAutoplay && !userHasInteractedWithPage) {
                        if (isGlobal) {
                            activeGlobalLoop =
                                requestAnimationFrame(monitorLoop);
                        } else {
                            activeRoomLoop =
                                requestAnimationFrame(monitorLoop);
                        }
                        return;
                    }
                    clip.currentTime = startCrop;
                    safePlay(clip);
                }

                if (
                    clip.duration &&
                    clip.currentTime >= clip.duration - endCrop
                ) {
                    clip.currentTime = startCrop;
                    if (clip.paused) safePlay(clip);
                }

                if (isGlobal) {
                    activeGlobalLoop =
                        requestAnimationFrame(monitorLoop);
                } else {
                    activeRoomLoop =
                        requestAnimationFrame(monitorLoop);
                }
            };

            if (isGlobal) {
                activeGlobalLoop =
                    requestAnimationFrame(monitorLoop);
            } else {
                activeRoomLoop =
                    requestAnimationFrame(monitorLoop);
            }

            return;
        }

        startPlayback();
        applyFadeIn();

        const playDuration =
            (clip.duration - startCrop - endCrop) * 1000;

        if (playDuration > 0) {
            clip.actionTimer = setTimeout(() => {
                clip.pause();
                clip.currentTime = startCrop;
            }, playDuration);
        }

        return;
    }

    if (sfx[id]) {
        const entry = sfx[id];
        const audio = entry.audio;

        const targetVolume = Math.min(
            Math.max(
                entry.baseVol * getSFXMultiplier(),
                0
            ),
            1
        );

        audio.pause();
        audio.currentTime = 0;
        safePlay(audio);
        audio.volume = targetVolume;
    }
}

function stopSound(id, fadeDuration = 50) {
    const sound = pageSounds[id];
    if (!sound?.clip) return;
    if (sound.isGlobal) return;

    const audio = sound.clip;

    const startVolume = audio.volume;
    const steps = 20;
    const interval = fadeDuration / steps;

    let step = 0;

    if (audio.activeFade) {
        clearInterval(audio.activeFade);
    }

    audio.activeFade = setInterval(() => {
        step++;

        audio.volume = Math.max(
            0,
            startVolume * (1 - step / steps)
        );

        if (step >= steps) {
            clearInterval(audio.activeFade);
            audio.activeFade = null;

            audio.pause();
            audio.currentTime = 0;
        }
    }, interval);

    if (currentRoomId === id) {
        currentRoomId = null;
    }
}
function stopAllAudio() {
    // 1. Kill the loops immediately so they don't trigger a restart
    if (activeGlobalLoop) {
        cancelAnimationFrame(activeGlobalLoop);
        activeGlobalLoop = null;
    }
    if (activeRoomLoop) {
        cancelAnimationFrame(activeRoomLoop);
        activeRoomLoop = null;
    }

    currentGlobalId = null;
    currentRoomId = null;

    Object.values(pageSounds).forEach(sound => {
        if (!sound?.clip) return;

        // REMOVED: if (sound.isGlobal) return;
        // We want global sounds to stop now too.

        const audio = sound.clip;

        // 2. Clear all active logic/fades
        if (audio.activeFade) {
            clearInterval(audio.activeFade);
            audio.activeFade = null;
        }
        if (audio.actionTimer) {
            clearTimeout(audio.actionTimer);
            audio.actionTimer = null;
        }

        // 3. Hard Stop
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0; // Silences any hardware buffer trails
    });

    // 4. Also stop the raw SFX library sounds just in case
    Object.values(sfx).forEach(entry => {
        if (entry.audio) {
            entry.audio.pause();
            entry.audio.currentTime = 0;
        }
    });
}

function isPlaying(id) {
    // Check pageSounds first
    let sound = pageSounds[id]?.clip;

    // Fallback to sfx library if not in pageSounds
    if (!sound) {
        sound = sfx[id]?.audio;
    }

    if (!sound) return false;

    // A sound is playing if it's not paused AND not finished
    return !sound.paused && !sound.ended;
}



// ----- NAVIGATION MAP -----
const roomLeads = {
    // Book Drop (BD)
    'mh-bd-main-page':           { right: 'mh-bd-right-endc-page', left: 'mh-bd-left-endc-page' },
    'mh-bd-door-page':           { back: 'mh-bd-main-page' },
    'bd-door-open-page':      { back: 'mh-bd-main-page', audio: {back: 'doorClose'} },
    'mh-bd-slot-closed-page':    { back: 'mh-bd-door-page' },
    'mh-bd-door-handle-page':    { back: 'mh-bd-door-page' },
    'mh-bd-slot-open-key-page':  { back: 'mh-bd-slot-closed-page' },
    'mh-bd-slot-open-page':      { back: 'mh-bd-slot-closed-page' },
    'bd-cart-page':           { back: 'bd-door-open-page'},
    'bd-back-door-handle-page': { back: 'bd-door-open-page' },
    'bd-books-page':          { back: 'bd-cart-page' },
    'bd-fb-open-key-page':    { back: 'bd-books-page' },
    'bd-fb-open-page':        { back: 'bd-books-page' },
    'bd-back-door-open-page': { back: 'bd-door-open-page', audio: {back: 'doorClose'} },

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
    'mh-sl-right-endc-page':    { forward: 'mh-hall-right-endc-page' },
    'mh-hall-right-endc-page':  { back: 'mh-sl-right-endc-page', forward: 'mh-bh-right-endc-page' },
    'mh-bh-right-endc-page':    { back: 'mh-hall-right-endc-page', forward: 'mh-trash-right-endc-page', left: 'mh-bh-exit-page' },
    'mh-trash-right-endc-page': { back: 'mh-bh-right-endc-page', forward: 'mh-bd-right-endc-page' },
    'mh-bd-right-endc-page':    { back: 'mh-trash-right-endc-page', forward: 'mh-li-right-endc-page' },
    'mh-li-right-endc-page':    { back: 'mh-bd-right-endc-page', forward: 'mh-cend-right-endc-kc-page'},
    'mh-cend-right-endc-kc-page': { back: 'mh-li-right-endc-page', right: 'mh-ki-door-closed-page' },

    // 'mh-sl-right-endc-page':    { forward: 'mh-hall-right-endc-page', left: 'mh-sld-page' },
    // 'mh-bh-right-endc-page':    { back: 'mh-hall-right-endc-page', forward: 'mh-trash-right-endc-page', right: 'bh-entrance-page', left: 'mh-bh-exit-page' },
    // 'mh-bd-right-endc-page':    { back: 'mh-trash-right-endc-page', forward: 'mh-li-right-endc-page', left: 'mh-bd-main-page' },
    // 'mh-li-right-endc-page':    { back: 'mh-bd-right-endc-page', forward: 'mh-cend-right-endc-kc-page', left: 'mh-li-door-closed-page', right: 'mh-tu-stairs-door-page' },

    'mh-tu-stairs-door-page':    {left: 'mh-li-right-endc-page', right: 'mh-li-left-endc-page'},

    // Main Hall (Left Side)
    'mh-cend-left-endc-page':   { forward: 'mh-li-left-endc-page', left: 'mh-ki-door-closed-page', back: 'stairs-aw-door-page', audio: {back: 'cwDoor'} },
    'mh-li-left-endc-page':     { back: 'mh-cend-left-endc-page', forward: 'mh-bd-left-endc-page', left: 'mh-tu-stairs-door-page' },
    'mh-bd-left-endc-page':     { back: 'mh-li-left-endc-page', forward: 'mh-bh-left-endc-page' },
    'mh-bh-left-endc-page':     { back: 'mh-bd-left-endc-page', forward: 'mh-hall-left-endc-page', right: 'mh-bh-exit-page'},
    'mh-hall-left-endc-page':   { back: 'mh-bh-left-endc-page', forward: 'mh-sl-left-endc-page' },
    'mh-sl-left-endc-page':     { back: 'mh-hall-left-endc-page', forward: 'mh-left-end-page' },
    'mh-left-end-page':         {back: 'mh-sl-left-endc-page', right: 'mh-left-end-rd-page'},
    'mh-left-end-rd-page':      {right: 'mh-sl-right-endc-page', left: 'mh-left-end-page'},

    // 'mh-li-left-endc-page':     { back: 'mh-cend-left-endc-page', forward: 'mh-bd-left-endc-page', right: 'mh-li-door-closed-page', left: 'mh-tu-stairs-door-page' },
    // 'mh-bd-left-endc-page':     { back: 'mh-li-left-endc-page', forward: 'mh-bh-left-endc-page', right: 'mh-bd-main-page' },
    // 'mh-bh-left-endc-page':     { back: 'mh-bd-left-endc-page', forward: 'mh-hall-left-endc-page', left: 'bh-entrance-page', right: 'mh-bh-exit-page'},
    // 'mh-sl-left-endc-page':     { back: 'mh-hall-left-endc-page', right: 'mh-sld-page', forward: 'mh-left-end-page' },

    'mh-sld-page':            { left: 'mh-sl-left-endc-page', right: 'mh-sl-right-endc-page' },

    // back hall
    'bh-entrance-page':       { left: 'mh-bh-right-endc-page', right: 'mh-bh-left-endc-page' },
    'bh-2-page':              { back: 'bh-entrance-page', forward: 'bh-3-page' },
    'bh-3-page':              { back: 'bh-2-page', forward: 'bh-4-page' },
    'bh-4-page':            { back: 'bh-3-page', forward: 'bh-end-page', left: 'sh-entrance-page'},
    'sh-entrance-page':   {back: 'bh-4-page', left: 'bh-rev-1-page'},
    'bh-rev-1-page':            {forward: 'bh-rev-2-page', right: 'sh-entrance-page'},
    'bh-rev-2-page':            {back: 'bh-rev-1-page', forward: 'bh-rev-3-page'},
    'bh-rev-3-page':            {back: 'bh-rev-2-page', forward: 'bh-rev-4-page'},
    'bh-rev-4-page':            {back: 'bh-rev-3-page', forward: 'mh-bh-exit-page'},
    'mh-bh-exit-page':          {back: 'bh-rev-4-page', right: 'mh-bh-right-endc-page', left: 'mh-bh-left-endc-page'},
    'sh-cr-dc-page':      {back: 'sh-entrance-page'},
    'bh-end-page':          {back: 'bh-4-page'},
    'sh-cr-do-page':      {back: 'sh-entrance-page'},
    'sh-cr-door-open-page':    {back: 'sh-cr-do-page', right: 'sh-main-page'},
    'sh-cr-door-closed-page':   {back: 'sh-cr-dc-page', right: 'sh-main-page'},
    'sh-cr-door-handle-page':    {back: 'sh-cr-door-closed-page'},
    'sh-cr-door-keypad-page':    {back: 'sh-cr-door-handle-page'},
    'sh-main-page':        {back: () => state.crDoorOpen ? 'sh-cr-do-page':'sh-cr-dc-page'},

    //creepy room
    'cr-main-2dc-page':     {back: 'sh-cr-door-open-page'},
    'cr-main-1dc-page':     {back: 'sh-cr-door-open-page'},
    'cr-main-page':         {back: 'sh-cr-door-open-page'},
    'cr-doors-2dc-page':    {back: 'cr-main-2dc-page'},
    'cr-doors-1dc-page':    {back: 'cr-main-1dc-page'},
    'cr-doors-1dc-cam-page': {back: 'cr-main-1dc-page'},
    'cr-doors-1dc-ld-page':  {back: () => state.isLeftMonitorOn ? 'cr-doors-1dc-cam-page': 'cr-doors-1dc-page'},
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
    'clr-cloth-page':       {back: () => state.hasWrId ? 'clr-main-page' : 'clr-main-id-page'},
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
    'camr-ml-on-page':          {back: () => state.crlDoorOpen ? 'camr-main-ml-on-page':'camr-main-ml-on-person-page' },
    'camr-ml-on-person-page':   {back: 'camr-main-ml-on-person-page'},
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
    'ki-door-open-page':       {back: 'mh-ki-door-closed-page', audio: {back: 'doorClose'}},
    'ki-entrance-page':        {back: 'ki-door-open-page'},
    'ki-entrance-code-page':   {back: 'ki-door-open-page'},
    'ki-main-code-page':       {back: 'ki-entrance-code-page'},
    'ki-main-noCode-page':      {back: 'ki-entrance-page'},
    'ki-entrance-noCode-page':  {back: 'ki-entrance-page'},
    'ki-pt-code-page':          {back: 'ki-main-code-page'},
    'ki-pt-noCode-page':        {back: 'ki-main-noCode-page'},

    //cw stairs pages
    'stairs-up-page': {back: 'cw-stairs-door-page', forward: 'stairs-aw-door-page', audio: {back: 'cwDoor'}},
    'stairs-aw-door-page': {back: 'stairs-up-page', left: 'stairs-rubble-page', audio: {back: 'steps'}},
    'stairs-rubble-page': {back: 'mh-cend-right-endc-kc-page', right: 'stairs-aw-door-page', audio: {back: 'cwDoor'}},
    'stairs-page':        {back: 'stairs-rubble-page'},


    //c-wing left-progression/entrance/snack hall
    'stairs-cw-door-page':          {back: 'stairs-page', audio: {back: 'steps'}},
    'stairs-cw-door-plate-page':    {back: 'stairs-cw-door-page'},
    'cw-stairs-door-page':       {back: 'cw-stairs-entrance-page'},
    'cw-stairs-entrance-page':      {right: 'cw-left-bath-page', left: 'cw-right-aw-page'},
    'cw-entrance-page':         {back: 'stairs-cw-door-page', audio: {back: 'cwDoor'}, forward: 'cw-entrance-2-page'},
    'cw-entrance-2-page':       {back: 'cw-entrance-page', forward: 'cw-entrance-3-page'},
    'cw-entrance-3-page':       {back: 'cw-entrance-2-page', left: 'cw-left-bath-page', right: 'cw-right-eh-page'},
    'cw-left-bath-page':    {back: 'cw-left-eh-page', forward: () => state.wrUnlocked ? 'cw-left-snh-wro-page': 'cw-left-snh-wrc-page'},
    'cw-left-snh-wrc-page':     {back:'cw-left-bath-page', forward: 'cw-wr-dc-page'},
    'cw-left-snh-wro-page':     {back: 'cw-left-bath-page', forward: 'cw-elevator-wr-do-page'},
    'cw-elevator-wr-do-page':   {back: 'cw-left-snh-wro-page', left: 'cw-elevator-page'},
    'cw-wr-dc-page':            {back: 'cw-left-snh-wrc-page', left: 'cw-elevator-page'},
    'snh-entrance-page':     {left: () => state.wrUnlocked ? 'cw-left-snh-wro-page': 'cw-left-snh-wrc-page', right: 'cw-right-snh-page'},
    'cw-left-eh-page':          {back: 'cw-left-2-page', forward: 'cw-left-bath-page'},
    'cw-left-1-page':           {forward: 'cw-left-2-page', right: 'cw-oh2-entrance-page', left: 'cw-oh2-exit-page'},
    'cw-left-2-page':           {back: 'cw-left-1-page', forward: 'cw-left-eh-page', right: 'cw-oh1-exit-1-page'},

    //c-wing right progression/hallways
    'cw-right-snh-page':        {forward: 'cw-right-bath-page', right: 'cw-elevator-page'},
    'cw-right-bath-page':       {back: 'cw-right-snh-page', forward: 'cw-right-aw-page'},
    'cw-right-aw-page':         {back: 'cw-right-bath-page', forward: 'cw-right-eh-page'},
    'cw-right-eh-page':          {back: 'cw-right-aw-page', forward: 'cw-right-oh1-page'},
    'cw-right-oh1-page':        {back: 'cw-right-eh-page', forward: 'cw-right-print-page', left:'cw-oh1-exit-1-page'},
    'cw-right-print-page':      {back: 'cw-right-oh1-page', forward: () => state.isPrinterCalibrated ? 'print-main-paper-page' :'print-main-page'},

    //c-wing side halls
    'print-main-page':          {back: 'cw-right-print-page'},
    'print-page':               {back: 'print-main-page'},
    'print-main-paper-page':    {back: 'cw-right-print-page'},
    'print-paper-page':         {back: 'print-main-paper-page'},
    'print-screen-page':        {back: () => state.isPrinterCalibrated ? 'print-paper-page' : 'print-page'},
    'cw-eh-entrance-page':      {forward: 'cw-eh-door-page', right: 'cw-right-eh-page', left: 'cw-left-eh-page'},
    'cw-eh-door-page':             {back: 'cw-eh-entrance-page'},
    'cw-eh-door-plate-page':       {back: 'cw-eh-door-page'},
    'cw-oh1-entrance-page':        {left: 'cw-right-oh1-page', right: 'cw-left-2-page'},
    'cw-oh2-exit-page':         {back: 'oh2-exit-page', left: 'cw-right-print-page', right: 'cw-left-1-page'},
    'oh1-left-1-page':          {left: 'oh1-exit-1-page', forward: 'oh1-left-2-page'},
    'oh1-left-2-page':          {back: 'oh1-left-1-page', forward: 'oh1-left-3-page'},
    'oh1-left-3-page':          {back: 'oh1-left-2-page', forward: () => state.hasClrKey ? 'oh1-left-4-page': 'oh1-left-4-key-page'},
    'oh1-left-4-page':          {back: 'oh1-left-3-page', right: 'oh1-right-1-page'},
    'oh1-left-4-key-page':      {back: 'oh1-left-3-page', right: 'oh1-right-1-page'},
    'oh1-right-1-page':         {forward: 'oh1-right-2-page', left: () => state.hasClrKey ? 'oh1-left-4-page': 'oh1-left-4-key-page'},
    'oh1-right-2-page':         {back: 'oh1-right-1-page', forward: 'oh1-right-3-page'},
    'oh1-right-3-page':         {back: 'oh1-right-2-page'},
    'oh1-exit-1-page':          {right: 'oh1-left-1-page'},
    'oh1-exit-2-page':          {right: 'oh1-left-2-page', left: 'oh1-right-2-page'},
    'oh1-books-page':           {back: 'oh1-left-4-page'},
    'oh1-books-key-page':       {back: 'oh1-left-4-key-page'},
    'cw-oh1-exit-1-page':       {back: 'oh1-exit-1-page', right: 'cw-right-oh1-page', left: 'cw-left-2-page'},

    'cw-oh2-entrance-page':     {back: 'oh1-exit-2-page', right: 'cw-right-print-page', left: 'cw-left-1-page'},
    'oh2-entrance-page':        {back: 'cw-oh2-entrance-page', right: 'oh2-oh3-entrance-page'},
    'oh2-oh3-entrance-page':    {forward: 'oh3-page', back: 'oh2-entrance-page', right: 'oh2-exit-page'},
    'oh3-page':                 {back: 'oh2-oh3-entrance-page'},
    'oh2-exit-page':            {left: 'oh2-oh3-entrance-page'},


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
    'li-entrance-page':          {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'},
    'li-entrance-nb-page':       {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'},
    'li-entrance-tvo-page':      {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'},
    'li-entrance-tvo-nb-page':   {back: 'li-door-open-page', right: () => state.isLiReadOn ? state.isLiTvOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-ro-page' : state.isLiTvOn ? 'li-main-2dc-tvo-page' :'li-main-2dc-page'},
    'li-2dc-page':               {back: () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page': 'li-main-2dc-page'},
    'li-main-2dc-page':          {back: 'li-entrance-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-2dc-ro-page':       {back: 'li-entrance-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-2dc-tvo-page':      {back: 'li-entrance-tvo-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-2dc-ro-tvo-page':   {back: 'li-entrance-tvo-page', right: 'li-main-rw-page', left: 'li-main-lw-page'},
    'li-main-rw-page':           {left:  () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page' : 'li-main-2dc-page'},
    'li-main-lw-page':           {back: () => state.hasLorBook ? state.isLiTvOn ? 'li-entrance-tvo-nb-page' : 'li-entrance-nb-page' : state.isLiTvOn ? 'li-entrance-tvo-page' : 'li-entrance-page', right: () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page' : 'li-main-2dc-page'},

    //library mid-wall pages
    'li-mid-wall-page':     {back: 'li-main-2dc-page'},
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
    'li-lt-star-page':      {back: () => state.scannedBook ? !state.hasSkPaper ? 'li-lt-sk-paper-page': 'li-left-lt-star-page' : 'li-left-lt-page'},
    'li-lt-sk-paper-page':  {}, //they're forced to take the paper
    'li-lt-sk-page':        {back: 'li-main-lw-sk-page'},
    'li-main-lw-sk-page':   {right: () => state.isLiTvOn ? state.isLiReadOn ? 'li-main-2dc-ro-tvo-page' : 'li-main-2dc-tvo-page' : state.isLiReadOn ? 'li-main-2dc-ro-page' : 'li-main-2dc-page'},
    'li-left-lt-star-page': {back: 'li-main-lw-page'},

    //mw books pages
    'li-mw-books-page':     {back: 'li-main-lw-page' },
    'li-mw-books-nb-page':  {back: 'li-main-lw-page'},
    'li-tolkein-page':      {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-esme-page':         {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-russo-page':        {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-ruta-page':         {back: () => state.hasLorBook ? 'li-mw-books-nb-page' :'li-mw-books-page'},
    'li-tolkein-nb-page':   {back: 'li-mw-books-nb-page'},

    //lw books page
    'li-rw-books-page':     {back: 'li-main-rw-page'},
    'li-lw-books-page':      {back: 'li-main-lw-page'},
    'li-onoseta-page':      {back: 'li-rw-books-page'},
    'li-barnes-page':         {back: 'li-rw-books-page'},
    'li-boulley-page':        {back: 'li-rw-books-page'},
    'li-alston-page':        {back: 'li-rw-books-page'},
    'li-smith-page':        {back: 'li-rw-books-page'},

    'li-rw-books-birb-page':   {back: 'li-main-rw-page'},
    'li-rw-books-birb-nb-page': {back: 'li-main-rw-page'},
    'li-birb-book-page':        {back: 'li-rw-books-birb-page'},
    'li-birb-page':             {back: 'li-rw-books-birb-nb-page'},

    //library office pages
    'li-office-door-closed-page':   {back: 'li-2dc-page'},
    'li-office-door-open-page':     {back: 'li-office-door-closed-page', audio: {back: 'doorClose'}},
    'lo-main-page':                 {back: 'li-office-door-open-page', left: 'lo-main-left-page'},
    'lo-main-left-page':            {right: 'lo-main-page'},
    'lo-storage-entrance-page':     {back: 'lo-main-left-page', forward: 'ls-in-1-page' },
    'lo-main-right-page':           {back: 'ls-lo-entrance-page' },
    'lo-desk-page':                 {back: 'lo-main-page'},
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


    //tutorial pages
    // 'apt-fd-handle-page':   {back: 'apt-fd-page'},
    //'apt-fd-open-page':     {back: 'apt-fd-page'},
    'apt-main-water-page':  {forward: 'apt-table-water-page'},
    'apt-table-water-page': {back: 'apt-main-water-page', left: 'apt-ki-entr-page', right: 'apt-bed-page'},
    'apt-table-page':       {left: 'apt-ki-entr-page', right: 'apt-bed-page'},
    'apt-ki-entr-page':     {forward: 'apt-ki-1-page', right: () => state.hasWb ? 'apt-table-page' : 'apt-table-water-page'},
    'apt-ki-1-page':        {back: 'apt-ki-entr-page', forward: 'apt-ki-2-page'},
    'apt-ki-2-page':        {back: 'apt-ki-1-page'},
    'apt-ki-sink-page':        {back: 'apt-ki-2-page', left: 'apt-ki-3-page'},
    'apt-sink-water-bottle-page': {back: 'apt-sink-page'},
    'apt-ki-3-page':        {forward: 'apt-ki-exit-page', right: 'apt-ki-sink-page'},
    'apt-ki-exit-page':     {back: 'apt-ki-3-page', forward: 'apt-bed-page'},
    'apt-bed-page':         {back: 'apt-ki-exit-page', left: () => state.hasWb ? 'apt-table-page' : 'apt-table-water-page'},
};


// ----- 3. CORE FUNCTIONS ----
function getDestination(direction, pageId) {
    return roomLeads[pageId]?.[direction] || null;
}

let lastPage = null; //tracks prev page

function normalizeFitPageScale(target) {
    if (!target || !target.classList.contains('fit')) return;

    const img = target.querySelector('img');
    if (!img) return;

    const applyScale = () => {
        const imgW = img.clientWidth;
        const imgH = img.clientHeight;
        if (!imgW || !imgH) return;

        // Scale the whole page (image + hitboxes) so relative hitbox placement is preserved.
        const maxScale = Math.min(window.innerWidth / imgW, window.innerHeight / imgH, 1.35);
        const scale = maxScale > 1.02 ? maxScale : 1;

        target.style.transformOrigin = "center center";
        target.style.transform = `scale(${scale})`;
    };

    if (img.complete) {
        requestAnimationFrame(applyScale);
    } else {
        img.addEventListener('load', () => requestAnimationFrame(applyScale), { once: true });
    }
}

async function showPage(pageId, useFade = false) {
    const run = async () => {
        const target = document.getElementById(pageId);
        if (!target) return;

        state.currentPage = pageId;
        state.prevPage = previousPageId = lastPage ? lastPage.id : null;

        if (lastPage) {
            lastPage.classList.add('hidden');
        } else {
            allPages.forEach(page => page.classList.add('hidden'));
        }

        target.classList.remove('hidden');
        normalizeFitPageScale(target);
        lastPage = target;

        const printerMinigame = document.getElementById('printer-sync-minigame');
        if (pageId !== 'print-screen-page' && printerMinigame && !printerMinigame.classList.contains('hidden')) {
            printerMinigame.classList.add('hidden');
            isRunning = false;
        }

        const currentPaths = roomLeads[pageId] || {};

        arrows.back.classList.toggle(
            'hidden',
            !currentPaths.back
        );

        arrows.forward.classList.toggle(
            'hidden',
            !currentPaths.forward
        );

        arrows.left.classList.toggle(
            'hidden',
            !currentPaths.left
        );

        arrows.right.classList.toggle(
            'hidden',
            !currentPaths.right
        );

        updateMap(pageId);
        triggerNotification(pageId);
        startGlobalAudio(pageId);

        // IMPORTANT: play audio immediately
        setRoomAudio(pageId);

        saveGame(pageId);
    };

    if (useFade) {
        await fadeTransition(run);
    } else {
        await run();
    }
}

window.addEventListener('resize', () => {
    if (lastPage) {
        normalizeFitPageScale(lastPage);
    }
});

async function triggerNotification(pageId) {
    //spawn textbox when certain page is shown !
    switch (pageId) {
        case 'camr-main-wp-page': {
            document.getElementById('camr-main-wp-ml-hitbox').classList.add('hidden');
            document.getElementById('camr-main-wp-mr-hitbox').classList.add('hidden');
            document.getElementById('master-back-arrow').classList.add('hidden');
            triggerSound('ghostSound');
            // Trigger the initial window notification once
            if (!state.notificationsSeen['wp-init']) {
                await delay(20);
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
            if (!state.notificationsSeen['mh-bd-main-init']) {
                startGlobalAudio();
                await delay(1400);
                await spawnThemedBox("Wait, what? Where am I ?", "notification-top");
                state.notificationsSeen['mh-bd-main-init'] = true;
            }
        } break;
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
        case 'clr-main-id-page': {
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
            resetTerminalUI();
            updateLoMonitorHitboxes({ terminalOpen: !termPage.classList.contains('hidden') });
        }break;
        case 'lo-monitor-drive-page': {
            updateLoMonitorHitboxes({ terminalOpen: !termPage.classList.contains('hidden') });
        }break;
        case 'bath-page': {
            await delay(20);

            // lower ambient when entering bathroom
            setVolume('globalAmbience', 0.5);

            if (!state.notificationsSeen['bath-init']) {
                await spawnThemedBox(
                    "This bathroom looks straight out of the 1950s",
                    "notification-top"
                );
                state.notificationsSeen['bath-init'] = true;
            }
        } break;
        case 'ls-archives-sk-page': {
            state.foundArchives = true;
        } break;
        case 'apt-table-water-page': {
            if (!state.canPickUpBottle) {
                document.getElementById('apt-table-water-hitbox').classList.add('hidden');
            }
        } break;
        case 'apt-ki-sink-page': {
            if (state.currTutorialStep==='find-sink') {
                state.currTutorialStep = 'found-sink';
                advanceTutorial();
            }
        } break;
        case 'cw-bath-door-page': {
            if (state.prevPage ==='bath-page') {
                triggerSound('doorClose');
            }
            if (!isPlaying('ambientNoise')) {
                triggerSound('ambientNoise');
            }
        } break;
        case 'bd-books-page': {
            if (state.prevPage ==='bd-fb-open-page' || state.prevPage==='bd-fb-open-key-page') {
                triggerSound('bdBookClose');
            }
        } break;
        case 'wr-right-note-page': {
            if (!state.notificationsSeen['wr-right-note-init']) {
                await delay(20);
                await spawnThemedBox("Wait, there's writing on the whiteboard. I don't think that was there a minute ago", "notification-top");
                state.notificationsSeen['wr-right-note-init']=true;
            }
        } break;
        case 'wr-note-page': {
            if (!state.notificationsSeen['wr-note-init']) {
                await delay(20);
                await spawnThemedBox("Who wrote this note ? Someone else is definitely down here with me...", "notification-top");
                state.notificationsSeen['wr-note-init']=true;
            }
        } break;
        case 'ls-archives-sk-2-page': {
            if (!state.notificationsSeen['ls-archives-sk-2-init']) {
                await delay(20);
                await spawnThemedBox("The fact that this skeleton keeps moving around is freaking me out", 'notification-top');
                await spawnThemedBox('At least it seems that this ghost is trying to help me', 'notification-top');
                state.notificationsSeen['ls-archives-sk-2-init']=true;
            }
        } break;
        case 'print-paper-page': {
            if (!state.notificationsSeen['fax-init']) {
                await delay(20);
                await spawnThemedBox("what's this?", "notification-top");
                state.notificationsSeen['fax-init']=true;
            }
        } break;
        case 'stairs-aw-door-page': {
            if (state.prevPage === 'stairs-up-page') {
                triggerSound('steps');
            }
        } break;
        case 'li-main-lw-page': {
            if (!state.notificationsSeen['li-main-lw-noSk'] && state.hasSkPaper) {
                await spawnThemedBox("That skeleton is gone again...", "notification-top");
                state.notificationsSeen['li-main-lw-noSk']=true;
            }
        } break;

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

    // add sounds based on prev page
    if (state.prevPage ==='mh-bd-slot-open-page' || state.prevPage==='mh-bd-slot-open-key-page') {
        triggerSound('hatchClose');
    }
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

let isMonitorFeedLocked = false;
let isLoTerminalLocked = false;

function applyLoMonitorNavLock() {
    if (isMonitorFeedLocked || isLoTerminalLocked) {
        arrows.back?.classList.add('hidden');
        arrows.forward?.classList.add('hidden');
        arrows.left?.classList.add('hidden');
        arrows.right?.classList.add('hidden');
        return;
    }

    const currentPaths = roomLeads[state.currentPage] || {};
    arrows.back?.classList.toggle('hidden', !currentPaths.back);
    arrows.forward?.classList.toggle('hidden', !currentPaths.forward);
    arrows.left?.classList.toggle('hidden', !currentPaths.left);
    arrows.right?.classList.toggle('hidden', !currentPaths.right);
}

function updateLoMonitorHitboxes({ terminalOpen = false } = {}) {
    const monitorHitbox = document.getElementById('lo-monitor-hitbox');
    const driveHitbox = document.getElementById('lo-monitor-drive-hitbox');
    const driveMonitorHitbox = document.getElementById('lo-monitor-drive-monitor-hitbox');

    // Before USB is used, monitor hitbox should be available whenever terminal is closed.
    // This includes both pre- and post-4-digit stages so the player can reopen monitor prompts.
    const showMonitorHitbox = !state.usedDrive && !terminalOpen;
    const showDriveHitbox = !state.usedDrive && state.loMonitorUnlocked;
    const showDriveMonitorHitbox = state.usedDrive && !terminalOpen && !isMonitorFeedLocked;

    monitorHitbox?.classList.toggle('hidden', !showMonitorHitbox);
    driveHitbox?.classList.toggle('hidden', !showDriveHitbox);
    driveMonitorHitbox?.classList.toggle('hidden', !showDriveMonitorHitbox);
}

function lockMonitorFeedUI(lock) {
    isMonitorFeedLocked = lock;
    applyLoMonitorNavLock();

    const terminalOpen = !document.getElementById('terminal-login-page')?.classList.contains('hidden');
    updateLoMonitorHitboxes({ terminalOpen });
}

function closeMonitorHatchFeed() {
    const feed = document.getElementById('monitor-hatch-feed');
    if (feed) feed.classList.add('hidden');
    lockMonitorFeedUI(false);
}

function showMonitorHatchFeedPersistent() {
    const feed = document.getElementById('monitor-hatch-feed');
    if (!feed) return;

    // The terminal overlay is no longer active when the persistent feed is shown.
    isLoTerminalLocked = false;
    lockMonitorFeedUI(true);
    feed.classList.remove('hidden');
    triggerFlicker('monitor-hatch-feed'); // flicker in once, then stays
}

// ---------- HINT SYSTEM LOGIC ------------
const hintRules = [
    // 1. Initial State
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'init',
        text: "Click the inventory button to view your inventory"
    },
    // 2. Open Inventory
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'inv-open-key',
        text: "You have the key to your apartment in your inventory. Click to inspect it"
    },
    // 3. Inspect Key Overlay
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'inv-overlay-key',
        text: "Click the X to close the inventory inspection"
    },
    // 4. Close Inventory
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'inv-close-key',
        text: "Click the inventory button again to close your inventory"
    },
    // 5. Hint View
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'hint-view',
        text: "Click the hint button to view hints"
    },
    // 6. Hint Close
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'hint-close',
        text: "Click the hint button again to close the hint box"
    },
    // 7. Menu Open
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'menu-open',
        text: "Click the button in the top right of the screen to open the benu"
    },
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'map-open',
        text: "Open the menu and click the map button to view the map"
    },
    // 8. Menu Close
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'map-close',
        text: "Apologies, if you're viewing this hint, there was a bug, and you need to open the menu, view the map, and click to close the map in order to proceed with the tutorial."
    },
    // 9. View Handle (Shows the last notification of the two)
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'view-handle',
        text: "Click on the door handle"
    },
    // 10. Use Key
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'use-key',
        text: "Click on the keyhole to unlock the door"
    },
    // 11. Open Door
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'open-door',
        text: "Now that the door is unlocked, open it by clicking on the door handle"
    },
    // 12. Enter Apartment
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'enter-apartment',
        text: "Enter a new room by clicking on the doorway"
    },
    // 13. In Apartment
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'in-apartment',
        text: "When available use the navigation arrows to move around"
    },
    // 14. Find Bottle
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'find-bottle',
        text: "The water bottle is on the kitchen table. Click on it to collect it"
    },
    // 15. Open Bottle
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'open-bottle',
        text: "Some inventory items are interactable. Inspect the bottle from your inventory and click the top to open it"
    },
    // 16. Opened Bottle
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'opened-bottle',
        text: "Close the inventory overlay"
    },
    // 17. Find Sink (Navigation task)
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'find-sink',
        text: "Use the navigation arrows to move around and find the sink to refill the bottle"
    },
    // 18. Found Sink (Triggered by entering the sink page)
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'found-sink',
        text: "Click the sink handle to turn it on and use the bottle"
    },
    // 19. Filled Bottle / Go to Bed
    {
        condition: () => state.isTutorialActive && state.currTutorialStep === 'filled-bottle',
        text: "Find the bed and go to sleep"
    },
    {
        condition: () => !state.isTutorialActive && !state.bdUnlocked && !state.hasBdKey,
        text: "Try inspecting the book depository"
    },
    {
        condition: () => !state.bdUnlocked && state.hasBdKey,
        text: "They key you're holding opens the book drop door. Make sure to click on the keyhole to unlock the door before opening it by clicking on the handle"
    },
    {
        condition: () => state.bdUnlocked && !state.bdBackDoorUnlocked && !state.hasPrKey,
        text: "Try inspecting the pile of books in the book drop room"
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
        text: "The key you're holding unlocks the kitchen door in the main hallway."
    },
    {
        condition: () => state.kiUnlocked && !state.foundPtCode,
        text: "Try looking around in the kitchen for a clue"
    },
    {
        condition: () => state.foundPtCode && !state.crUnlocked,
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
        text: "You'll need to solve the wordle to continue."
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
        condition: () => state.isLeftMonitorOn && state.hasClrKey && !state.crlUnlocked,
        text: "The key you're holding opens a door in the creepy room"
    },
    {
        condition: () => state.hasClrKey && !state.crlUnlocked,
        text: "The key you're holding opens a door in the creepy room"
    },
    {
        condition: () => state.crlUnlocked && !state.foundOctagon,
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

function spawnThemedBox(message, positionClass) {
    return new Promise((resolve) => {
        if (activePopup) activePopup.remove();

        const box = document.createElement('div');

        // Check if it's one of the "Self-Destruct" (Burgundy) boxes
        const isSelfDestruct = (positionClass === 'notification-top');

        if (isSelfDestruct) {
            box.className = `theme-burgundy-gold ${positionClass}`;
        } else {
            box.className = `tut-notification-base ${positionClass}`;
        }

        box.style.pointerEvents = "none";
        box.innerHTML = `<p class="box-text-content" style="margin:0; pointer-events:none;"></p>`;
        box.isTutorialBox = true;
        box.isDone = false;
        box.birthTime = Date.now();

        document.body.appendChild(box);
        activePopup = box;

        const textTarget = box.querySelector('.box-text-content');

        const handleTutorialClick = (e) => {
            // Increase this delay slightly or ensure it doesn't trigger on the current event loop
            if (Date.now() - box.birthTime < 100) return;
            if (!box.isDone) return;

            if (isSelfDestruct) {
                // e.stopImmediatePropagation(); // Be careful with this, it might block the UI
                box.remove();
                activePopup = null;
            }

            window.removeEventListener('click', handleTutorialClick, true);
            resolve();
        };

        // Use a setTimeout so the listener isn't added until AFTER the current click event finishes
        setTimeout(() => {
            window.addEventListener('click', handleTutorialClick, true);
        }, 50);

        typeWriter(textTarget, message, 30, () => {
            box.isDone = true;
            box.style.pointerEvents = "auto";
        });
        window.addEventListener('click', (event) => {
            // If a tutorial box exists AND it's still typing → block EVERYTHING
            if (activePopup && activePopup.isTutorialBox && !activePopup.isDone) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
        }, true);
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
    if (!content) return;

    // 1. Get real items and empty slots separately
    const realItems = content.querySelectorAll('.inv-item:not(.empty)');
    const emptySlots = content.querySelectorAll('.inv-item.empty');

    // 2. Count how many REAL items are visible (unhidden)
    let visibleItemsCount = 0;
    realItems.forEach(item => {
        if (!item.classList.contains('hidden')) {
            visibleItemsCount++;
        }
    });

    // 3. Set your limit to 6
    const maxCapacity = 6;
    const neededEmptySlots = Math.max(0, maxCapacity - visibleItemsCount);

    // 4. THE FIX: Explicitly hide or show empty slots
    emptySlots.forEach((slot, index) => {
        if (index < neededEmptySlots) {
            slot.classList.remove('hidden'); // Keep it visible to fill the 6
        } else {
            slot.classList.add('hidden');    // HIDE it because a real item is here
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
    "ABOUT", "ABOVE", "ABUSE", "ACORN", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADORE", "ADULT",
    "AFTER", "AGAIN", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIEN", "ALIVE", "ALONE",
    "ALONG", "ALOUD", "AMBER", "AMONG", "AMUSE", "ANGEL", "ANGER", "ANGLE", "ANGRY", "APPLE",
    "APRON", "ARGUE", "ARISE", "ARRAY", "ARROW", "ASHES", "ASIDE", "ASSET", "ATTIC", "AVOID",
    "AWAKE", "AWARE", "AWFUL", "BACON", "BADGE", "BADLY", "BAGEL", "BAKER", "BASIC", "BATCH",
    "BATHE", "BEACH", "BEANS", "BEARD", "BEARS", "BEAST", "BEATS", "BEGIN", "BEING", "BELOW",
    "BENCH", "BERRY", "BIRTH", "BLACK", "BLADE", "BLAME", "BLANK", "BLAST", "BLAZE", "BLEED",
    "BLEND", "BLESS", "BLIND", "BLOCK", "BLOOD", "BLOOM", "BOARD", "BOAST", "BOOST", "BOOTH",
    "BORED", "BOUND", "BOWEL", "BRACE", "BRAIN", "BRAKE", "BRAND", "BRAVE", "BREAD", "BREAK",
    "BRICK", "BRIDE", "BRIEF", "BRING", "BROKE", "BROWN", "BRUSH", "BUILD", "BUILT", "BUNCH",
    "BURST", "BUYER", "CABLE", "CACHE", "CADET", "CAMEL", "CANAL", "CANDY", "CANOE", "CARGO",
    "CAROL", "CARRY", "CATCH", "CAUSE", "CEDAR", "CHAIN", "CHAIR", "CHALK", "CHAMP", "CHARM",
    "CHART", "CHASE", "CHEAP", "CHECK", "CHEEK", "CHEER", "CHEST", "CHICK", "CHILD", "CHILL",
    "CHIME", "CHINA", "CHORD", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLIMB",
    "CLOCK", "CLOSE", "CLOTH", "CLOUD", "COACH", "COAST", "COLOR", "COMIC", "COUNT", "COURT",
    "COVER", "CRAFT", "CRASH", "CRAZY", "CREAM", "CREEK", "CRIME", "CROSS", "CROWD", "CROWN",
    "CRUEL", "CRUSH", "DAILY", "DANCE", "DARED", "DATES", "DEATH", "DEALT", "DELAY", "DEPTH",
    "DIARY", "DIRTY", "DOING", "DOORS", "DOUBT", "DOUGH", "DRAFT", "DRAIN", "DRAMA", "DREAM",
    "DRINK", "DRIVE", "DROVE", "DROWN", "EARLY", "EARTH", "EATEN", "EATER", "EIGHT", "ELDER",
    "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT",
    "EXIST", "EXTRA", "FAITH", "FALSE", "FANCY", "FARCE", "FEARS", "FEAST", "FEVER", "FIELD",
    "FIERY", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXER", "FLAME", "FLASH", "FLEET",
    "FLOOR", "FLOUR", "FLYER", "FOCUS", "FORCE", "FORGE", "FORTH", "FORTY", "FOUND", "FRAME",
    "FRESH", "FRONT", "FROST", "FRUIT", "FUNNY", "FURRY", "GIANT", "GIVEN", "GIVES", "GLASS",
    "GLOBE", "GLOOM", "GLORY", "GLOVE", "GOING", "GOOSE", "GRADE", "GRAIN", "GRAND", "GRANT",
    "GRAPE", "GRASS", "GREAT", "GREEN", "GROUP", "GROWN", "HABIT", "HANDS", "HANDY", "HANGS",
    "HAPPY", "HARDY", "HASTE", "HATED", "HAVEN", "HEADS", "HEART", "HEAVY", "HELLO", "HONEY",
    "HONOR", "HORSE", "HOTEL", "HOUSE", "HUMAN", "HUMOR", "IDEAL", "IMAGE", "INDEX", "INNER",
    "INPUT", "IRATE", "IRONY", "JEANS", "JELLY", "JOKER", "JOLLY", "JUDGE", "JUICE", "KAYAK",
    "KNIFE", "KNOCK", "LABEL", "LABOR", "LARGE", "LATER", "LAUGH", "LAYER", "LEARN", "LEAST",
    "LEAVE", "LEGAL", "LEMON", "LEVEL", "LIGHT", "LIMIT", "LINES", "LIVER", "LOCAL", "LOGIC",
    "LOOSE", "LOWER", "LOYAL", "LUCKY", "LUNCH", "MAGIC", "MAJOR", "MAKER", "MARCH", "MATCH",
    "MEANS", "MEANT", "MEDAL", "METAL", "METER", "MICRO", "MIGHT", "MINOR", "MINUS", "MIXER",
    "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC",
    "NAIVE", "NAMES", "NASTY", "NEEDY", "NEVER", "NIGHT", "NOISE", "NORTH", "NOTES", "NOVEL",
    "NURSE", "OCEAN", "OFFER", "OFTEN", "OLDER", "OLIVE", "ONSET", "OPERA", "ORDER", "ORGAN",
    "OTHER", "OUTER", "PANEL", "PANIC", "PAPER", "PARTS", "PARTY", "PASTA", "PATCH", "PAUSE",
    "PEACE", "PEACH", "PEARL", "PEDAL", "PENAL", "PHONE", "PHOTO", "PIANO", "PILOT", "PITCH",
    "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POWER", "PRESS", "PRICE", "PRIDE",
    "PRIME", "PRINT", "PROOF", "PROUD", "PROVE", "QUEEN", "QUERY", "QUICK", "QUIET", "QUITE",
    "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REALM", "RELAX",
    "RELAY", "RESET", "RESTS", "RETRY", "RIDER", "RIDES", "RIDGE", "RIGHT", "RIVER", "ROAST",
    "ROBOT", "ROUGH", "ROUND", "ROUTE", "ROYAL", "SCALE", "SCENE", "SCORE", "SENSE", "SERVE",
    "SEVEN", "SEWER", "SHADE", "SHAKE", "SHAME", "SHAPE", "SHARE", "SHARK", "SHARP", "SHEET",
    "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOES", "SHORT", "SHOUT", "SHOWN",
    "SIGHT", "SINCE", "SITES", "SKILL", "SLEEP", "SLICE", "SLIDE", "SLOPE", "SMALL", "SMART",
    "SMILE", "SMOKE", "SNAKE", "SNEAK", "SOAPY", "SOLAR", "SOLID", "SOLVE", "SOUND", "SOUTH",
    "SPACE", "SPARE", "SPEAK", "SPEED", "SPELL", "SPEND", "SPENT", "SPICE", "SPIKE", "SPINE",
    "SPITE", "SPLIT", "SPOON", "SPORT", "SPRAY", "STAGE", "STAIN", "STAIR", "STAKE", "STAMP",
    "STAND", "STARE", "START", "STATE", "STEAL", "STEAM", "STEEL", "STEEP", "STEER", "STICK",
    "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STOUT", "STOVE", "STRAP",
    "STRAW", "STRIP", "STUDY", "STUFF", "STYLE", "SUGAR", "SUNNY", "SUPER", "SURGE", "SWEET",
    "SWING", "TABLE", "TAKEN", "TASTE", "TEACH", "TEARS", "TEENS", "TEETH", "TELLS", "TERMS",
    "THANK", "THERE", "THESE", "THICK", "THING", "THINK", "THOSE", "THREE", "THROW", "TIGER",
    "TIMES", "TIRED", "TITLE", "TODAY", "TOKEN", "TONIC", "TOOTH", "TOPIC", "TOTAL", "TOUCH",
    "TOWER", "TRACE", "TRACK", "TRADE", "TRAIN", "TRAIT", "TRASH", "TREAT", "TREND", "TRIAL",
    "TRIBE", "TRICK", "TRIED", "TRIES", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "TWIST",
    "UNDER", "UNION", "UNITY", "UNTIL", "UPPER", "URBAN", "USUAL", "VALUE", "VIDEO", "VITAL",
    "VOICE", "WASTE", "WATCH", "WATER", "WAVES", "WEARY", "WEAVE", "WHEEL", "WHERE", "WHICH",
    "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST",
    "WORTH", "WOULD", "WRITE", "WRONG", "YOUNG", "YOUTH", "ZEBRA", "ZEROS", "TROUT", "BLAND",
    "SHACK", "SNACK", "PLAYS", "PAWNS", "CHANT", "JOKES", "JOKER", "THORN", "TENTH", "THREW",
    "TURNS", "TORCH", "WHEAT", "CATER", "ALTER", "GHOST", "OTTER", "LOVER", "ROCKS", "ADIEU",
    "CLIPS", "CRACK",
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
        <h2 style="color:#26e600; font-family:monospace; margin: 0;">SYSTEM OVERRIDE</h2>
        
        <p style="color:#26e600; font-family:monospace; font-size:1rem; margin: 2px 0 8px 0; opacity:0.8;">
            FIND THE 5-LETTER KEY. [ <span style="color:#538d4e">■</span>:Good <span style="color:#c9b458">■</span>:MOVE <span style="color:#3a3a3c">■</span>:Null ]
        </p>

        <div class="wordle-instructions" aria-label="How to play">
            <p>You have <strong>6 guesses</strong> to find the key. Type a valid 5-letter word in the field below and press <strong>Enter</strong> to submit.</p>
            <p>Each guess fills the next row. <strong>Good</strong> (green) means that letter is correct and in the right spot. <strong>MOVE</strong> (yellow) means the letter is in the key but belongs in a different position. <strong>Null</strong> (gray) means that letter is not in the key.</p>
            <p>If you fail, choose <strong>REBOOT TERMINAL</strong> — the system draws a <strong>new</strong> key word for your next attempt.</p>
        </div>

        <div class="wordle-grid" id="wordle-grid"></div>
        
        <input type="text" maxlength="5" id="wordle-input" placeholder="KEYWORD..." autocomplete="off">
        <p id="wordle-list-error" class="wordle-list-error hidden" role="status">input not in word list</p>
        <div style="margin-top:10px;">
            <button onclick="closeWordle()">ABORT</button>
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

    // ... inside startWordle ...
    const input = document.getElementById('wordle-input');
    input.focus();

// Sound triggers here so it catches every single key press from the start
    input.addEventListener('input', () => {
        triggerSound('keyboard');
        const listErr = document.getElementById('wordle-list-error');
        if (listErr) listErr.classList.add('hidden');
    });

    input.addEventListener('keydown', (e) => {
        if (isGameOver) return;

        if (e.key === "Enter") {
            const currentGuess = input.value.toUpperCase();
            const listErr = document.getElementById('wordle-list-error');

            if (currentGuess.length !== 5) {
                if (listErr) listErr.classList.add('hidden');
                triggerInputError(input);
                return;
            }

            if (!WORD_BANK.includes(currentGuess)) {
                if (listErr) listErr.classList.remove('hidden');
                triggerInputError(input);
                return;
            }

            if (listErr) listErr.classList.add('hidden');
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
    resetWordle();

    const backArrow = document.getElementById('master-back-arrow');
    if (backArrow) {
        backArrow.style.visibility = 'visible';
        backArrow.style.pointerEvents = 'auto';
    }

    const hitbox = document.getElementById('camr-mr-off-hitbox');
    if (hitbox) {
        hitbox.style.display = 'block';
    }
}

function resetWordle() {
    const container = document.getElementById('wordle-minigame');

    // Hide UI
    container.classList.add('hidden');

    // Reset state
    targetWord = "";
    currentGuessCount = 0;
    isGameOver = false;

    // Clear DOM completely (IMPORTANT)
    container.innerHTML = "";

    // Remove any leftover input listeners safely (handled by DOM wipe)
}

// ------ FINAL PUZZLE INITIAL LOGIN PIN SECTION ----

const termPage = document.getElementById('terminal-login-page');
const termInput = document.getElementById('terminal-input');
const termFeedback = document.getElementById('terminal-feedback');
const loginHeader = document.querySelector('#terminal-window .terminal-content div:first-child');
const prompt = document.getElementById('pin-prompt');

// Called when clicking the monitor hitbox
async function openTerminal() {
    const terminalWindow = document.getElementById('terminal-window');
    termPage.classList.remove('hidden');
    isLoTerminalLocked = true;
    applyLoMonitorNavLock();
    updateLoMonitorHitboxes({ terminalOpen: true });

    if (state.usedDrive) {
        termPage.style.pointerEvents = "auto";
        if (terminalWindow) terminalWindow.style.pointerEvents = "auto";

        // If hatch event already happened, reopen the hatch camera feed instead of auth UI
        if (state.hatchOpen) {
            termPage.classList.add('hidden');
            isLoTerminalLocked = false;
            applyLoMonitorNavLock();
            showMonitorHatchFeedPersistent();
            return;
        }

        termInput.style.display = "none";
        if (loginHeader) loginHeader.style.display = "none";
        termFeedback.style.display = "none";
        if (prompt) prompt.style.display = "none";

        const finalError = document.getElementById('final-error-feedback');
        if (finalError) finalError.innerText = "";

        document.getElementById('final-auth-section').classList.remove('hidden');
        setTimeout(() => document.getElementById('final-terminal-input').focus(), 10);
    } else if (state.loMonitorUnlocked) {
        // Let clicks pass through the full-screen overlay so the USB hitbox stays clickable.
        // Keep the terminal panel itself interactive so the player can still press [X].
        termPage.style.pointerEvents = "none";
        if (terminalWindow) terminalWindow.style.pointerEvents = "auto";

        if (prompt) prompt.style.display = "none";
        termInput.style.display = "none";
        if (loginHeader) loginHeader.style.display = "none";

        // Match the large font size here too
        termFeedback.style.fontSize = "1.8rem";
        termFeedback.style.color = "#00ff41";
        termFeedback.innerHTML = "ACCESS GRANTED.<br>INSERT FLASH DRIVE TO CONTINUE";
    } else {
        termPage.style.pointerEvents = "auto";
        if (terminalWindow) terminalWindow.style.pointerEvents = "auto";

        //  Disable typing immediately
        termInput.disabled = true;

        await delay(20);
        await spawnThemedBox("A 4 digit code... I have found 4 shapes, I wonder if that's related", "notification-top");

        // Re-enable typing AFTER messages finish
        termInput.disabled = false;
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
    termPage.style.pointerEvents = "auto";
    isLoTerminalLocked = false;
    applyLoMonitorNavLock();
    updateLoMonitorHitboxes({ terminalOpen: false });
}

// function fullyCloseTerminal() {
//     termPage.classList.add('hidden');
//     document.getElementById('lo-monitor-drive-monitor-hitbox').classList.add('hidden');
//     document.getElementById('lo-monitor-hitbox').classList.add('hidden');
//     document.getElementById('lo-monitor-drive-hitbox').classList.add('hidden');
// }

termInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const feedback = document.getElementById('terminal-feedback');
        const header = document.getElementById('auth-header');
        const prompt = document.getElementById('pin-prompt');
        const terminalWindow = document.getElementById('terminal-window');

        if (termInput.value === "8450" || termInput.value === "8451") {
            state.loMonitorUnlocked = true;

            // 1. Make the success text significantly larger
            feedback.style.fontSize = "1.8rem";
            feedback.style.color = "#00ff41";
            feedback.innerHTML = "ACCESS GRANTED.<br>INSERT FLASH DRIVE TO CONTINUE";
            updateLoMonitorHitboxes({ terminalOpen: true });

            // 2. Hide everything else
            termInput.style.display = "none";
            if (header) header.style.display = "none";
            if (prompt) prompt.style.display = "none";
            if (loginHeader) loginHeader.style.display = "none";

            // Match reopened unlocked-monitor behavior immediately:
            // allow clicks through overlay so only real page hitboxes (USB slot) are active.
            termPage.style.pointerEvents = "none";
            if (terminalWindow) terminalWindow.style.pointerEvents = "auto";

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
termPage.addEventListener('click', async (e) => {
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
        const terminalWindow = document.getElementById('terminal-window');
        state.usedDrive = true;
        triggerSound('driveNotif');
        const keySlot = document.getElementById('inv-ls-drive');
        if (keySlot) {
            keySlot.classList.add('hidden');
            refreshInventorySlots();
        }
        showPage('lo-monitor-drive-page');

        // Keep monitor terminal open and interactive for the 8-digit auth stage.
        termPage.classList.remove('hidden');
        termPage.style.pointerEvents = "auto";
        if (terminalWindow) terminalWindow.style.pointerEvents = "auto";
        isLoTerminalLocked = true;
        applyLoMonitorNavLock();

        // 1. Hide EVERYTHING from the previous stage
        termFeedback.style.display = "none";
        termInput.style.display = "none";
        if (loginHeader) loginHeader.style.display = "none";

        // Add these two lines to clear the old prompts
        if (document.getElementById('auth-header')) document.getElementById('auth-header').style.display = "none";
        if (document.getElementById('pin-prompt')) document.getElementById('pin-prompt').style.display = "none";

        updateLoMonitorHitboxes({ terminalOpen: true });

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

function setupLoMonitorNumericInputFilter(inputEl) {
    if (!inputEl) return;

    // Block non-number keys before they render.
    inputEl.addEventListener('keydown', (e) => {
        const isDigit = /^[0-9]$/.test(e.key);
        const isControlKey = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Tab', 'Enter', 'Home', 'End'
        ].includes(e.key);
        const isShortcut = e.ctrlKey || e.metaKey;

        if (!isDigit && !isControlKey && !isShortcut) {
            e.preventDefault();
            return;
        }

        if (isDigit || e.key === 'Backspace' || e.key === 'Enter') {
            triggerSound('keyboard');
        }
    });

    // Safety net for paste/IME/mobile keyboards.
    inputEl.addEventListener('input', (e) => {
        const cleaned = e.target.value.replace(/[^0-9]/g, '');
        if (cleaned !== e.target.value) {
            e.target.value = cleaned;
        }
    });
}

setupLoMonitorNumericInputFilter(termInput);
setupLoMonitorNumericInputFilter(finalInput);

// 1. Only allow numbers to be typed
finalInput.addEventListener('input', (e) => {
    // Replaces anything that isn't 0-9 with an empty string
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// 2. Handle the Enter key
finalInput.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
        if (finalInput.value === "97939394") {
            console.log("PIN Correct! Starting flicker...");
            finalInput.disabled = true;
            finalError.style.color = "#00ff41";
            finalError.innerText = "ACCESS GRANTED. DECRYPTING...";

            await delay(500);
            playHatchSequence();
            state.hatchOpen = true;

            setTimeout(() => {
                triggerSound('lightFlicker');
                triggerFlicker('lo-monitor-drive-page');
                triggerFlicker('terminal-login-page');

                // Close terminal so player sees monitor screen
                termPage.classList.add('hidden');

                // Show feed and lock nav until user closes it
                showMonitorHatchFeedPersistent();
            }, 700);

            await delay(2000);
            await spawnThemedBox("What the heck was that ???", "notification-top");
        } else {
            finalError.innerText = "> INCORRECT AUTHORIZATION KEY";
            finalInput.value = "";
        }
    }
});

function resetTerminalUI() {
    closeMonitorHatchFeed();
    // Hide everything
    termPage.classList.add('hidden');
    termPage.style.pointerEvents = "auto";

    document.getElementById('final-auth-section').classList.add('hidden');
    document.getElementById('final-auth-section').style.display = "none";

    isLoTerminalLocked = false;
    applyLoMonitorNavLock();
    updateLoMonitorHitboxes({ terminalOpen: false });

    termInput.style.display = "block";
    termInput.value = "";

    termFeedback.style.display = "block";
    termFeedback.innerText = "";
    termFeedback.style.fontSize = "1.2rem";

    if (loginHeader) loginHeader.style.display = "block";

    const prompt = document.getElementById('pin-prompt');
    if (prompt) prompt.style.display = "block";

    const finalInput = document.getElementById('final-terminal-input');
    if (finalInput) {
        finalInput.value = "";
        finalInput.disabled = false;
    }

    const finalError = document.getElementById('final-error-feedback');
    if (finalError) finalError.innerText = "";
}


// ---- PRINTER SYNC MINIGAME ----
// --- Settings ---
const CONSTANT_SPEED = 3.0;
const totalLevels = 5;

// --- State ---
let currentLevel = 1;
let barPos = 0;
let barDir = 1;
let isRunning = true;
let lastPos = 0; // For "Smart Random"

let currentTarget = { pos: 0, width: 22 };

const monitor = document.getElementById('printer-monitor-area');
const bar = document.getElementById('scanner-bar');

function generateRandomTarget() {
    document.getElementById('msg').innerText = "CALIBRATING OPTICS...";
    document.getElementById('msg2').innerText = "Click when the white is within the green zone to calibrate";
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
        triggerSound('accessBeep')
        currentLevel++;

        if (currentLevel > totalLevels) {
            win();
        } else {
            generateRandomTarget();
            flash("white");
        }
    } else {
        triggerSound('errorBeep');
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
    triggerSound('printPage');
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

    // 2. Hide the overlay
    const minigame = document.getElementById('printer-sync-minigame');
    if (minigame) {
        minigame.classList.add('hidden');
    }
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
            await spawnThemedBox('It didn\'t work', 'notification-top');
            enteredCode = ""; // Reset to try again
        }
    }
}


// --------- LEFT MONITOR PASSWORD PAGE ------
function setupLeftMonitorInputFilter() {
    const securityInput = document.getElementById('security-pass-input');
    if (!securityInput) return;

    // Block non-letter key presses before they render.
    securityInput.addEventListener('keydown', (e) => {
        const isLetter = /^[a-zA-Z]$/.test(e.key);
        const isControlKey = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Tab', 'Enter', 'Home', 'End'
        ].includes(e.key);
        const isShortcut = e.ctrlKey || e.metaKey;

        if (!isLetter && !isControlKey && !isShortcut) {
            e.preventDefault();
        }
    });

    // Safety net for paste/IME/mobile keyboards.
    securityInput.addEventListener('input', (e) => {
        const cleaned = e.target.value.replace(/[^a-zA-Z]/g, '');
        if (cleaned !== e.target.value) {
            e.target.value = cleaned;
        }
        triggerSound('keyboard');
    });
}

setupLeftMonitorInputFilter();

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
        }, 1500);

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

function resetLeftMonitorUI() {
    const container = document.getElementById('security-login-minigame');
    const input = document.getElementById('security-pass-input');
    const feedback = document.getElementById('security-feedback');
    const status = document.getElementById('status-text');

    // Keep the original terminal markup from index.html.
    // Only reset visibility/text/input state so styles/layout stay intact.
    if (container) container.classList.add('hidden');
    if (input) {
        input.value = "";
        input.disabled = false;
    }
    if (feedback) {
        feedback.innerText = "READY FOR INPUT...";
        feedback.style.color = "#26e600";
    }
    if (status) status.innerText = "LOCKED";
}

// ------ INVENTORY INSPECTION -----

const overlay = document.getElementById("item-overlay");
const closeBtn = document.getElementById("item-close-btn");
let currentOverlayItem = null;

/** Overlays that show "Open reader" + side transcript panel */
const NOTE_READER_ITEM_NAMES = new Set([
    "wr-reddit",
    "print-paper",
    "ls-10-note",
    "archives-note",
    "wr-tu"
]);

function resetNoteReaderUI() {
    const root = document.getElementById("item-overlay");
    if (root) root.classList.remove("overlay-reader-active");
    document.querySelectorAll(".note-reader-panel").forEach((p) => p.classList.add("hidden"));
    document.querySelectorAll(".note-open-reader-btn").forEach((btn) => {
        btn.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
    });
}

function openNoteReaderForItem(itemKey) {
    const root = document.getElementById("item-overlay");
    if (root) root.classList.add("overlay-reader-active");
    document.querySelectorAll(".note-reader-panel").forEach((p) => p.classList.add("hidden"));
    const panel = document.getElementById(`note-reader-${itemKey}`);
    const openBtn = document.getElementById(`${itemKey}-open-reader-btn`);
    if (panel) panel.classList.remove("hidden");
    if (openBtn) {
        openBtn.classList.add("hidden");
        openBtn.setAttribute("aria-expanded", "true");
    }
}

function closeNoteReaderPanel() {
    const root = document.getElementById("item-overlay");
    if (root) root.classList.remove("overlay-reader-active");
    document.querySelectorAll(".note-reader-panel").forEach((p) => p.classList.add("hidden"));
    if (currentOverlayItem && NOTE_READER_ITEM_NAMES.has(currentOverlayItem)) {
        const ob = document.getElementById(`${currentOverlayItem}-open-reader-btn`);
        if (ob) {
            ob.classList.remove("hidden");
            ob.setAttribute("aria-expanded", "false");
        }
    }
}

document.querySelectorAll(".note-open-reader-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const m = btn.id.match(/^(.+)-open-reader-btn$/);
        if (!m) return;
        openNoteReaderForItem(m[1]);
    });
});

document.querySelectorAll(".note-close-reader-btn").forEach((btn) => {
    btn.addEventListener("click", () => closeNoteReaderPanel());
});

function openWrNoteReaderOverlay() {
    const el = document.getElementById("wr-note-reader-overlay");
    if (!el) return;
    el.classList.remove("hidden");
    el.setAttribute("aria-hidden", "false");
}

function closeWrNoteReaderOverlay() {
    const el = document.getElementById("wr-note-reader-overlay");
    if (!el) return;
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
}

(function initWrNoteReaderOverlay() {
    const backdrop = document.querySelector(".wr-note-reader-backdrop");
    const closeBtn = document.getElementById("wr-note-reader-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", () => closeWrNoteReaderOverlay());
    if (backdrop) backdrop.addEventListener("click", () => closeWrNoteReaderOverlay());
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        const o = document.getElementById("wr-note-reader-overlay");
        if (o && !o.classList.contains("hidden")) closeWrNoteReaderOverlay();
    });
})();

// Close overlay
closeBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    currentOverlayItem = null;
    resetNoteReaderUI();
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

function openOverlay(itemName, imgSrc) {
    currentOverlayItem = itemName;
    resetNoteReaderUI();

    const overlay = document.getElementById("item-overlay");
    const img = document.getElementById("item-overlay-img");
    const resolvedImgSrc = (itemName === 'inv-wb' && state.isWbOpen)
        ? 'inv-images/wb-open.png'
        : imgSrc;

    img.src = resolvedImgSrc;
    overlay.classList.remove("hidden");

    if (NOTE_READER_ITEM_NAMES.has(itemName)) {
        document.getElementById(`${itemName}-open-reader-btn`)?.classList.remove("hidden");
    }

    setupOverlayHitboxes(itemName, resolvedImgSrc);

    if (!document.getElementById('wordle-minigame').classList.contains('hidden')) {
        closeWordle();
    }
    if (!document.getElementById('security-login-minigame').classList.contains('hidden')) {
        closeSecurityTerminal();
    }
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
                        triggerSound('pwBook');
                        openOverlay("pw-book", "inv-images/pw-book-open.png");
                    } else {
                        triggerSound('pwBook');
                        openOverlay("pw-book", "inv-images/pw-book-open-key.png");
                    }
                };
            } break;
            case 'inv-images/pw-book-open-key.png': {
                document.getElementById('pw-book-key-hitbox').classList.remove('hidden');
                document.getElementById('pw-book-key-hitbox').onclick = async () => {
                    state.hasKiKey = true;
                    const keySlot = document.getElementById('inv-ki-key');
                    if (keySlot) {
                        keySlot.classList.remove('hidden');
                        refreshInventorySlots();
                    }
                    document.getElementById("item-overlay").classList.add("hidden");
                    openOverlay("pw-book", "inv-images/pw-book-open.png");
                    await delay(20);
                    await spawnThemedBox("Another key.... Which door is this one for ?", "notification-top");
                }
            } break;
            case 'inv-images/pw-book-open.png': {
                document.getElementById('pw-book-open-hitbox').classList.remove('hidden');
                document.getElementById('pw-book-open-hitbox').onclick = () => {
                    triggerSound('pwBook');
                    openOverlay('pw-book', 'inv-images/pw-book.png');
                }
            } break;
        }
    } else if (itemName === "sherlock-book") {
        switch (imgSrc) {
            case 'inv-images/sherlock-book.png': {
                document.getElementById('sherlock-book-hitbox').classList.remove('hidden');
                document.getElementById("sherlock-book-hitbox").onclick = () => {
                    triggerSound('bdBookOpen');
                    openOverlay("sherlock-book", "inv-images/sherlock-book-open.png")
                };
            } break;
            case 'inv-images/sherlock-book-open.png': {
                document.getElementById('sherlock-book-open-hitbox').classList.remove('hidden');
                document.getElementById("sherlock-book-open-hitbox").onclick = () => {
                    if (state.hasSkPaper) {
                        triggerSound('pwBook');
                        openOverlay("sherlock-book", "inv-images/sherlock-book-paper.png");
                    } else {
                        console.log('Error with progression has occurred');
                    }
                };
            } break;
            case 'inv-images/sherlock-book-paper.png': {
                document.getElementById('sherlock-book-open-un-hitbox').classList.remove('hidden')
                document.getElementById('sherlock-book-open-der-hitbox').classList.remove('hidden');
                document.getElementById('sherlock-book-open-animals-hitbox').classList.remove('hidden');
                document.getElementById('sherlock-book-open-un-hitbox').onclick = async () => {
                    await spawnThemedBox("und-", "notification-top");
                }
                document.getElementById('sherlock-book-open-der-hitbox').onclick = async () => {
                    await spawnThemedBox("er-", "notification-top");
                }
                document.getElementById('sherlock-book-open-animals-hitbox').onclick = async () => {
                    await spawnThemedBox("animals", "notification-top");
                }
                state.foundLiClue = true;
            } break;
        }
    } else if (itemName === 'inv-wb') {
        if (imgSrc==='inv-images/wb.png') {
            document.getElementById('wb-hitbox').classList.remove('hidden');
            document.getElementById('wb-hitbox').onclick = () => {
                triggerSound('bottleOpen');
                openOverlay('inv-wb', 'inv-images/wb-open.png');
                state.isWbOpen = true;
                state.currTutorialStep='opened-bottle';
                advanceTutorial();
            }
        } else {
            document.getElementById('wb-hitbox').classList.add('hidden');
        }
    } //fixme make it so next time they click on wb it opens overlay for the open bottle (?)
}



async function advanceTutorial() {
    saveGame(state.currentPage);
    if (!state.isTutorialActive) return;

    if (activePopup) {
        activePopup.remove();
        activePopup = null;
    }
    // Crucial: If you want the notification to stay until the next click,
    // your spawnThemedBox function must not have a self-destruct timer.

    switch (state.currTutorialStep) {
        case 'init':
            await delay(20);
            await spawnThemedBox("<-- Click here to view inventory", "notification-inventory");
            break;
        case 'inv-open-key':
            await delay(20);
            await spawnThemedBox("<-- You have the key to your apartment. Click to inspect it", "notification-invInspection");
            break;
        case 'inv-overlay-key':
            console.log('inv-overlay-key running');
            await delay(20);
            await spawnThemedBox("Click the X to close the inventory inspection", "notification-closeOverlay");
            break;
        case 'inv-close-key':
            await delay(20);
            await spawnThemedBox("<-- Click here again to close your inventory", "notification-inventory");
            break;
        case 'hint-view':
            await delay(20);
            await spawnThemedBox("Click here to view hints", "notification-hint");
            break;
        case 'hint-close':
            await delay(20);
            await spawnThemedBox('Click to close the hint-box', "notification-hint");
            break;
        case 'menu-open':
            await delay(20);
            await spawnThemedBox("Click to open the menu -->", "notification-menu");
            break;
        case 'map-open':
            await delay(20);
            await spawnThemedBox("Click to view the map -->", "notification-map");
            break;
        case 'map-close':
            await delay(20);
            await spawnThemedBox("Click the button to close the map", "notification-close-map");
            break;
        case 'menu-close':
            await delay(20);
            await spawnThemedBox('Click again to close the menu', 'notification-menu');
            break;
        case 'view-handle':
            document.getElementById('apt-fd-handle-hitbox').classList.remove('hidden');
            await delay(20);
            await spawnThemedBox("Interactable objects will have a glowing orb above them.", 'notification-mid');
            await spawnThemedBox("Click on the door handle.", "notification-mid");
            break;
        case 'use-key':
            await delay(20);
            await spawnThemedBox("To open a door, you must first unlock it with a key", 'notification-mid');
            await spawnThemedBox('Click on the keyhole to unlock the door', "notification-mid");
            break;
        case 'open-door':
            state.aptUnlocked = true;
            const keySlot = document.getElementById('inv-apt-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            triggerSound('unlock');
            await delay(20);
            await spawnThemedBox('Now that the door is unlocked, open it by clicking on the door handle', "notification-mid");
            break;
        case 'enter-apartment':
            if (state.aptUnlocked) {
                triggerSound('aptDoorOpen');
                showPage('apt-fd-open-page');
            }
            await delay(20);
            await spawnThemedBox('Enter a new room by clicking on the doorway', 'notification-mid');
            break;
        case 'in-apartment':
            await delay(20);
            await spawnThemedBox("When available use the navigation arrows to move around.", 'notification-mid');
            break;
        case 'find-bottle':
            await delay(20);
            await spawnThemedBox("I'm so tired, I'm just going to fill up my water bottle and go to bed", "notification-top");
            await delay(50);
            document.getElementById('apt-table-water-hitbox').classList.remove('hidden');
            await spawnThemedBox("Click on the water bottle to collect it", "notification-mid");
            state.canPickUpBottle = true;
            break;
        case 'open-bottle':
            await delay(20);
            await spawnThemedBox('Some inventory items are interactable. Click to open the bottle', "notification-mid");
            break;
        case 'opened-bottle':
            await delay(20);
            await spawnThemedBox("Close the inventory overlay", "notification-mid");
            break;
        case 'find-sink':
            await delay(20);
            document.getElementById('apt-ki-sink-hitbox')?.classList.remove('hidden');
            await spawnThemedBox("Use the navigation arrows to move around and find the sink to refill the bottle.", "notification-mid");
            break;
        case 'found-sink':
            await delay(20);
            document.getElementById('apt-ki-sink-hitbox')?.classList.remove('hidden');
            await spawnThemedBox('Click the sink to turn it on and use the bottle', "notification-mid");
            break;
        case 'filled-bottle':
            if (keySlot2) {
                keySlot2.classList.add('hidden');
                refreshInventorySlots();
            }
            await delay(4000);
            await spawnThemedBox("I'm so tired, I'm going straight to bed now", "notification-top");
            await delay(50);
            await spawnThemedBox('Find the bed and go to sleep', "notification-mid");
            break;
        case 'asleep':
            // End tutorial with title card transition before entering Tribble.
            await playTutorialTitleCardTransition();
            break;
    }
}

async function showCurrentTutorialPromptNoTop() {
    if (!state.isTutorialActive) return;

    if (activePopup) {
        activePopup.remove();
        activePopup = null;
    }

    switch (state.currTutorialStep) {
        case 'find-bottle':
            await delay(20);
            await spawnThemedBox("Click on the water bottle to collect it", "notification-mid");
            break;
        case 'open-bottle':
            await delay(20);
            await spawnThemedBox('Some inventory items are interactable. Click to open the bottle', "notification-mid");
            break;
        case 'opened-bottle':
            await delay(20);
            await spawnThemedBox("Close the inventory overlay", "notification-mid");
            break;
        case 'find-sink':
            await delay(20);
            await spawnThemedBox("Use the navigation arrows to move around and find the sink to refill the bottle.", "notification-mid");
            break;
        case 'found-sink':
            await delay(20);
            await spawnThemedBox('Click the sink to turn it on and use the bottle', "notification-mid");
            break;
        case 'filled-bottle':
            await delay(20);
            await spawnThemedBox('Find the bed and go to sleep', "notification-mid");
            break;
        default:
            break;
    }
}


let tutorialListenersInitialized = false;

function runTutorial(resume = false) {
    tutorialHitboxInit();

    state.isTutorialActive = true;

    const keySlot = document.getElementById('inv-apt-key');

    if (!resume) {
        // Fresh tutorial start
        state.hasAptKey = true;
        state.currTutorialStep = "init";
    }

    // Sync key visibility with current state (important on resume)
    if (keySlot) {
        if (state.hasAptKey) keySlot.classList.remove('hidden');
        else keySlot.classList.add('hidden');
        refreshInventorySlots();
    }

    advanceTutorial();
}

async function tutorialHitboxInit() {
    if (tutorialListenersInitialized) return;
    tutorialListenersInitialized = true;
    document.querySelector('.overlay-backdrop').addEventListener("click", () => {
        overlay.classList.add("hidden");
        currentOverlayItem = null;
        resetNoteReaderUI();
    });

    document.getElementById('apt-ki-2-sink-hitbox').onclick = () => showPage('apt-ki-sink-page');

    window.addEventListener('click', async (event) => {
        if (!state.isTutorialActive) return;

        // 1. Get the actual ID of what was clicked
        let clickedId = event.target.id;

        // 2. If the thing clicked has no ID, check if it's inside one of our main buttons
        if (!clickedId) {
            const parentButton = event.target.closest('#hamburger-icon, #inventory-tab, #hint-btn');
            if (parentButton) {
                clickedId = parentButton.id;
            }
        }

        console.log("Tutorial sees ID:", clickedId); // This will help you see it working in real-time

        // for each click of each box and different states, it activates the next part of the tutorial
        if (state.currTutorialStep === "init" && clickedId === "inventory-tab") {
            state.currTutorialStep = 'inv-open-key'; // Move to the NEXT state
            advanceTutorial(); // Spawn the box for the new state
        } else if (state.currTutorialStep === "inv-open-key" && clickedId === "inv-apt-key") {
            state.currTutorialStep = 'inv-overlay-key';
            advanceTutorial();
        } else if (state.currTutorialStep === "inv-overlay-key") {
            if (clickedId === "item-close-btn" || event.target.classList.contains('overlay-backdrop')) {
                state.currTutorialStep = 'inv-close-key';
                advanceTutorial();
            }
        } else if (state.currTutorialStep ==="inv-close-key" && clickedId ==="inventory-tab") {
            state.currTutorialStep = 'hint-view';
            advanceTutorial();
        } else if (state.currTutorialStep === "hint-view" && clickedId === 'hint-btn') {
            state.currTutorialStep = 'hint-close';
            advanceTutorial();
            return;
        } else if (state.currTutorialStep === 'hint-close' && clickedId === 'hint-btn') {
            state.currTutorialStep = 'menu-open';
            advanceTutorial();
            return;
        } else if (state.currTutorialStep === 'menu-open' && clickedId === 'hamburger-icon') {
            state.currTutorialStep = 'map-open';
            advanceTutorial();
            return;
        } else if (state.currTutorialStep ==='map-open' && clickedId ==='map-btn') {
            state.currTutorialStep = 'map-close';
            advanceTutorial();
        } else if (state.currTutorialStep ==='map-close' && clickedId ==='map-close-btn') {
            state.currTutorialStep = 'view-handle';
            advanceTutorial();
        } else if(state.currTutorialStep==='view-handle' && clickedId==='apt-fd-handle-hitbox') {
            showPage('apt-fd-handle-page');
            state.currTutorialStep='use-key';
            advanceTutorial();
        } else if (state.currTutorialStep==='use-key' && clickedId==='apt-fd-handle-keyhole-hitbox') {
            if (state.hasAptKey) {
                state.aptUnlocked = true;
                state.hasAptKey = false;
                state.inventory = Array.isArray(state.inventory)
                    ? state.inventory.filter(id => id !== 'inv-apt-key')
                    : [];
                const keySlot = document.getElementById('inv-apt-key');
                if (keySlot) {
                    keySlot.classList.add('hidden');
                    refreshInventorySlots();
                }
                triggerSound('unlock');
                state.currTutorialStep='open-door';
                advanceTutorial();
            }
        } else if (state.currTutorialStep==='open-door' && clickedId==='apt-fd-handle-handle-hitbox') {
            if (state.aptUnlocked) {
                showPage('apt-fd-open-page');
                state.currTutorialStep='enter-apartment';
                advanceTutorial();
            }
        } else if (state.currTutorialStep==='enter-apartment' && clickedId==='apt-fd-open-hitbox') {
            showPage("apt-main-water-page");
            triggerSound('aptDoorClose');
            state.currTutorialStep='in-apartment';
            advanceTutorial();
        } else if(state.currTutorialStep==='in-apartment' && clickedId==='master-forward-arrow') {
            state.currTutorialStep='find-bottle';
            advanceTutorial();
        } else if (state.currTutorialStep==='find-bottle' && clickedId==='apt-table-water-hitbox') {
            state.currTutorialStep='open-bottle'
            showPage("apt-table-page");
            openOverlay('inv-wb', 'inv-images/wb.png');
            keySlot2 = document.getElementById('inv-wb');
            if (keySlot2) {
                keySlot2.classList.remove('hidden');
                refreshInventorySlots();
            }
            state.hasWb = true;
            advanceTutorial();
        } else if (state.currTutorialStep==='open-bottle' && clickedId==='wb-hitbox') {
            state.currTutorialStep='opened-bottle';
            advanceTutorial();
        } else if (state.currTutorialStep==='opened-bottle') {
            if (clickedId === "item-close-btn" || event.target.classList.contains('overlay-backdrop')) {
                state.currTutorialStep='find-sink';
                advanceTutorial();
            }
        }
        //find-sink step is located in the triggerNotifications function, for when the user gets to the sink page
        else if (state.currTutorialStep==='found-sink' && clickedId==='apt-ki-sink-hitbox') {
            if (state.hasWb && state.isWbOpen && !state.filledBottle) {
                triggerSound('fillBottle');
                showPage('apt-ki-sink-water-bottle-page');
                setTimeout(() => {
                    showPage('apt-ki-sink-page');
                }, 5000);
                state.filledBottle = true;
                state.currTutorialStep='filled-bottle';
                advanceTutorial();
            }
        } else if (clickedId === 'apt-bed-hitbox' && state.currTutorialStep !== 'filled-bottle' && state.currTutorialStep !== 'asleep') {
            await spawnThemedBox("I need to fill up my water bottle first", "notification-top");
            await delay(20);
            await showCurrentTutorialPromptNoTop();
        } else if (state.currTutorialStep==='filled-bottle' && clickedId==='apt-bed-hitbox') {
            state.currTutorialStep='asleep';
            advanceTutorial();
        }
    }, true);
}

//this function fades to black and then shows the next page
function fadeTransition(callback) {
    const fade = document.getElementById('screen-fade');

    return new Promise(resolve => {

        const fadeTime = 1200;
        const holdTime = 300;

        fade.style.pointerEvents = "all";
        fade.style.transition = `opacity ${fadeTime}ms ease`;
        fade.style.opacity = "1";

        setTimeout(async () => {

            await callback();

            setTimeout(() => {
                fade.style.opacity = "0";
            }, holdTime);

            setTimeout(() => {
                fade.style.pointerEvents = "none";
                resolve();
            }, fadeTime + holdTime);

        }, fadeTime);
    });
}

function fadeGlobalAudioOut(durationMs = 1000) {
    const activeGlobal = currentGlobalId ? pageSounds[currentGlobalId] : null;
    const clip = activeGlobal?.clip;

    if (!clip || clip.paused) {
        stopGlobalAudio();
        return Promise.resolve();
    }

    return new Promise(resolve => {
        const startVolume = clip.volume;
        const steps = 24;
        const interval = durationMs / steps;
        let step = 0;

        if (clip.activeFade) {
            clearInterval(clip.activeFade);
            clip.activeFade = null;
        }

        clip.activeFade = setInterval(() => {
            step++;
            clip.volume = Math.max(0, startVolume * (1 - step / steps));

            if (step >= steps) {
                clearInterval(clip.activeFade);
                clip.activeFade = null;
                stopGlobalAudio();
                resolve();
            }
        }, interval);
    });
}

async function playTutorialTitleCardTransition() {
    const fade = document.getElementById('screen-fade');
    const titleCard = document.getElementById('tutorial-title-card');
    if (!fade || !titleCard) {
        await showPage("mh-bd-main-page", true);
        return;
    }

    state.isTutorialActive = false;
    localStorage.setItem('tutorialCompleted', 'true');

    // 1) Fade out from tutorial page into black while tutorial music fades out.
    fade.style.pointerEvents = "all";
    fade.style.transition = "opacity 1200ms ease";
    fade.style.opacity = "1";
    const audioFadePromise = fadeGlobalAudioOut(1200);
    await delay(1200);
    await audioFadePromise;

    // 2) Reveal title card screen.
    titleCard.classList.remove('hidden');
    titleCard.setAttribute('aria-hidden', 'false');
    fade.style.transition = "opacity 700ms ease";
    fade.style.opacity = "0";
    await delay(700);

    // Hold title card in silence.
    await delay(3500);

    // 3) Fade to black again (no audio playing here).
    fade.style.transition = "opacity 900ms ease";
    fade.style.opacity = "1";
    await delay(900);

    // 4) Switch into Tribble page behind black, then fade in with gameplay global audio.
    titleCard.classList.add('hidden');
    titleCard.setAttribute('aria-hidden', 'true');
    await showPage("mh-bd-main-page", false);

    fade.style.transition = "opacity 1000ms ease";
    fade.style.opacity = "0";
    await delay(1000);
    fade.style.pointerEvents = "none";
}


// --------- LOADING LOGIC --------//
async function loadEverything() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    const loadingMascot = document.getElementById('loading-mascot');

    const imageElements = Array.from(document.querySelectorAll('img'));

    const audioEntries = Object.values(sfx)
        .filter(entry => entry && entry.audio instanceof Audio)
        .map(entry => entry.audio);

    let didShowLoadingScreen = false;

    const total = imageElements.length + audioEntries.length;
    let count = 0;

    if (total === 0) {
        console.warn("Loader found 0 assets.");
        return;
    }

    // SHOW loader ONLY if there is something to load
    if (total > 0) {
        loadingScreen.style.display = 'flex';
        didShowLoadingScreen = true;
    }

    console.log(`Loader detected: ${imageElements.length} images and ${audioEntries.length} sounds. Total: ${total}`);

    if (total === 0) {
        console.warn("Loader found 0 assets.");
        loadingScreen.style.display = 'none';
        return;
    }

    const tick = () => {
        count++;
        const percent = Math.floor((count / total) * 100);
        loadingBar.style.width = percent + "%";
        if (loadingMascot) {
            loadingMascot.style.left = percent + "%";
        }
        loadingText.textContent = `LOADING... ${percent}%`;
    };

    const makeSafePromise = (setupFn, name) => {
        return new Promise(resolve => {
            let done = false;

            const finish = (type) => {
                if (done) return;
                done = true;

                if (type === 'error') {
                    console.warn(`⚠️ Failed to load: ${name}`);
                }
                if (type === 'timeout') {
                    console.warn(`⏱️ Timeout loading: ${name}`);
                }

                tick();
                resolve();
            };

            // fallback timeout (optional but safer)
            const timeout = setTimeout(() => finish('timeout'), 240000);

            setupFn({
                success: () => {
                    clearTimeout(timeout);
                    finish('success');
                },
                error: () => {
                    clearTimeout(timeout);
                    finish('error');
                }
            });
        });
    };

    const imagePromises = imageElements.map(img => {
        return makeSafePromise(({ success, error }) => {

            // 🔥 THIS IS THE KEY LINE
            img.loading = "eager";

            if (img.complete && img.naturalWidth !== 0) {
                success();
                return;
            }

            img.addEventListener('load', success, { once: true });
            img.addEventListener('error', error, { once: true });

            // 🔥 FORCE the browser to re-evaluate loading
            img.src = img.src;

        }, img.src || '[no src]');
    });

    const audioPromises = audioEntries.map(audio => {
        return makeSafePromise(({ success, error }) => {

            if (audio.readyState >= 3) {
                success();
                return;
            }

            audio.preload = "auto";
            audio.addEventListener('canplaythrough', success, { once: true });
            audio.addEventListener('error', error, { once: true });

            audio.load();

        }, audio.src || '[unknown audio]');
    });

    const MAX_BLOCKING_LOADER_MS = 240000;
    const allAssetPromises = [...imagePromises, ...audioPromises];
    const allAssetsDonePromise = Promise.all(allAssetPromises);
    const didHitGlobalTimeout = await Promise.race([
        allAssetsDonePromise.then(() => false),
        new Promise(resolve => setTimeout(() => resolve(true), MAX_BLOCKING_LOADER_MS))
    ]);

    if (didHitGlobalTimeout) {
        console.warn("⏱️ Global loader timeout hit at 90s; continuing while remaining assets load.");
    }

    loadingText.textContent = didHitGlobalTimeout ? "CONTINUING..." : "DONE!";
    loadingBar.style.width = "100%";
    if (loadingMascot) {
        loadingMascot.style.left = "100%";
    }

    await new Promise(r => setTimeout(r, 400));

    if (didShowLoadingScreen) {
        loadingScreen.style.display = 'none';
    }

    // If the loader timed out, remaining assets continue to load in background.
    if (didHitGlobalTimeout) {
        allAssetsDonePromise.catch(() => {});
    }
}

//restart confirmation
async function showThemedConfirm(message, subMessage = "") {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; flex-direction:column;";

        overlay.innerHTML = `
            <div class="click-popup" style="position:relative; transform:none; animation:none;">
                <p style="margin-bottom:10px;">${message}</p>
                ${subMessage ? `<p style="font-size:16px; margin-bottom:20px; opacity:0.8;">${subMessage}</p>` : ''}
                <div style="display:flex; gap:20px; justify-content:center; margin-top:15px;">
                    <button id="confirm-yes" class="theme-clickable" style="background:rgba(130, 30, 40, 0.95); border:1px solid #c9a84c; color:#c9a84c; padding:8px 20px; border-radius:4px;">Yes</button>
                    <button id="confirm-no" class="theme-clickable" style="background:rgba(60, 10, 15, 0.95); border:1px solid #c9a84c; color:#c9a84c; padding:8px 20px; border-radius:4px;">No</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('#confirm-yes').onclick = () => { overlay.remove(); resolve(true); };
        overlay.querySelector('#confirm-no').onclick = () => { overlay.remove(); resolve(false); };
    });
}




//-------- final exit video --------//
function showEndVideo() {
    const page = document.getElementById('end-progression-page');
    const video = document.getElementById('end-video');

    stopAllAudio();
    startGlobalAudio('end-progression-page', { forceRestart: true });

    page.classList.remove('hidden');
    video.currentTime = 0;
    video.play();

    document.body.style.pointerEvents = "none";

    video.onended = async () => {
        await fadeTransition(async () => {
            page.classList.add('hidden');
            document.getElementById('thanks-page').classList.remove('hidden');
            state.gameCompleted = true;

            // RESET INTERACTION HERE
            document.body.style.pointerEvents = "auto";
        });

        // Also keep it here as a safety fallback
        document.body.style.pointerEvents = "auto";
    };
}

async function returnToMainMenu() {

    if (typeof saveGame === "function") {
        saveGame(state.currentPage);
        console.log("Game saved manually before quitting.");
    }

    stopAllAudio();
    clearSave();

    document.body.classList.add('menu-mode');

    play.classList.add('hidden');

    document.getElementById('thanks-page')?.classList.add('hidden');
    document.getElementById('end-progression-page')?.classList.add('hidden');
    document.getElementById('end-video-page')?.classList.add('hidden');

    // Hide the persistent HUD elements
    document.getElementById('inventory-drawer').classList.add('hidden');
    document.getElementById('hamburger-menu').classList.add('hidden');
    document.getElementById('hint-btn').classList.add('hidden');
    document.getElementById('hint-box').classList.add('hidden');

    menu.classList.remove('hidden');
    runMenuTypewriter();
    startGlobalAudio('menu-screen');
}

//----- SAVE THE GAME ON REFRESH----//
window.addEventListener('pagehide', () => {
    if (state.currentPage) {
        saveGame(state.currentPage);
    }
});


// ----- INITIALIZE EVENT LISTENERS -----

function init() {
    //Menu System
    runMenuTypewriter();

    startButton.onclick = async () => {
        if (hasSaveFile()) {
            const confirmOverwrite = await showThemedConfirm(
                "Start a new game?",
                "This will overwrite your current save file and erase all progress."
            );

            if (!confirmOverwrite) {
                showPage('menu-screen');
                return;
            }

            // User explicitly accepted overwrite
            clearSave();
        }

        // No save exists, or user accepted overwrite
        showPage('disclaimer-page');
    };
    window.addEventListener('DOMContentLoaded', () => {

        document.getElementById('confirm-start-btn').onclick = async () => {
            await loadEverything();
            stopGlobalAudio();
            prepareGameUI();

            requestAnimationFrame(async () => {
                state.isTutorialActive = true;
                await showPage('apt-fd-page'); // first real savable page

                const handle = document.getElementById('apt-fd-handle-hitbox');
                if (handle) handle.classList.add('hidden');

                await delay(20);
                await spawnThemedBox(
                    "It's been a long day of class. I'm glad to be back at my apartment.",
                    "notification-top"
                );

                runTutorial();
            });
        };

        document.getElementById('cancel-start-btn').onclick = () => {
            showPage('menu-screen');
        };
    });


    loadSaveButton.onclick = async () => {
        // MOVE THIS TO THE TOP
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
            alert("No save file found!"); //fixme change this so it's not an alert
            return; // Exit immediately so no UI or assets are touched
        }

        // --- 1. PRE-LOAD ASSETS ---
        // Wait for all images/sounds to be ready before showing the game
        await loadEverything();

        // --- 2. LOAD DATA ---
        // This updates the global 'state' object immediately
        const saveData = loadGame();

        const savedPageEl = saveData?.currentPage ? document.getElementById(saveData.currentPage) : null;
        if (!savedPageEl || !savedPageEl.classList.contains('fit')) {
            alert("Save file is invalid or from a menu screen. Please start a new game.");
            clearSave();
            showPage('menu-screen');
            return;
        }

        if (saveData && saveData.currentPage) {

            // --- 3. UI RESET (The Fix) ---
            // Force all drawers and menus shut so they don't block the screen

            const menuOverlay = document.getElementById('main-menu-overlay');
            if (menuOverlay) menuOverlay.classList.add('hidden');

            const hintBox = document.getElementById('hint-box');
            if (hintBox) hintBox.classList.remove('hint-open');

            const invPanel = document.getElementById('inventory-panel');
            if (invPanel) invPanel.classList.remove('inventory-open');

            // --- 4. PREPARE UI ---
            // Sets up inventory slots and tutorial flags based on the loaded 'state'
            prepareGameUI();

            requestAnimationFrame(async () => {
                // --- 5. RENDER GAME WORLD ---
                // Update the Page to the saved location
                await showPage(saveData.currentPage);

                // Force the UI to reflect the loaded inventory items
                if (typeof updateInventoryUI === "function") {
                    updateInventoryUI();
                }

                // Force the map to reflect discovered rooms
                updateMap(saveData.currentPage);
                drawMap();

                // If tutorial was saved at the map-close step, reopen map on load.
                if (state.currTutorialStep === 'map-close') {
                    document.getElementById('map-screen')?.classList.remove('hidden');
                }

                // Resume tutorial logic/listeners when loading from apartment pages.
                // Without this, tutorial notifications and step progression can soft-lock.
                if (state.isTutorialActive) {
                    runTutorial(true);
                }

                console.log("Load Successful. Current room:", saveData.currentPage);
            });

        } else {
            // --- FALLBACK LOGIC ---
            // If data is corrupted or missing specific room info
            console.warn("Save data corrupted. Using fallback to Main Hall.");

            // Still need to hide the menu to see the fallback room!
            document.getElementById('main-menu-overlay')?.classList.add('hidden');

            prepareGameUI();
            showPage('mh-bd-main-page');

            if (typeof updateInventoryUI === "function") {
                updateInventoryUI();
            }

            updateMap('mh-bd-main-page');
            drawMap();
        }
    };
    function updateInventoryUI() {
        // Hide everything first
        document.querySelectorAll('.inv-item').forEach(item => item.classList.add('hidden'));

        // Only show what is in the state.inventory array
        state.inventory.forEach(itemId => {
            const el = document.getElementById(itemId);
            if (el) el.classList.remove('hidden');
        });

        if (typeof refreshInventorySlots === "function") refreshInventorySlots();
    }
    // 1. Logic for switching between Info Tabs
    document.querySelectorAll('.tab-btn[data-target]').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            // Remove active class from all buttons and hide all sections
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.info-tab-content').forEach(section => section.classList.add('hidden'));

            // Add active class to clicked button and show the target section
            button.classList.add('active');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

// 2. Logic for the Main Menu (Back) Button
    document.getElementById('info-back-button').onclick = () => {
        document.getElementById('info-screen').classList.add('hidden');
        startGlobalAudio('menu-screen');
    };

// 3. Opening the Info Screen (Triggered from your Main Menu)
    if (infoButton) {
        infoButton.onclick = () => {
            document.getElementById('info-screen').classList.remove('hidden');
            startGlobalAudio('info-screen');

            // Always start on Fun Facts to match the tab order
            const defaultTab = document.querySelector('.tab-btn[data-target="facts"]');
            if (defaultTab) defaultTab.click();
        };
    }

    //Settings button
    document.getElementById('settings-button').onclick = () => {
        menu.classList.add('hidden');
        document.getElementById('settings-screen').classList.remove('hidden');
        startGlobalAudio('settings-screen');
    };

    //Back button from Settings
    document.getElementById('settings-back-button').onclick = () => {
        document.getElementById('settings-screen').classList.add('hidden');
        menu.classList.remove('hidden');
        startGlobalAudio('menu-screen');
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

    startGlobalAudio('menu-screen');

    function fadeClipOutForBackground(clip, durationMs = 280) {
        if (!clip || clip.paused) return;

        if (clip.visibilityFadeTimer) {
            clearInterval(clip.visibilityFadeTimer);
            clip.visibilityFadeTimer = null;
        }

        const startVolume = clip.volume;
        clip.visibilityTargetVolume = startVolume;

        if (startVolume <= 0.001) {
            clip.pause();
            return;
        }

        const steps = 12;
        const interval = Math.max(12, Math.floor(durationMs / steps));
        let step = 0;

        clip.visibilityFadeTimer = setInterval(() => {
            step++;
            const progress = step / steps;
            clip.volume = Math.max(0, startVolume * (1 - progress));

            if (step >= steps) {
                clearInterval(clip.visibilityFadeTimer);
                clip.visibilityFadeTimer = null;
                clip.pause();
                clip.volume = Math.max(0, startVolume);
            }
        }, interval);
    }

    function fadeClipBackInOnFocus(clip, durationMs = 220) {
        if (!clip) return;

        if (clip.visibilityFadeTimer) {
            clearInterval(clip.visibilityFadeTimer);
            clip.visibilityFadeTimer = null;
        }

        const targetVolume = Math.max(
            0,
            typeof clip.visibilityTargetVolume === 'number'
                ? clip.visibilityTargetVolume
                : clip.volume
        );

        if (clip.paused) {
            clip.volume = 0;
            safePlay(clip, { suppressAutoplayWarning: false });
        }

        if (targetVolume <= 0.001) {
            clip.volume = 0;
            return;
        }

        const steps = 12;
        const interval = Math.max(12, Math.floor(durationMs / steps));
        let step = 0;

        clip.visibilityFadeTimer = setInterval(() => {
            step++;
            clip.volume = Math.min(targetVolume, targetVolume * (step / steps));

            if (step >= steps) {
                clearInterval(clip.visibilityFadeTimer);
                clip.visibilityFadeTimer = null;
                clip.volume = targetVolume;
            }
        }, interval);
    }

    //audio behavior when webpage is not currently being viewed
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (currentGlobalId) {
                const globalSound = pageSounds[currentGlobalId];
                if (globalSound?.clip && !globalSound.clip.paused) {
                    fadeClipOutForBackground(globalSound.clip);
                }
            }

            if (currentRoomId) {
                const roomSound = pageSounds[currentRoomId];
                if (roomSound?.clip && !roomSound.clip.paused) {
                    fadeClipOutForBackground(roomSound.clip);
                }
            }
            return;
        }

        if (currentGlobalId) {
            const sound = pageSounds[currentGlobalId];

            if (sound?.clip) {
                fadeClipBackInOnFocus(sound.clip);
            }
        }

        if (currentRoomId) {
            const sound = pageSounds[currentRoomId];

            if (sound?.clip) {
                fadeClipBackInOnFocus(sound.clip);
            }
        }
    });


    // ---- IN-GAME HAMBURGER MENU ----
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');

    hamburgerIcon.onclick = () => {
        hamburgerDropdown.classList.toggle('dropdown-open');
    };

    // View Map button
    document.getElementById('map-btn').onclick = () => {
        hamburgerDropdown.classList.remove('dropdown-open');
        if (!document.getElementById('wordle-minigame').classList.contains('hidden')) {
            closeWordle();
        }
        if (!document.getElementById('security-login-minigame').classList.contains('hidden')) {
            closeSecurityTerminal();
        }
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
        if (!document.getElementById('wordle-minigame').classList.contains('hidden')) {
            closeWordle();
        }
        if (!document.getElementById('security-login-minigame').classList.contains('hidden')) {
            closeSecurityTerminal();
        }
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

    document.getElementById('restart-btn').onclick = async () => {
        if (!document.getElementById('wordle-minigame').classList.contains('hidden')) {
            closeWordle();
        }
        if (!document.getElementById('security-login-minigame').classList.contains('hidden')) {
            closeSecurityTerminal();
        }
        // 1. Initial confirmation
        const confirmRestart = await showThemedConfirm("Are you sure you want to restart?", "All current progress will be lost.");
        if (!confirmRestart) return;

        // 2. Load latest data to ensure state is accurate
        await loadEverything();
        //const saveData = loadGame();

        // 3. Debugging (Check your console if it doesn't work!)
        const hasFinishedBefore = localStorage.getItem('tutorialCompleted') === 'true';
        const isCurrentlyInMainGame = state.isTutorialActive === false;

        console.log("Skip Check -> Finished Before:", hasFinishedBefore, "| In Main Game:", isCurrentlyInMainGame);

        let wantToSkip = false;

        // 4. THE CHECK
        // If they have completed it ever AND they are not currently doing the tutorial
        if (hasFinishedBefore && isCurrentlyInMainGame) {
            wantToSkip = await showThemedConfirm("Would you like to skip the tutorial?");
        }

        // 5. Reset and Execute
        clearSave();
        prepareGameUI();


        if (wantToSkip) {
            state.isTutorialActive = false;
            await showPage('mh-bd-main-page');
        } else {
            state.isTutorialActive = true;
            await showPage('apt-fd-page');


            const handle = document.getElementById('apt-fd-handle-hitbox');
            if (handle) handle.classList.add('hidden');

            await delay(50);
            await spawnThemedBox("It's been a long day of class. I'm glad to be back at my apartment.", "notification-top");
            runTutorial();
        }
    };

    document.getElementById('quit-btn').onclick = () => {
        if (!document.getElementById('wordle-minigame').classList.contains('hidden')) {
            closeWordle();
        }
        if (!document.getElementById('security-login-minigame').classList.contains('hidden')) {
            closeSecurityTerminal();
        }
        // 1. SAVE THE STATE BEFORE WIPING THE UI
        if (typeof saveGame === "function") {
            saveGame(state.currentPage);
            console.log("Game saved manually before quitting.");
        }

        stopAllAudio();

        document.body.classList.add('menu-mode'); // <--- ADD THIS

        hamburgerDropdown.classList.remove('dropdown-open');
        play.classList.add('hidden');

        // Hide the persistent HUD elements
        document.getElementById('inventory-drawer').classList.add('hidden');
        document.getElementById('hamburger-menu').classList.add('hidden');
        document.getElementById('hint-btn').classList.add('hidden');
        document.getElementById('hint-box').classList.add('hidden');

        menu.classList.remove('hidden');
        runMenuTypewriter();
        startGlobalAudio('menu-screen');
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


    //main hall interaction end bw
    document.getElementById('mh-sl-right-endc-sl-hitbox').onclick = () => showPage('mh-sld-page');
    document.getElementById('mh-sl-left-endc-sl-hitbox').onclick = () => showPage('mh-sld-page');
    document.getElementById('mh-bh-left-endc-bh-hitbox').onclick = () => showPage('bh-entrance-page');
    document.getElementById('mh-bh-right-endc-bh-hitbox').onclick = () => showPage('bh-entrance-page');
    document.getElementById('mh-bd-left-endc-bd-hitbox').onclick = () => showPage('mh-bd-main-page');
    document.getElementById('mh-bd-right-endc-bd-hitbox').onclick = () => showPage('mh-bd-main-page');
    document.getElementById('mh-li-left-endc-li-hitbox').onclick = () => showPage('mh-li-door-closed-page');
    document.getElementById('mh-li-right-endc-li-hitbox').onclick = () => showPage('mh-li-door-closed-page');

    document.getElementById('mh-bw-door-hitbox').onclick = async() => {
        await spawnThemedBox("The door won't budge", 'notification-top');
    }

    // --- Book Drop (BD) Interactions ---

    // Main -> Door
    document.getElementById('bd-door-hitbox').onclick = () => showPage('mh-bd-door-page');

    // Door -> Slot or Handle
    document.getElementById('bd-slot-hitbox').onclick = () => showPage('mh-bd-slot-closed-page');
    document.getElementById('bd-handle-hitbox').onclick = () => showPage('mh-bd-door-handle-page');

    // Inside the Slot
    document.getElementById('bd-closed-hitbox').onclick = () => {
        triggerSound('hatchOpen');
        state.hasBdKey ? showPage('mh-bd-slot-open-page') : showPage('mh-bd-slot-open-key-page');
    };
    document.getElementById('bd-key-hitbox').onclick = async () => {
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
    document.getElementById('bd-slot-open-hitbox').onclick = () => {
        triggerSound('hatchClose');
        showPage('mh-bd-slot-closed-page');
    }

    // bd Door Handle & Locking
    document.getElementById('bd-door-keyhole-hitbox').onclick = async () => {
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
    document.getElementById('bd-door-handle-hitbox').onclick = async () => {
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
        triggerSound('bdBookOpen');
        state.hasPrKey ? showPage('bd-fb-open-page') : showPage('bd-fb-open-key-page');
    };
    document.getElementById('bd-fb-key-hitbox').onclick = async () => {
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

    document.getElementById('bd-back-handle-keyhole-hitbox').onclick = async () => {
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
    document.getElementById('bd-back-handle-handle-hitbox').onclick = async () => {
        if (state.bdBackDoorUnlocked) {
            triggerSound('openDoor');
            showPage('bd-back-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', "notification-top");
        }
    };

    //entering room behind book drop
    document.getElementById('bd-back-door-enter-hitbox').onclick = () =>  {
        if (state.isProjectorOn) {
            showPage ('pr-steps-po-page');
        } else {
            showPage('pr-steps-page');
        }
    }

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
    document.getElementById('pr-pw-book-projector-on-hitbox').onclick = async () => {
        await spawnThemedBox("This projector looks so old, I'm surprised it even works", "notification-top");
    }
    document.getElementById('pr-pw-noBook-projector-on-hitbox').onclick = async () => {
        await spawnThemedBox("This projector looks so old, I'm surprised it even works", "notification-top");
    }

    document.getElementById('pr-pw-he-projector-hitbox').onclick = () => showPage('pr-pw-noBook-projector-off-page');
    document.getElementById('pr-pw-hb-projector-hitbox').onclick = () => showPage('pr-pw-book-projector-off-page');

    document.getElementById('pr-pw-book-projector-hitbox').onclick = async () => {
        if (state.solvedWirePuzzle) {
            state.isProjectorOn = true;
            showPage ('pr-pw-book-projector-on-page');
        } else {
            await spawnThemedBox("I wonder if I could get this projector to turn on", "notification-top");
        }
    }

    document.getElementById('pr-po-wr-hitbox').onclick = () => showPage('pr-wr-main-page');

    document.getElementById('pr-pw-noBook-projector-hitbox').onclick = async () => {
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
    document.getElementById('pr-pw-po-he-diamond-hitbox').onclick = async() => {
        await spawnThemedBox("A green diamond ?","notification-top");
    }
    document.getElementById('pr-pw-po-hb-diamond-hitbox').onclick = async() => {
        await spawnThemedBox("A green diamond ?", "notification-top");
    }

    //collect pw book
    document.getElementById('pr-pw-hole-book-hitbox').onclick = () => {
        triggerSound('grabBook');
        state.hasPwBook = true;
        const keySlot = document.getElementById('inv-pw-book')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('pr-pw-hole-noBook-page');
        openOverlay('pw-book', 'inv-images/pw-book.png');
    }
    document.getElementById('pr-pw-hole-noBook-hitbox').onclick = async () => {
        await spawnThemedBox('Who put all these books in this hole ?', "notification-top");
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
    document.getElementById('wire-exit-btn').onclick = async () => {
        document.getElementById('wire-puzzle').classList.add('hidden');
        document.getElementById('wire-solved-popup').classList.add('hidden');

        if (state.solvedWirePuzzle && !state.notificationsSeen['wire-puzzle-win-projector-hint']) {
            state.notificationsSeen['wire-puzzle-win-projector-hint'] = true;
            await spawnThemedBox("I wonder if I can get that projector to turn on now", "notification-top");
        }
    };

    // Wire puzzle popup close button
    document.getElementById('wire-popup-close').onclick = () => {
        document.getElementById('wire-solved-popup').classList.add('hidden');
    };


    //------ KITCHEN SECTION ------
    document.getElementById('mh-cend-right-endc-ki-hitbox').onclick = () => showPage('mh-ki-door-closed-page');

    //handle and locking
    document.getElementById('ki-door-handle-hitbox').onclick = () => showPage('mh-ki-door-handle-page');

    document.getElementById('ki-door-handle-keyhole-hitbox').onclick = async () => {
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
    document.getElementById('ki-door-handle-handle-hitbox').onclick = async () => {
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
        triggerSound('paperTowel');
        showPage('ki-pt-code-page');
    }
    document.getElementById('ki-pt-code-hitbox').onclick= async () => {
        await spawnThemedBox('3672', "notification-top");
        await spawnThemedBox('Who would write a code here ?', "notification-top");
        await spawnThemedBox('And what is it for ?', "notification-top");
    }


    // ----- CREEPY ROOM SECTION -----
    document.getElementById('bh-bath-hitbox').onclick = async () => {
        await spawnThemedBox("There's a bad smell coming from this bathroom. I don't want to go in there.", 'notification-top');
    }
    document.getElementById('bh-exit-door-hitbox').onclick = async () => {
        await spawnThemedBox("Oh wow. It looks like this place has been buried underground", 'notification-top');
    }

    document.getElementById('sh-entrance-hitbox').onclick = () => {
        state.crDoorOpen ? showPage('sh-cr-do-page'):showPage('sh-cr-dc-page');
    }
    document.getElementById('bh-entrance-hitbox').onclick = () => showPage('bh-2-page');
    document.getElementById('bh-sh-cr-dc-hitbox').onclick = () => showPage('sh-cr-door-closed-page');
    document.getElementById('bh-sh-cr-do-hitbox').onclick = () => showPage('sh-cr-door-open-page');

    document.getElementById('bh-sh-cr-door-closed-hitbox').onclick = () => showPage('sh-cr-door-handle-page');
    document.getElementById('bh-sh-cr-door-handle-handle-hitbox').onclick = async () => {
        if (state.crUnlocked) {
            triggerSound('openDoor');
            state.crDoorOpen = true;
            showPage('sh-cr-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', 'notification-top');
        }
    }
    document.getElementById('bh-sh-cr-door-handle-keypad-hitbox').onclick = () => {
        showPage('sh-cr-door-keypad-page');
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
    document.getElementById('bh-sh-cr-dc-sh-hitbox').onclick = () => showPage('sh-main-page');
    document.getElementById('bh-sh-cr-do-sh-hitbox').onclick = () => showPage('sh-main-page');

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
    document.getElementById('cr-couch-key-hitbox').onclick = async () => {
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
    document.getElementById('cr-couch-hitbox').onclick = async () => {
        await spawnThemedBox("There's nothing left in the cushions", "notification-top");
    }

    document.getElementById('cr-main-2dc-doors-hitbox').onclick = () => showPage('cr-doors-2dc-page');
    document.getElementById('cr-main-doors-hitbox').onclick = () => {
        state.isLeftMonitorOn ? showPage('cr-doors-cam-page') : showPage('cr-doors-page');
    }

    document.getElementById('cr-main-1dc-doors-hitbox').onclick = () => {
        if (state.isLeftMonitorOn) {
            showPage('cr-doors-1dc-cam-page')
        } else {
            showPage('cr-doors-1dc-page');
        }
    }
    document.getElementById('cr-doors-1dc-cam-rd-hitbox').onclick = () => {
        if (state.crlDoorOpen) {
            showPage('camr-main-ml-on-page');
        } else {
            showPage("camr-main-ml-on-person-page");
        }
    }
    document.getElementById('cr-doors-cam-rd-hitbox').onclick = () => showPage('camr-main-ml-on-page');

    document.getElementById('cr-doors-2dc-rd-hitbox').onclick = () => showPage('cr-camr-door-closed-page');
    document.getElementById('cr-camr-door-closed-hitbox').onclick = async () => {
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
    //document.getElementById('cr-doors-1dc-ld-hitbox').onclick = () => showPage('cr-doors-1dc-ld-page');
    document.getElementById('cr-1dc-ld-door-closed-hitbox').onclick = async () => {
        if (state.hasClrKey) {
            triggerSound('unlock');
            state.crlUnlocked = true;
            state.crlDoorOpen = true;
            const keySlot = document.getElementById('inv-clr-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('clr-main-id-page');
            //await spawnThemedBox('What is that ?? And ID card ? Why is it so large ??', 'notification-top');
        } else {
            await spawnThemedBox('I need to find a key for this door', "notification-top");
        }
    }
    document.getElementById('cr-doors-cam-ld-hitbox').onclick = () => {state.hasWrId ? showPage('clr-main-page'): showPage('clr-main-id-page') };
    //document.getElementById('cr-doors-ld-hitbox').onclick = () => {state.hasWrId ? showPage('clr-main-page'): showPage('clr-main-id-page') };
    document.getElementById('clr-main-cloth-hitbox').onclick = async () => {
        showPage('clr-cloth-page');
    }
    document.getElementById('clr-main-id-cloth-hitbox').onclick = async () => {
        showPage('clr-cloth-page');
    }
    document.getElementById('clr-cloth-hitbox').onclick = () => {showPage('clr-cloth-octagon-page'); state.foundOctagon = true;}
    document.getElementById('clr-cloth-octagon-hitbox').onclick = async () => {
        await spawnThemedBox("Another shape...", "notification-top");
    }
    document.getElementById('clr-main-id-id-hitbox').onclick = async () => {
        state.hasWrId = true;
        const keySlot = document.getElementById('inv-wr-id');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('clr-main-page');
        openOverlay('inv-wr-id', 'inv-images/wr-id.png');
        await spawnThemedBox("The Demon Deacon's ID card. It's huge !!", "notification-top");
    }

    //----- CAMERA ROOM SECTION -----
    document.getElementById('cr-doors-1dc-rd-hitbox').onclick = () => {
        state.isLeftMonitorOn ? showPage('camr-main-ml-on-page') : showPage('camr-main-page');
    }
    document.getElementById('cr-doors-rd-hitbox').onclick = () => {
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
    document.getElementById('camr-ml-on-hitbox').onclick = async () => {
        if (!state.crlDoorOpen) {
            await spawnThemedBox('Is this camera feed showing the room to the left of here ?', "notification-top");
        } else {
            await spawnThemedBox("The person from before, they disappeared. Did they find their own way out of the room, or was it a ghost...", "notification-top");
        }
    }
    document.getElementById('camr-main-mr-hitbox').onclick = () => {
        showPage('camr-mr-off-page');
    }
    document.getElementById('camr-main-mlo-ml-hitbox').onclick = () => {
        showPage('camr-ml-on-page');
    }
    document.getElementById('camr-main-wp-window-hitbox').onclick = () => {
        showPage('camr-wp-page');
        state.justFoundWp = true;
    }
    document.getElementById('camr-wp-hitbox').onclick = async () => {
        await spawnThemedBox('A person ?? How did they get in there ? What\'s going on ?', "notification-top");
    }
    document.getElementById('camr-we-hitbox').onclick = async () => {
        if (!state.foundWp) {
            await spawnThemedBox('This window leads to the room left of here, but I can\'t really see through it', "notification-top");
        } else {
            await spawnThemedBox("I don't see anything in this window", "notification-top");
        }
    }
    document.getElementById('camr-main-ml-on-person-hitbox').onclick = async () => {
        showPage('camr-ml-on-person-page');
    }
    document.getElementById('camr-ml-on-person-hitbox').onclick = async () => {
        await spawnThemedBox("There's a person in that room ! Are they ok ? I need to get in there.", "notification-top");
    }

    document.getElementById('camr-mr-off-hitbox').onclick = async () => {
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
    document.getElementById('cw-entrance-3-eh-hitbox').onclick = () => showPage('cw-eh-entrance-page');
    document.getElementById('cw-left-eh-hitbox').onclick = () => showPage('cw-eh-entrance-page');
    document.getElementById('cw-right-aw-eh-hitbox').onclick = () => showPage('cw-eh-entrance-page');
    document.getElementById('cw-right-eh-hitbox').onclick = () => showPage('cw-eh-entrance-page');
    document.getElementById('cw-left-2-oh1-entrance-hitbox').onclick = () => showPage('cw-oh1-entrance-page');
    document.getElementById('cw-right-oh1-hitbox').onclick = () => showPage('cw-oh1-entrance-page');
    document.getElementById('cw-left-bath-hitbox').onclick = () => showPage('cw-bath-door-page');
    document.getElementById('cw-right-bath-hitbox').onclick = () => showPage('cw-bath-door-page');
    document.getElementById('cw-left-snh-wro-snh-hitbox').onclick = () => showPage('snh-entrance-page');
    document.getElementById('cw-left-snh-wrc-snh-hitbox').onclick = () => showPage('snh-entrance-page');
    document.getElementById('cw-right-snh-hitbox').onclick = () => showPage('snh-entrance-page');
    document.getElementById('cw-right-aw-hitbox').onclick = () => showPage('cw-stairs-entrance-page');
    document.getElementById('cw-right-bath-aw-hitbox').onclick = () => showPage('cw-stairs-entrance-page');
    document.getElementById('cw-right-print-oh1-hitbox').onclick = () => showPage('cw-oh2-exit-page');
    document.getElementById('cw-right-print-oh2-hitbox').onclick = () => showPage('cw-oh2-entrance-page');

    document.getElementById('cw-oh2-exit-oh1-hitbox').onclick = () => showPage('oh1-left-3-page');
    document.getElementById('cw-oh2-entrance-hitbox').onclick = () => showPage('oh2-entrance-page');
    document.getElementById('cw-stairs-entrance-hitbox').onclick = () => showPage('cw-stairs-door-page');
    document.getElementById('oh1-exit-1-hitbox').onclick = () => showPage('cw-oh1-exit-1-page');
    document.getElementById('oh1-exit-2-hitbox').onclick = () => showPage('cw-oh2-entrance-page');
    document.getElementById('oh1-right-2-exit-hitbox').onclick = () => showPage('oh1-exit-2-page');
    document.getElementById('oh1-right-3-exit-hitbox').onclick = () => showPage('oh1-exit-1-page');
    document.getElementById('oh1-left-2-exit-hitbox').onclick = () => showPage('oh1-exit-2-page');
    document.getElementById('oh2-exit-hitbox').onclick = () => showPage('cw-oh2-exit-page');


    document.getElementById('cw-aw-return-hitbox').onclick = () => showPage('cw-stairs-entrance-page');
    document.getElementById('mh-cend-right-endc-cw-hitbox').onclick = () => {
        triggerSound('cwDoor');
        showPage('stairs-rubble-page');
    }
    document.getElementById('mh-cw-stairs-rubble-hitbox').onclick = async () => {
        await spawnThemedBox("What happened here ? It looks like the upper floors have been demolished.", "notification-top");
    }
    document.getElementById('mh-cw-stairs-hitbox').onclick = () => {
        showPage('stairs-page');
    }
    document.getElementById('mh-cw-stairs-door-hitbox').onclick = () => {
        triggerSound('steps');
        showPage('stairs-cw-door-page');
    }
    document.getElementById('mh-cw-door-plate-hitbox').onclick = () => {
        showPage('stairs-cw-door-plate-page');
    }
    document.getElementById('mh-cw-plate-hitbox').onclick = async () => {
        await spawnThemedBox("What is this plate for ?", "notification-top");
    }
    document.getElementById('mh-cw-door-hitbox').onclick = () => {
        triggerSound('cwDoor');
        showPage('cw-entrance-page');
    }
    document.getElementById('cw-stairs-door-hitbox').onclick = () => {
        triggerSound('cwDoor');
        showPage('stairs-up-page');
    }
    document.getElementById('stairs-aw-door-hitbox').onclick = () => {
        triggerSound('cwDoor');
        showPage('mh-cend-left-endc-page');
    };
    document.getElementById('cw-bath-door-hitbox').onclick = async () => {
        triggerSound('openBathDoor');
        showPage('bath-page');
    }
    document.getElementById('bath-sink-hitbox').onclick = () => showPage('bath-sink-page');
    document.getElementById('bath-sink-sink-hitbox').onclick = async () => {
        await spawnThemedBox("This sink is so old you can't turn the water off", "notification-top");
    }
    document.getElementById('cw-wr-dc-hitbox').onclick = () => showPage('cw-wr-handle-locked-page');
    document.getElementById('cw-wr-scanner-hitbox').onclick = async () => {
        if (state.hasWrId) {
            triggerSound('keycardSwipe');
        state.wrUnlocked = true;
        const keySlot = document.getElementById('inv-wr-id');
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
    document.getElementById('cw-elevator-hitbox').onclick = async () => {
        await spawnThemedBox("It's not working", "notification-top");
    }
    document.getElementById('cw-wr-locked-handle-hitbox').onclick = async () => {
        await spawnThemedBox("I need to unlock the door first", "notification-top");
    }
    document.getElementById('cw-wr-unlocked-handle-hitbox').onclick = () => {
        triggerSound('doorOpenClose')
        showPage('wr-mid-page')
    };
    document.getElementById('oh3-entrance-hitbox').onclick = () => showPage('oh2-oh3-entrance-page');

    document.getElementById('cw-oh1-entrance-hitbox').onclick = () => showPage('oh1-left-1-page');
    document.getElementById('oh1-left-4-key-books-hitbox').onclick = () => showPage('oh1-books-key-page');
    document.getElementById('oh1-books-hitbox').onclick = async () => {
        await spawnThemedBox("I don't see anything else useful here", "notification-top");
    }
    document.getElementById('oh1-books-key-hitbox').onclick = async () => {
        state.hasClrKey = true;
        const keySlot = document.getElementById('inv-clr-key')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('oh1-books-page');
        await delay(20);
        await spawnThemedBox("Another key !", "notification-top");
        if (!state.isPrinterCalibrated) {
        triggerSound('printClick');
        setTimeout(async () => {
            await spawnThemedBox("Is that a printer making noise ?", "notification-top");
            setTimeout(async () => {
                await spawnThemedBox("Maybe I should go check it out", "notification-top");
            }, 2000);
        }, 1500);
        }
    }
    document.getElementById('printer-hitbox').onclick = () => showPage('print-page');
    document.getElementById('printer-paper-hitbox').onclick = async () => {
        showPage('print-paper-page');
    }
    document.getElementById('print-screen-hitbox').onclick = () => showPage('print-screen-page');
    document.getElementById('print-screen-2-hitbox').onclick = async () => {
        if (!state.isPrinterCalibrated) {
            const minigame = document.getElementById('printer-sync-minigame');
            if (minigame) minigame.classList.remove('hidden');

            // 3. Reset the state
            currentLevel = 1;
            isRunning = true;

            generateRandomTarget();
            update();
        } else {
            await spawnThemedBox("I've already calibrated the printer", "notification-top");
        }
    }
    document.getElementById('print-paper-hitbox').onclick = async () => {
        triggerSound('floppyPaper');
        openOverlay("print-paper", "cw-images/cw-sideHall-images/print-paper-item.png");
        if (!state.notificationsSeen['fax-inspect-init']) {
            state.notificationsSeen['fax-inspect-init'] = true;
            await spawnThemedBox("A... fax to the president of the US ? from 1963 ?!? what's this about ?", "notification-top");
        }
    };
    document.getElementById('cw-right-print-room-hitbox').onclick = () => {state.isPrinterCalibrated ? showPage('print-main-paper-page') : showPage('print-main-page')};

    document.getElementById('eh-door-stuff-hitbox').onclick = () => showPage("cw-eh-door-plate-page");
    document.getElementById('eh-door-plate-hitbox').onclick = async () => {
        await spawnThemedBox("Another one of those plates...", "notification-top");
    }
    document.getElementById('eh-door-sign-hitbox').onclick = async () => {
        await spawnThemedBox("A nuclear fallout warning sign ? What is this from the 1960s?", "notification-top");
    }



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
    document.getElementById('wr-desk-hitbox').onclick = async () => {
        await spawnThemedBox("I don't see anything else useful here", "notification-top");
    }
    document.getElementById('wr-left-desk-hitbox').onclick = () => showPage('wr-desk-page');
    document.getElementById('wr-right-papers-hitbox').onclick = async () => {
        showPage('wr-papers-page');
        await delay(20);
        await spawnThemedBox("who left these papers here ?", "notification-top");
        state.foundWrPapers = true;
        triggerSound('markerWhiteboard');
    }
    document.getElementById('wr-right-note-papers-hitbox').onclick = () => showPage('wr-papers-page');
    document.getElementById('wr-papers-tu-hitbox').onclick = async () => {
        triggerSound('stiffPaper');
        openOverlay('wr-tu', "wr-images/wr-tu.png");
        if (!state.notificationsSeen['tu-init']) {
            await spawnThemedBox("A cutout of a newspaper article about underground tunnels", "notification-top");
            state.notificationsSeen['tu-init']=true;
        }
    }
    document.getElementById('wr-papers-ogb-hitbox').onclick = async () => {
        triggerSound('stiffPaper');
        openOverlay('wr-ogb', 'wr-images/wr-ogb.png');
        if (!state.notificationsSeen['ogb-init']) {
            await spawnThemedBox("The old gold and black. That's the school newspaper", "notification-top");
            state.notificationsSeen['ogb-init']=true;
        }
    }
    document.getElementById('wr-papers-reddit-hitbox').onclick = async () =>  {
        triggerSound('stiffPaper');
        openOverlay('wr-reddit', 'wr-images/wr-reddit.png');
        if (!state.notificationsSeen['reddit-init']) {
            await spawnThemedBox("A printout of some random reddit post ?", "notification-top");
            state.notificationsSeen['reddit-init']=true;
        }
    }
    document.getElementById('wr-right-note-note-hitbox').onclick = async () => {
        state.foundWrNote = true;
        showPage('wr-note-page');
    }
    document.getElementById('wr-note-hitbox').onclick = () => {
        openWrNoteReaderOverlay();
    };


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
    document.getElementById('li-door-handle-keyhole-hitbox').onclick = async () => {
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
    document.getElementById('li-door-handle-handle-hitbox').onclick = async () => {
        if (state.liUnlocked) {
            triggerSound('openDoor');
            showPage('li-door-open-page');
        } else {
            await spawnThemedBox('I need to unlock the door first', "notification-top");
        }
    }
    document.getElementById('li-main-lw-lt-hitbox').onclick = () => {
        if (state.hasSkPaper) {
            showPage('li-left-lt-star-page');
        } else {
           showPage('li-left-lt-page');
        }
    }
    document.getElementById('li-left-lt-hitbox').onclick = () => showPage('li-lt-page');
    document.getElementById('li-left-star-lt-hitbox').onclick = () => showPage('li-lt-star-page');
    document.getElementById('li-lt-laptop-hitbox').onclick = () => showPage('li-laptop-page');
    document.getElementById('li-lt-scanner-hitbox').onclick = async() => {
        if (state.hasLorBook) {
            triggerSound('scanner');
            state.scannedBook = true;
            state.isLiLaptopOn = true;
            const keySlot = document.getElementById('inv-lor-book')
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-lt-star-page');
            triggerSound('bones');
        } else {
            await spawnThemedBox('I need to find a book to scan', "notification-top");
        }
    }

    document.getElementById('li-laptop-hitbox').onclick = async () => {
        await spawnThemedBox('I wonder what happens if I scan this book', 'notification-top');
        await spawnThemedBox('I should look around and see if I can find it.', 'notification-top');
        state.foundScanner = true;
    }
    document.getElementById('li-lt-star-laptop-hitbox').onclick = async() => {
        await spawnThemedBox("A yellow star...", "notification-top");
    }
    document.getElementById('li-main-lw-mw-hitbox').onclick = () => {
        state.hasLorBook ? showPage('li-mw-books-nb-page') : showPage('li-mw-books-page');
    }
    document.getElementById('li-lt-sk-paper-hitbox').onclick = async () => {
        triggerSound('stiffPaper');
        state.hasSkPaper = true;
        const keySlot = document.getElementById('inv-sk-paper')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-lt-sk-page');
        openOverlay('inv-sk-paper', 'inv-images/sk-paper.png');
        await delay(20);
        await spawnThemedBox('A piece of paper with holes in it ? It looks like the same size as the page in a novel', 'notification-top');
        await delay(20);
        await spawnThemedBox('This ghost must be trying to tell me something. I should try to find a book that stands out', 'notification-top');
    }
    document.getElementById('li-lt-sk-hitbox').onclick = async () => {
        await spawnThemedBox("How did this skeleton even get here ?", "notification-top");
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
    document.getElementById('li-esme-hitbox').onclick = async () => {
        if (state.foundScanner && !state.scannedBook) {
            await spawnThemedBox("This isn't the book I'm looking for", 'notification-top');
        } else {
            await spawnThemedBox("There’s nothing unusual about this book.", "notification-top");
        }
    }
    document.getElementById('li-ruta-hitbox').onclick = async () => {
        if (state.foundScanner && !state.scannedBook) {
            await spawnThemedBox("This isn't the book I'm looking for", 'notification-top');
        } else {
            await spawnThemedBox("There’s nothing unusual about this book.", "notification-top");
        }
    }
    document.getElementById('li-russo-hitbox').onclick = async () => {
        if (state.foundScanner && !state.scannedBook) {
            await spawnThemedBox("This isn't the book I'm looking for", 'notification-top');
        } else {
            await spawnThemedBox("There’s nothing unusual about this book.", "notification-top");
        }
    }
    document.getElementById('li-tolkein-hitbox').onclick = async () => {
        triggerSound('grabBook');
        state.hasLorBook = true;
        const keySlot = document.getElementById('inv-lor-book')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-tolkein-nb-page');
        openOverlay('li-lor-book', 'li-images/li-lor-book.png');
        await delay(20);
        await spawnThemedBox('I wonder what will happen if I scan this book', 'notification-top');
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
    document.getElementById('li-read-page').onclick = async () => {
        if (state.hasWr) {
            state.isLiReadOn = true;
            const keySlot = document.getElementById('inv-wr');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-read-on-page');
            await delay(20);
            await spawnThemedBox("Nice, it's on now. Why is each letter a different color?", "notification-top");
        } else {
            await spawnThemedBox("This LED sign looks like it can be turned on.", "notification-top");
        }
    }
    document.getElementById('li-read-on-hitbox').onclick = async () => {
        await spawnThemedBox("I wonder if the colors are of any importance", "notification-top");
    }

    document.getElementById('li-tv-remotes-hitbox').onclick = () => showPage('li-2r-page');
    document.getElementById('li-tv-br-hitbox').onclick = () => showPage('li-br-page');
    document.getElementById('li-tv-wr-hitbox').onclick = () => showPage('li-wr-page');
    document.getElementById('li-tv-tvo-wr-hitbox').onclick = () => showPage('li-wr-tvo-page');
    document.getElementById('li-2r-wr-hitbox').onclick = async () => {
        state.hasWr = true;
        const keySlot = document.getElementById('inv-wr');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-br-page');
        openOverlay("li-wr", "inv-images/wr.png");
        await spawnThemedBox("This remote looks like it could turn on some LED lights", 'notification-top');
    }
    document.getElementById('li-2r-br-hitbox').onclick = async () => {
        state.hasBr = true;
        const keySlot = document.getElementById('inv-br');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-wr-page');
        openOverlay("li-br", "inv-images/br.png");
        await spawnThemedBox("A tv remote...", "notification-top");
    }
    document.getElementById('li-wr-hitbox').onclick = () => {
        state.hasWr = true;
        const keySlot = document.getElementById('inv-wr');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-nr-page');
        openOverlay("li-wr", "inv-images/wr.png");
    }
    document.getElementById('li-wr-tvo-hitbox').onclick = () => {
        state.hasWr = true;
        const keySlot = document.getElementById('inv-wr');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-nr-tvo-page');
        openOverlay("li-wr", "inv-images/wr.png");
    }
    document.getElementById('li-br-hitbox').onclick = () => {
        state.hasBr = true;
        const keySlot = document.getElementById('inv-br');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-nr-page');
        openOverlay("li-br", "inv-images/br.png");
    }
    document.getElementById('li-tv-on-hitbox').onclick = async () => {
        await spawnThemedBox("What's up with all these shapes?", "notification-top");
    }
    document.getElementById('li-tv-hitbox').onclick = async () => {
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
    document.getElementById('li-tv-wr-tv-hitbox').onclick = async () => {
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
    document.getElementById('li-tv-wr-tvo-hitbox').onclick = async () => {
        await spawnThemedBox("What's up with all these shapes?", "notification-top");
    }
    document.getElementById('li-read-hitbox').onclick = async () => {
        if (state.hasWr) {
            state.isLiReadOn = true;
            const keySlot = document.getElementById('inv-wr');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            showPage('li-read-on-page');
            await delay(20);
            await spawnThemedBox("Nice, it's on now. Why is each letter a different color?", "notification-top");
        } else {
            await spawnThemedBox("This sign looks like it can be turned on.", "notification-top");
        }
    }

    // --------- library right wall section -----------
    //document.getElementById('li-rw-onoseta-hitbox').onclick = () => showPage('li-onoseta-page');
    document.getElementById('li-rw-alston-hitbox').onclick  = () => showPage('li-alston-page');
    document.getElementById('li-rw-barnes-hitbox').onclick  = () => showPage('li-barnes-page');
    document.getElementById('li-rw-boulley-hitbox').onclick = () => showPage('li-boulley-page');
    document.getElementById('li-alston-hitbox').onclick = async () => {
        if (state.foundScanner && !state.scannedBook) {
            await spawnThemedBox("This isn't the book I'm looking for", 'notification-top');
        } else {
            await spawnThemedBox("There’s nothing unusual about this book.", "notification-top");
        }
    }
    document.getElementById('li-barnes-hitbox').onclick = async () => {
        if (state.foundScanner && !state.scannedBook) {
            await spawnThemedBox("This isn't the book I'm looking for", 'notification-top');
        } else {
            await spawnThemedBox("There’s nothing unusual about this book.", "notification-top");
        }
    }
    document.getElementById('li-boulley-hitbox').onclick = async () => {
        if (state.foundScanner && !state.scannedBook) {
            await spawnThemedBox("This isn't the book I'm looking for", 'notification-top');
        } else {
            await spawnThemedBox("There’s nothing unusual about this book.", "notification-top");
        }
    }
    document.getElementById('li-rw-books-birb-hitbox').onclick = () => showPage('li-birb-book-page');
    document.getElementById('li-birb-book-hitbox').onclick = async () => {
        triggerSound('grabBook');
        state.hasSherlockBook = true;
        const keySlot = document.getElementById('inv-sh-book');
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('li-birb-page');
        openOverlay('sherlock-book', 'inv-images/sherlock-book.png');
    }

    document.getElementById('li-main-rw-rw-hitbox').onclick = async () => {
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
        const keySlot2 = document.getElementById('inv-sh-book');
        if (keySlot2) {
            keySlot2.classList.add('hidden');
            refreshInventorySlots();
        }
        const keySlot3 = document.getElementById('inv-sk-paper');
        if (keySlot3) {
            keySlot3.classList.add('hidden');
            refreshInventorySlots();
        }
        showPage('li-animals-open-2-page');
    }
    document.getElementById('li-animals-open-1-hitbox').onclick = () => {
        state.hasLoKey ? showPage('li-animals-open-2-page') : showPage('li-animals-open-key-page');
    }


    // --------- LIBRARY OFFICE SECTION -----------//
    document.getElementById('li-office-door-closed-hitbox').onclick = async () => {
        if (state.hasLoKey) {
            triggerSound('unlock');
            state.loUnlocked = true;
            const keySlot = document.getElementById('inv-lo-key');
            if (keySlot) {
                keySlot.classList.add('hidden');
                refreshInventorySlots();
            }
            triggerSound('doorOpen');
            showPage('li-office-door-open-page');
        } else {
            await spawnThemedBox("I need one more key...", "notification-top");
        }
    }
    document.getElementById('li-office-door-open-hitbox').onclick = () => showPage('lo-main-page');
    document.getElementById('lo-main-desk-hitbox').onclick = () => showPage('lo-desk-page');
    document.getElementById('lo-main-left-ls-entrance-hitbox').onclick = () => showPage('lo-storage-entrance-page');
    document.getElementById('lo-storage-entrance-hitbox').onclick = () => showPage('ls-in-1-page');
    document.getElementById('lo-main-right-desk-hitbox').onclick = () => showPage('lo-desk-page');
    document.getElementById('lo-desk-hitbox').onclick = () => showPage('lo-desk-2-page');
    document.getElementById('lo-desk-monitor-hitbox').onclick = () => {
        if (state.usedDrive) {
            showPage('lo-monitor-drive-page');
        } else {
            showPage('lo-monitor-page');
            state.foundLoMonitor = true;
        }
    }
    document.getElementById('lo-monitor-drive-hitbox').onclick = async () => {
        useDrive();
    }
    const monitorHatchFeedHitbox = document.getElementById('monitor-hatch-feed-hitbox');
    if (monitorHatchFeedHitbox) {
        monitorHatchFeedHitbox.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await spawnThemedBox("Where is this? Maybe I can escape through that hatch.", "notification-top");
        };
    }

    const monitorHatchFeedClose = document.getElementById('monitor-hatch-feed-close');
    if (monitorHatchFeedClose) {
        monitorHatchFeedClose.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMonitorHatchFeed();
        };
    }


    // ---------- LIBRARY STORAGE SECTION -----------//
    document.getElementById('ls-lo-entrance-hitbox').onclick = () => showPage('lo-main-right-page');
    document.getElementById('ls-archives-sk-hitbox').onclick = () => showPage('ls-archives-sk-2-page');
    document.getElementById('ls-archives-note-hitbox').onclick = () => showPage('ls-archives-note-page');
    document.getElementById('ls-note-hitbox').onclick = async() => {
        await spawnThemedBox('Black -> Harrell -> McDuffie -> Keser. Last 2 digits of publication year', "notification-top");
    }
    document.getElementById('ls-archives-mcduffie-hitbox').onclick = () => showPage('ls-mcduffie-1993-page');
    document.getElementById('ls-mcduffie-1993-hitbox').onclick = async () => {
        await spawnThemedBox("McDuffie, '93", "notification-top");
    }
    document.getElementById('ls-archives-black-hitbox').onclick = () => showPage('ls-black-1997-page');
    document.getElementById('ls-black-1997-hitbox').onclick = async () => {
        await spawnThemedBox("Black, '97", "notification-top");
    }
    document.getElementById('ls-archives-keser-hitbox').onclick = () => showPage('ls-keser-1994-page');
    document.getElementById('ls-keser-1994-hitbox').onclick = async () => {
        await spawnThemedBox("Keser, '94", "notification-top");
    }
    document.getElementById('ls-archives-harrell-hitbox').onclick = () => showPage('ls-harrell-1993-page');
    document.getElementById('ls-harrell-1993-hitbox').onclick = async () => {
        await spawnThemedBox("Harrell, '93", "notification-top");
    }

    document.getElementById('ls-in-10-sk-nd-sk-hitbox').onclick = () => showPage('ls-10-sk-nd-page');
    document.getElementById('ls-in-10-sk-page').onclick = () => showPage('ls-10-sk-page');
    document.getElementById('ls-10-sk-hitbox').onclick = async () => {
        await spawnThemedBox('Is this skeleton moving by itself or is something moving it ?', "notification-top");
    }
    document.getElementById('ls-10-sk-nd-note-hitbox').onclick = () => {
        triggerSound('floppyPaper');
        state.hasLs10note = true;
        const keySlot = document.getElementById('inv-ls-note')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-drive-page');
        openOverlay('ls-10-note', 'inv-images/ls-10-note.png');
    }
    document.getElementById('ls-10-sk-note-hitbox').onclick = () => {
        triggerSound('floppyPaper');
        state.hasLs10note = true;
        const keySlot = document.getElementById('inv-ls-note')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-page');
        openOverlay('ls-10-note', 'inv-images/ls-10-note.png');
    }
    document.getElementById('ls-10-sk-nd-drive-hitbox').onclick = async () => {
        state.hasLs10drive = true;
        const keySlot = document.getElementById('inv-ls-drive')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-note-page');
        openOverlay('ls-10-drive', 'inv-images/ls-10-drive.png');
        await spawnThemedBox("What is this ghost trying to tell me ?", "notification-top")
    }
    document.getElementById('ls-10-sk-drive-hitbox').onclick = async () => {
        state.hasLs10drive = true;
        const keySlot = document.getElementById('inv-ls-drive')
        if (keySlot) {
            keySlot.classList.remove('hidden');
            refreshInventorySlots();
        }
        showPage('ls-10-sk-page');
        openOverlay('ls-10-drive', 'inv-images/ls-10-drive.png');

        if (state.loMonitorUnlocked) {
            await spawnThemedBox("A flash drive ! I wonder if I can use this on the monitor in the office", "notification-top");
        } else {
            await spawnThemedBox("A flash drive...", 'notification-top');
        }
    }
    document.getElementById('ls-sk-note-hitbox').onclick = () => {
        triggerSound('floppyPaper');
        openOverlay('archives-note', 'ls-images/archives-images/archives-paper.png');
    }

    document.getElementById("item-close-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // IMPORTANT

        const overlay = document.getElementById("item-overlay");
        overlay.classList.add("hidden");

        currentOverlayItem = null;
        resetNoteReaderUI();
    });

    // Close when clicking the blurred backdrop (the background, not the image)
    document.querySelector('.overlay-backdrop').addEventListener("click", () => {
        overlay.classList.add("hidden");
        currentOverlayItem = null;
        resetNoteReaderUI();
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
    document.getElementById('tu-ho-rubble-hitbox').onclick = async () => {
        await spawnThemedBox("The stairs are completely blocked.", "notification-top");
    }
    document.getElementById('tu-hatch-hitbox').onclick = async () => {
        await spawnThemedBox("I wonder if I can unlock this hatch somehow", "notification-top");
    }
    document.getElementById('mh-li-right-endc-sd-hitbox').onclick = () => showPage('mh-tu-stairs-door-page');
    document.getElementById('tu-ho-hitbox').onclick = async () => {
        const confirmExit = await showThemedConfirm(
            "These tunnels don't look easy to traverse.",
            "You cannot turn back from here. Are you sure you're done exploring?"
        );

        if (!confirmExit) return;

        showEndVideo();
    };


// ------------ SAVE GAME ON RELOAD -----------//
    const restoreFromSaveOnReload = async () => {
        // Refresh should always land on main menu.
        // Save data is still preserved and can be loaded manually.
        return;

        const navEntry = performance.getEntriesByType('navigation')[0];
        const isReload = navEntry && navEntry.type === 'reload';
        if (!isReload || !hasSaveFile()) return;

        await loadEverything();
        const saveData = loadGame();
        if (!saveData || !saveData.currentPage) return;

        const savedPageEl = document.getElementById(saveData.currentPage);
        if (!savedPageEl || !savedPageEl.classList.contains('fit')) return;

        prepareGameUI();
        startGlobalAudio();

        await showPage(saveData.currentPage);

        if (typeof updateInventoryUI === "function") updateInventoryUI();
        updateMap(saveData.currentPage);
        drawMap();

        if (state.isTutorialActive) {
            runTutorial(true); // resume tutorial, do not reset
        }
    };
    // Intentionally disabled: do not auto-enter gameplay on refresh.
    // restoreFromSaveOnReload();


}

// ---- MAP SYSTEM ----
// Define all rooms with their grid positions and sizes
// Each unit = 10px on canvas. x/y are grid coords, w/h are grid sizes.
const mapRooms = {
    // A-Wing
    mh:   { x: 3,  y: 24, w: 38, h: 3,  label: 'Main Hall',    key: 'mh'   },
    pr:   { x: 18, y: 14,  w: 4,  h: 4, label: 'Projector room',    key: 'pr'   },
    bd:   { x: 18, y: 19, w: 4,  h: 4,  label: 'Book Drop',     key: 'bd'   },
    li:   { x: 23, y: 12, w: 11, h: 11, label: 'Library',       key: 'li'   },
    lo:   { x: 32, y: 6,  w: 5,  h: 5,  label: 'Library Office',    key: 'lo'   },
    ls:   { x: 11,  y: 7,  w: 20, h: 4, label: 'Library Storage',   key: 'ls'   },
    stairs:{ x: 41.5, y: 24, w: 3, h: 3,  label: 'Stairwell',        key: 'stairs'},
    aw_stub: { x: 50, y: 25.5, w: 0.1, h: 0.1, label: '', key: 'aw_stub', hidden: true },
    ki:   { x: 36, y: 28, w: 4,  h: 6,  label: 'Kitchen',       key: 'ki'   },
    bh:   { x: 14, y: 28, w: 4,  h: 22, label: 'Back Hall',     key: 'bh'   },
    sh:   { x: 19, y: 44, w: 7,  h: 3,  label: 'Side Hall',     key: 'sh'   },
    tu:   { x: 28, y: 28, w: 5, h: 5,   label: 'Stairwell',      key: 'tu'  },
    clr:  { x: 28, y: 35, w: 4, h: 4,   label: 'Counseling Room',   key: 'clr'  },
    cr:   { x: 19, y: 35, w: 8, h: 8,  label: 'Creepy Room',   key: 'cr'   },
    camr: { x: 28, y: 40, w: 4,  h: 4,  label: 'Camera Room',   key: 'camr' },
    // C-Wing
    cw: {
        x: 16, y: 11, w: 4, h: 30, label: 'C-Wing', key: 'cw',
        segments: [
            // Main vertical hall
            { x: 16, y: 11, w: 4, h: 30 },

            // Left offshoot: below bathroom, a bit bigger than bathroom
            { x: 11, y: 23, w: 5, h: 4 },

            // Right offshoot: below snack hall, slightly lower than left offshoot
            { x: 20, y: 25, w: 5, h: 4 }
        ]
    },
    cw_left_stub: { x: 6, y: 25, w: 0.1, h: 0.1, label: '', key: 'cw_left_stub', hidden: true },
    wr:   { x: 13, y: 0,  w: 10, h: 10, label: 'Classroom',     key: 'wr'   }, // resized to 10x10
    bath: { x: 11, y: 19, w: 4,  h: 3,  label: 'Bathroom',      key: 'bath' }, // y moved 13->19
    snh:  { x: 21, y: 15, w: 10, h: 4,  label: 'Office Hall',   key: 'snh'  }, // y moved 9->15
    oh1:  { x: 11, y: 32, w: 4,  h: 15, label: 'Office Hall',   key: 'oh1'  }, // y moved 26->32
    oh2:  { x: 21, y: 38, w: 9,  h: 3,  label: 'Office Hall',   key: 'oh2'  }, // y moved 32->38
    oh3:  { x: 21, y: 42, w: 3,  h: 7,  label: 'Office Hall',   key: 'oh3'  }, // y moved 36->42
    print:{ x: 16, y: 42, w: 4,  h: 4,  label: 'Printer Room',  key: 'print'}, // y moved 36->42
    // Apartment (Tutorial)
    apt_ki: { x: 4,  y: 7, w: 6, h: 12, label: 'Kitchen',     key: 'apt_ki' },
    apt_li: { x: 11, y: 5, w: 15, h: 14, label: 'Living Room', key: 'apt_li' }
};

const mapCorridors = [
    // A-Wing
    { rooms: ['pr', 'bd'], dir: 'v', wing: 'a', door1: {x: 20, y: 18}, door2: {x: 20, y: 19} },
    { rooms: ['bd', 'mh'], dir: 'v', wing: 'a', door1: {x: 20, y: 23}, door2: {x: 20, y: 24} },
    { rooms: ['li', 'mh'], dir: 'v', wing: 'a', door1: {x: 25, y: 23}, door2: {x: 25, y: 24} },
    { rooms: ['lo', 'li'], dir: 'v', wing: 'a', door1: {x: 33, y: 11}, door2: {x: 33, y: 12} },
    { rooms: ['lo', 'ls'], dir: 'h', wing: 'a', door1: {x: 31, y: 9.5}, door2: {x: 32, y: 9.5} },
    { rooms: ['stairs','mh'], dir: 'h', wing: 'a', door1: {x: 41.5, y: 25.5}, door2: {x: 41, y: 25.5} },
    { rooms: ['stairs', 'aw_stub'], dir: 'h', wing: 'a', door1: {x: 44.5, y: 25.5}, door2: {x: 46, y: 25.5}, outerW: 14, innerW: 9, fuzzyEnd: true, oneWayFrom: 'stairs' },
    { rooms: ['ki', 'mh'], dir: 'v', wing: 'a', door1: {x: 38, y: 28}, door2: {x: 38, y: 27} },
    { rooms: ['bh', 'mh'], dir: 'v', wing: 'a', door1: {x: 16, y: 28}, door2: {x: 16, y: 27} },
    { rooms: ['bh', 'sh'], dir: 'v', wing: 'a', door1: {x: 19, y: 45.5}, door2: {x: 18, y: 45.5} },
    { rooms: ['sh', 'cr'], dir: 'v', wing: 'a', door1: {x: 23, y: 44}, door2: {x: 23, y: 43} },
    { rooms: ['tu', 'mh'], dir: 'v', wing: 'a', door1: {x: 30.5, y: 28}, door2: {x: 30.5, y: 27} },
    { rooms: ['clr', 'cr'], dir: 'h', wing: 'a', door1: {x: 28, y: 37}, door2: {x: 27, y: 37} },
    { rooms: ['camr', 'cr'], dir: 'h', wing: 'a', door1: {x: 28, y: 42}, door2: {x: 27, y: 42} },

    // C-Wing ...
    { rooms: ['cw', 'wr'], dir: 'v', wing: 'c', door1: {x: 18, y: 11}, door2: {x: 18, y: 10} },
    { rooms: ['cw', 'bath'], dir: 'h', wing: 'c', door1: {x: 16, y: 20.5}, door2: {x: 15, y: 20.5} },
    { rooms: ['cw', 'snh'], dir: 'h', wing: 'c', door1: {x: 20, y: 17}, door2: {x: 21, y: 17} },
    { rooms: ['cw', 'cw_left_stub'], dir: 'h', wing: 'c', door1: {x: 11, y: 25}, door2: {x: 9, y: 25}, outerW: 14, innerW: 9, fuzzyEnd: true, oneWayFrom: 'cw' },
    { rooms: ['cw', 'oh1'], dir: 'h', wing: 'c', door1: {x: 16, y: 39.5}, door2: {x: 15, y: 39.5} },
    { rooms: ['cw', 'oh2'], dir: 'h', wing: 'c', door1: {x: 20, y: 39.5}, door2: {x: 21, y: 39.5} },
    { rooms: ['oh2', 'oh3'], dir: 'v', wing: 'c', door1: {x: 22.5, y: 41}, door2: {x: 22.5, y: 42} },
    { rooms: ['cw', 'print'], dir: 'v', wing: 'c', door1: {x: 18, y: 41}, door2: {x: 18, y: 42} },

    { rooms: ['apt_ki', 'apt_li'], dir: 'h', wing: 'apt', door1: {x: 10, y: 10}, door2: {x: 11, y: 10} }
];

const roomDiscovery = {
    mh:    () => state.discoveredMh || state.discoveredBd,
    bd:    () => state.discoveredBd,
    pr:    () => state.discoveredPr,
    ls:    () => state.discoveredLs,
    li:    () => state.discoveredLi,
    lo:    () => state.discoveredLo,
    stairs:() => state.discoveredStairs,
    aw_stub: () => state.discoveredStairs,
    ki:    () => state.discoveredKi,
    bh:    () => state.discoveredBh,
    sh:    () => state.discoveredSh,
    tu:   () => state.discoveredTu,
    cr:    () => state.discoveredCr,
    clr:   () => state.discoveredClr,
    camr:  () => state.discoveredCamr,
    cw:    () => state.discoveredCw,
    cw_left_stub: () => state.discoveredCw,
    wr:    () => state.discoveredWr,
    bath:  () => state.discoveredBath,
    snh:   () => state.discoveredSnh,
    oh1:   () => state.discoveredOh1,
    oh2:   () => state.discoveredOh2,
    oh3:   () => state.discoveredOh3,
    print: () => state.discoveredPrint,
    apt_ki: () => true, // Always show in tutorial
    apt_li: () => true,
};

function getRoomKeyFromPage(pageId) {
    if (pageId.startsWith('apt-ki')) return 'apt_ki';
    if (pageId.startsWith('apt-li')) return 'apt_li';
    if (pageId.startsWith('ls-'))     return 'ls';
    if (pageId.startsWith('lo-'))     return 'lo';
    if (pageId.startsWith('li-'))     return 'li';
    if (pageId.startsWith('bd-'))     return 'bd';
    if (pageId.startsWith('pr-'))     return 'pr';
    if (pageId.startsWith('mh-'))     return 'mh';
    if (pageId.startsWith('ki-'))     return 'ki';
    if (pageId.startsWith('bh-'))     return 'bh';
    if (pageId.startsWith('sh-'))     return 'sh';
    if (pageId.startsWith('clr-'))    return 'clr';
    if (pageId.startsWith('camr-'))   return 'camr';
    if (pageId.startsWith('cr-'))     return 'cr';
    if (pageId.startsWith('tu-'))     return 'tu';
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
        pageId.startsWith('print-')
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
    const canvas = document.getElementById('map-canvas');
    const CELL = 14;

    let rooms = {};
    let corridors = [];

    // --- LOGIC SWITCH ---
    if (state.isTutorialActive) {
        // Filter for apartment rooms/corridors only
        rooms = {
            apt_ki: mapRooms.apt_ki,
            apt_li: mapRooms.apt_li
        };
        corridors = mapCorridors.filter(c => c.wing === 'apt');
    } else {
        const wing = currentWing === 'c' ? 'c' : 'a';

        const aRooms = {
            mh: mapRooms.mh, pr: mapRooms.pr, bd: mapRooms.bd, li: mapRooms.li,
            lo: mapRooms.lo, ls: mapRooms.ls, stairs: mapRooms.stairs, ki: mapRooms.ki,
            aw_stub: mapRooms.aw_stub, bh: mapRooms.bh, sh: mapRooms.sh, clr: mapRooms.clr, cr: mapRooms.cr,
            camr: mapRooms.camr, tu: mapRooms.tu,
        };

        const cRooms = {
            cw: mapRooms.cw, cw_left_stub: mapRooms.cw_left_stub, wr: mapRooms.wr, bath: mapRooms.bath, snh: mapRooms.snh,
            oh1: mapRooms.oh1, oh2: mapRooms.oh2, oh3: mapRooms.oh3, print: mapRooms.print,
        };

        rooms = wing === 'c' ? cRooms : aRooms;
        corridors = mapCorridors.filter(c => c.wing === wing);
    }

    // Calculate canvas size from room extents
    let maxX = 0, maxY = 0;
    Object.values(rooms).forEach(r => {
        if (r.hidden) return;
        const parts = r.segments || [r];
        parts.forEach(part => {
            maxX = Math.max(maxX, part.x + part.w);
            maxY = Math.max(maxY, part.y + part.h);
        });
    });

    // Set dynamic canvas size with padding
    canvas.width  = (maxX + 2) * CELL;
    canvas.height = (maxY + 2) * CELL;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0500';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- DRAW CORRIDORS ---
    corridors.forEach(c => {
        const r1 = rooms[c.rooms[0]];
        const r2 = rooms[c.rooms[1]];
        if (!r1 || !r2) return;

        const r1Disc = roomDiscovery[c.rooms[0]]?.();
        const r2Disc = roomDiscovery[c.rooms[1]]?.();
        if (!r1Disc && !r2Disc) return;

        const p1 = {
            x: (c.door1 ? c.door1.x : r1.x + r1.w / 2) * CELL,
            y: (c.door1 ? c.door1.y : r1.y + r1.h / 2) * CELL
        };
        const p2 = {
            x: (c.door2 ? c.door2.x : r2.x + r2.w / 2) * CELL,
            y: (c.door2 ? c.door2.y : r2.y + r2.h / 2) * CELL
        };

        const elbow = c.dir === 'v' ? { x: p1.x, y: p2.y } : { x: p2.x, y: p1.y };

        const drawPath = (start, corner, end, isTargetDiscovered, fadeOutAtEnd = false) => {
            const shouldFadeEnd = fadeOutAtEnd || !isTargetDiscovered;
            const target = isTargetDiscovered
                ? end
                : {
                    x: corner.x + (end.x - corner.x) * 0.6,
                    y: corner.y + (end.y - corner.y) * 0.6
                };

            const grad = ctx.createLinearGradient(start.x, start.y, target.x, target.y);
            grad.addColorStop(0, '#c9a84c');
            if (shouldFadeEnd) {
                grad.addColorStop(0.72, '#c9a84c');
                grad.addColorStop(1, 'rgba(201, 168, 76, 0)');
            } else {
                grad.addColorStop(1, '#c9a84c');
            }

            ctx.lineJoin = "miter";
            ctx.lineCap = "butt";

            const outerW = c.outerW ?? (c.emphasis ? 18 : 14);
            const innerW = c.innerW ?? (c.emphasis ? 13 : 10);
            [ {w: outerW, s: grad}, {w: innerW, s: '#0a0500'} ].forEach(style => {
                ctx.beginPath();
                ctx.strokeStyle = style.s;
                ctx.lineWidth = style.w;
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(corner.x, corner.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            });
        };

        if (c.oneWayFrom === c.rooms[0]) {
            if (r1Disc) drawPath(p1, elbow, p2, true, !!c.fuzzyEnd);
        } else if (c.oneWayFrom === c.rooms[1]) {
            if (r2Disc) drawPath(p2, elbow, p1, true, !!c.fuzzyEnd);
        } else {
            if (r1Disc) drawPath(p1, elbow, p2, r2Disc);
            if (r2Disc) drawPath(p2, elbow, p1, r1Disc);
        }
    });

    // --- DRAW ROOMS ---
    Object.values(rooms).forEach(room => {
        if (room.hidden) return;
        if (!roomDiscovery[room.key]?.()) return;

        const isCurrent = room.key === currentMapRoom;
        const parts = room.segments || [room];

        ctx.fillStyle = isCurrent ? 'rgba(180,120,0,0.8)' : 'rgba(100,20,30,0.85)';
        ctx.strokeStyle = isCurrent ? '#c9a84c' : 'rgba(180,140,40,0.6)';
        ctx.lineWidth = isCurrent ? 2 : 1;

        parts.forEach(part => {
            const px = part.x * CELL;
            const py = part.y * CELL;
            const pw = part.w * CELL;
            const ph = part.h * CELL;
            ctx.fillRect(px, py, pw, ph);
            ctx.strokeRect(px, py, pw, ph);
        });

        // Keep label/dot centered on the main rect (room.x/y/w/h)
        const rx = room.x * CELL;
        const ry = room.y * CELL;
        const rw = room.w * CELL;
        const rh = room.h * CELL;

        // Text Wrapping Logic
        const padding = 4;
        const maxWidth = rw - (padding * 2);
        const words = room.label.split(' ');
        let lines = [];
        let currentLine = words[0];

        const fontSize = Math.max(9, Math.min(rw, rh) / 4);
        ctx.font = `${fontSize}px serif`;
        ctx.fillStyle = isCurrent ? '#ffffff' : '#c9a84c';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 1; i < words.length; i++) {
            let testLine = currentLine + " " + words[i];
            if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        const lineHeight = fontSize * 1.1;
        const totalHeight = lines.length * lineHeight;
        let startY = (ry + rh / 2) - (totalHeight / 2) + (lineHeight / 2);

        lines.forEach((line, index) => {
            ctx.fillText(line, rx + rw / 2, startY + (index * lineHeight));
        });

        // Current Location Indicator (Dot)
        if (isCurrent) {
            ctx.beginPath();
            ctx.arc(rx + rw / 2, ry + rh / 2 - (totalHeight / 2) - 5, 4, 0, Math.PI * 2);
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
        saveGame('pr-wr-box-page');
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

function resetWirePuzzle() {
    wirePuzzleInitialized = false;
    wireConnections = {};
    wireDragging = false;
    wireDragStart = null;
    wireDragCurrent = null;
    wireErrorFlash = false;
}

// ---- SAVE SYSTEM ----
const SAVE_KEY = 'escapeTribble_save';

function prepareGameUI() {
    document.body.classList.remove('menu-mode'); // <--- ADD THIS
    menu.classList.add('hidden');
    play.classList.remove('hidden');
    document.getElementById('inventory-drawer').classList.remove('hidden');
    document.getElementById('hamburger-menu').classList.remove('hidden');
    document.getElementById('hint-btn').classList.remove('hidden');
    document.getElementById('hint-box').classList.remove('hidden');
}

function saveGame(currentPageId) {
    // Never save menu/overlay pages
    const nonSavablePages = new Set([
        'menu-screen',
        'disclaimer-page',
        'info-screen',
        'settings-screen',
        'thanks-page',
        'terminal-login-page',
        'map-screen'
    ]);

    if (!currentPageId || nonSavablePages.has(currentPageId)) return;

    const pageEl = document.getElementById(currentPageId);
    // Only save real gameplay pages
    if (!pageEl || !pageEl.classList.contains('fit')) return;

    // 1. Get a list of every item currently visible in the inventory
    const visibleItems = [];
    document.querySelectorAll('.inv-item').forEach(item => {
        if (!item.classList.contains('hidden')) {
            visibleItems.push(item.id);
        }
    });

    // 2. Package everything together
    const saveData = {
        state: { ...state }, // This copies all your booleans/flags
        currentPage: currentPageId,
        inventory: visibleItems
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        //console.log("Game Saved at: " + currentPageId);
    } catch (e) {
        console.error('Save failed:', e);
    }
}

function loadGame() {
    if (!hasSaveFile()) {
        console.log("No save file exists");
        return false;
    }

    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;

        const saveData = JSON.parse(raw);

        // 1. FIXED: Do NOT reassign 'state'.
        // Instead, clear the current state and pour the new data into it.
        // This keeps the reference alive for the rest of your app.
        Object.keys(state).forEach(key => delete state[key]);
        Object.assign(state, getInitialState(), saveData.state);

        // 2. Sync the Tutorial Flag based on the page ID
        // This is the "Master Switch" that keeps you in the apartment
        state.isTutorialActive = saveData.currentPage && saveData.currentPage.startsWith('apt-');

        // 3. Restore Inventory Data
        state.inventory = Array.isArray(saveData.inventory)
            ? [...saveData.inventory]
            : [];

        // Tutorial key reconciliation:
        // Only force-restore the apartment key while the tutorial is still
        // in a pre-unlock phase. This avoids re-adding it after unlock.
        const preApartmentUnlockTutorialSteps = new Set([
            'init',
            'inv-open-key',
            'inv-overlay-key',
            'inv-close-key',
            'hint-view',
            'hint-close',
            'menu-open',
            'menu-close',
            'map-open',
            'map-close',
            'view-handle',
            'use-key'
        ]);

        if (
            state.isTutorialActive &&
            !state.aptUnlocked &&
            preApartmentUnlockTutorialSteps.has(state.currTutorialStep)
        ) {
            state.hasAptKey = true;
            if (!state.inventory.includes('inv-apt-key')) {
                state.inventory.push('inv-apt-key');
            }
        } else if (state.isTutorialActive) {
            // Past pre-unlock tutorial phases: ensure the apartment key
            // does not come back after reload.
            state.hasAptKey = false;
            state.inventory = state.inventory.filter(id => id !== 'inv-apt-key');
        }

        // 4. UI Sync: Update the visual inventory tray
        if (typeof updateInventoryUI === "function") {
            updateInventoryUI();
        } else {
            // Fallback: manually show items if the function isn't globally available
            document.querySelectorAll('.inv-item').forEach(item => {
                if (state.inventory && state.inventory.includes(item.id)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }

        // 5. Handle Puzzle UI Cleanups
        if (state.solvedWirePuzzle) {
            const popup = document.getElementById('wire-solved-popup');
            if (popup) popup.classList.add('hidden');
        }

        console.log("Game Loaded Successfully. Last page:", saveData.currentPage);

        // Return the whole object so the Load Button knows the currentPage
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
    // 1. Remove from localStorage
    localStorage.removeItem(SAVE_KEY);

    resetTerminalUI();
    resetLeftMonitorUI();
    resetWirePuzzle()
    // 2. Reset the 'state' object variables
    Object.assign(state, getInitialState());

    // 3. UI RESET: Close all drawers and boxes

    // --- HINT BOX ---
    // Matches your toggle('hint-open')
    const hintBox = document.getElementById('hint-box');
    if (hintBox) {
        hintBox.classList.remove('hint-open');
    }

    // --- INVENTORY PANEL ---
    // Matches your inventoryTab.onclick targeting 'inventory-panel'
    const invPanel = document.getElementById('inventory-panel');
    if (invPanel) {
        invPanel.classList.remove('inventory-open');
    }

    // --- MENU ---
    // Make sure the main menu overlay hides so you can see the apartment
    const menuOverlay = document.getElementById('main-menu-overlay');
    if (menuOverlay) {
        menuOverlay.classList.add('hidden');
    }

    // 4. Hide all real inventory items
    const items = document.querySelectorAll('.inv-item:not(.empty)');
    items.forEach(item => item.classList.add('hidden'));

    // 5. Reset the empty slots to show a full 6 boxes
    refreshInventorySlots();
    localStorage.removeItem(SAVE_KEY);

    console.log("Game reset: Inventory, Hints, and Menu forced shut.");
}

function getInitialState() {
    return {
        // Keys & Items
        hasBdKey: false,
        hasPrKey: false,
        hasKiKey: false,
        hasLiKey: false,
        hasPwBook: false,
        hasCamrKey: false,
        hasClrKey: false,
        hasWrId: false,
        hasWr: false, // white remote
        hasBr: false,
        hasAptKey: false,
        hasWb: false,
        hasLoKey: false,
        hasLrBook: false,
        hasSkPaper: false,
        hasLs10note: false,
        hasLs10drive: false,
        hasLorBook: false,
        hasSherlockBook: false,

        // Unlocks
        bdUnlocked: false,
        bdBackDoorUnlocked: false,
        kiUnlocked: false,
        liUnlocked: false,
        crUnlocked: false,
        camrUnlocked: false,
        wrUnlocked: false,
        loUnlocked: false,
        aptUnlocked: false,

        // Doors
        camrDoorOpen: false,
        crlDoorOpen: false,
        crDoorOpen: false,

        // Discovery Flags
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
        discoveredTu: false,
        discoveredWr: false,
        discoveredBath: false,
        discoveredSnh: false,
        discoveredOh1: false,
        discoveredOh2: false,
        discoveredOh3: false,
        discoveredPrint: false,
        discoveredApt: false,

        // Puzzles & Clues
        solvedWirePuzzle: false,
        foundPtCode: false,
        foundWrNote: false,
        foundOctagon: false,
        foundScanner: false,
        foundLiClue: false,
        foundLoMonitor: false,
        foundArchives: false,
        foundWrPapers: false,
        foundWp: false,

        // Object States
        isProjectorOn: false,
        isLeftMonitorOn: false,
        isRightMonitorOn: false,
        isLiLaptopOn: false,
        isLiTvOn: false,
        isLiReadOn: false,
        isPrinterCalibrated: false,

        // Codes & Logic
        wonWordle: false,
        foundWordle: false,
        foundml: false,
        savedKey: "", // password for left monitor
        enteredCode: "",
        correctCode: "3672",
        cameraAccessed: false,

        // Library / Misc
        movedAnimals: false,
        scannedBook: false,
        loMonitorUnlocked: false,
        usedDrive: false,
        hatchOpen: false,

        // Tracking
        visitedPages: {},
        notificationsSeen: {},

        // Tutorial & Flow
        currTutorialStep: "init",
        isTutorialActive: false,
        isWbOpen: false,
        canPickUpBottle: false,
        currentPage: "",
        prevPage: "",
        filledBottle: false,

        gameCompleted: false,
    };
}

init();