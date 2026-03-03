let score = 0;

//Objects for the Front Page Menu
const menu = document.getElementById('menu-screen');
const startButton = document.getElementById('start-button');

//Objects for the tutorial
const tutorial = document.getElementById('tutorial');
const firstDoor = document.getElementById('first-door');
//const bookDropDoorZoomOut = document.getElementById('bookDropDoorZoomOut');

//function to start the tutorial: runs when the player clicks the start game button
function playTutorial() {
    console.log("Start button was clicked!");

    //FIXME add text boxes for tutorial

    //hid menu, show tutorial first page
    menu.classList.add('hidden');
    showBookDropDoorZoomOut();
}

function showBookDropDoorZoomOut() {
    tutorial.classList.remove('hidden');
    firstDoor.classList.remove('hidden');
}

// Click accessibility
startButton.addEventListener('click', playTutorial);

