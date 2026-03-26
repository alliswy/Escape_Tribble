let score = 0;
// ------ 1. GAME STATE -----
const state = {
    hasBdKey: false,
    hasFbKey: false,
    hasPrKey: false,
    hasPwBook: false,
    bdUnlocked: false,
    bdBackDoorUnlocked: false,
    discoveredBd: false,
    discoveredPr: false
}

// ----- 2. SELECTORS -----
const menu = document.getElementById('menu-screen');
const startButton = document.getElementById('start-button');
const tutorial = document.getElementById('tutorial');
const backArrow = document.getElementById('master-back-arrow');
const forwardArrow = document.getElementById('master-forward-arrow');
const rightArrow = document.getElementById('master-right-arrow');
const leftArrow = document.getElementById('master-left-arrow');
const allPages = document.querySelectorAll('.fit');
const inventoryTab = document.getElementById('inventory-tab');

// ----- 3. CORE FUNCTIONS ----

function showPage(pageId) {
    allPages.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
    }

    //fixme add switch for which pages will have which arrows
    if (pageId === 'bd-main-page') {
        backArrow.classList.remove('hidden');
        forwardArrow.classList.remove('hidden');
        rightArrow.classList.remove('hidden');
        leftArrow.classList.remove('hidden');
    }
    updateMap(pageId);
}

// ---- 4. NAVIGATION LOGIC -----
function goBack() {
    const current = Array.from(allPages).find(p => !p.classList.contains('hidden'));
    if (!current) return;

    switch (current.id) {
        case 'bd-door-page':
        case 'bd-door-open-page':   showPage('bd-main-page'); break;

        case 'bd-slot-closed-page':
        case 'bd-door-handle-page': showPage('bd-door-page'); break;

        case 'bd-slot-open-key-page':
        case 'bd-slot-open-page':   showPage('bd-slot-closed-page'); break;

        case 'bd-cart-page':
        case 'bd-back-door-handle-page':    showPage('bd-door-open-page'); break;

        case 'bd-books-page':       showPage('bd-cart-page'); break;

        case 'bd-fb-open-key-page':
        case 'bd-fb-open-page':     showPage('bd-books-page'); break;

        case 'pr-steps-page': showPage('bd-back-door-open-page'); break;

        case'pr-main-page': showPage('pr-steps-page'); break;

        case 'pr-wr-main-page':
        case 'pr-pw-main-book-page':
        case 'pr-pw-main-noBook-page': showPage('pr-main-page'); break;

        case 'pr-pw-hole-book-page': showPage('pr-pw-main-book-page'); break;
        case 'pr-pw-hole-noBook-page': showPage('pr-pw-main-noBook-page'); break;

        case 'pr-wr-wires-page': showPage('pr-wr-main-page'); break;
        case 'pr-wr-box-page': showPage('pr-wr-wires-page'); break;

        //main hall right backward progression
        case 'mh-cend-right-endc-kc-page': showPage('mh-li-right-endc-page'); break;
        case 'mh-li-right-endc-page':   showPage('mh-bd-right-endc-page'); break;
        case 'mh-bd-right-endc-page':   showPage('mh-trash-right-endc-page'); break;
        case 'mh-trash-right-endc-page':   showPage('mh-bh-right-endc-page'); break;
        case 'mh-bh-right-endc-page':   showPage('mh-hall-right-endc-page'); break;
        case 'mh-hall-right-endc-page':   showPage('mh-sl-right-endc-page'); break;

        //main hall left backward progression
        case 'mh-sl-left-endc-page':   showPage('mh-hall-left-endc-page'); break;
        case 'mh-hall-left-endc-page':   showPage('mh-bh-left-endc-page'); break;
        case 'mh-bh-left-endc-page':   showPage('mh-bd-left-endc-page'); break;
        case 'mh-bd-left-endc-page':   showPage('mh-li-left-endc-page'); break;
        case 'mh-li-left-endc-page':   showPage('mh-cend-left-endc-page'); break;
    }
}

//fixme finish logic
function goForward() {
    const current = Array.from(allPages).find(p => !p.classList.contains('hidden'));
    if (!current) return;

    switch (current.id) {
        //main hall right progression
        case 'mh-sl-right-endc-page':   showPage('mh-hall-right-endc-page'); break;
        case 'mh-hall-right-endc-page':   showPage('mh-bh-right-endc-page'); break;
        case 'mh-bh-right-endc-page':   showPage('mh-trash-right-endc-page'); break;
        case 'mh-trash-right-endc-page':   showPage('mh-bd-right-endc-page'); break;
        case 'mh-bd-right-endc-page':   showPage('mh-li-right-endc-page'); break;
        case 'mh-li-right-endc-page':   showPage('mh-cend-right-endc-kc-page'); break;

        //main hall left progression
        case 'mh-cend-left-endc-page':   showPage('mh-li-left-endc-page'); break;
        case 'mh-li-left-endc-page':   showPage('mh-bd-left-endc-page'); break;
        case 'mh-bd-left-endc-page':   showPage('mh-bh-left-endc-page'); break;
        case 'mh-bh-left-endc-page':   showPage('mh-hall-left-endc-page'); break;
        case 'mh-hall-left-endc-page':   showPage('mh-sl-left-endc-page'); break;
    }
}

//fixme finish logic
function goRight() {
    const current = Array.from(allPages).find(p => !p.classList.contains('hidden'));
    if (!current) return;

    switch (current.id) {
        case 'bd-main-page': showPage('mh-bd-right-endc-page'); break;
    }
}

//fixme finish logic
function goLeft() {
    const current = Array.from(allPages).find(p => !p.classList.contains('hidden'));
    if (!current) return;

    switch (current.id) {
        case 'bd-main-page': showPage('mh-bd-left-endc-page'); break;
    }
}

// ----- INVENTORY MENU ----- //
inventoryTab.onclick = () => {
    const panel = document.getElementById('inventory-panel');
    panel.classList.toggle('inventory-open');
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
        tutorial.classList.add('hidden');
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

    //entering room behind book drop
    document.getElementById('bd-back-door-open-hitbox').onclick = () => showPage('bd-door-open-page')
    document.getElementById('bd-back-door-enter-hitbox').onclick = () => showPage('pr-steps-page');
    document.getElementById('pr-steps-enter-hitbox').onclick = () => showPage('pr-main-page');

    //projector wall image depends on whether the user has the pw book or not
    document.getElementById('pr-pw-hitbox').onclick = () => {
        if (state.hasPwBook) {
            showPage ('pr-pw-main-noBook-page');
        } else {
            showPage('pr-pw-main-book-page');
        }
    }

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