let score = 0;

//Objects for the Front Page Menu
const menu = document.getElementById('menu-screen');
const startButton = document.getElementById('start-button');

//Objects for the tutorial
const tutorial = document.getElementById('tutorial');
const bookDropDoorZoomOut = document.getElementById('bookDropDoorZoomOutPage');
const bookDropDoorZoomIn = document.getElementById('bookDropDoorZoomInPage')
const doorHitbox = document.getElementById('door-hitbox');

//function to start the tutorial: runs when the player clicks the start game button
function playTutorial() {
    console.log("Start button was clicked!");

    //FIXME add text boxes for tutorial

    //hid menu, show tutorial first page
    menu.classList.add('hidden');
    tutorial.classList.remove('hidden');
    bookDropDoorZoomOut.classList.remove('hidden');




}

function goToBookDropDoorZoomIn() {
    console.log("Swapping to the close-up photo");

    //hide book drop zoomed out image
    bookDropDoorZoomOut.classList.add('hidden');

    //show book drop zoomed in image
    bookDropDoorZoomIn.classList.remove('hidden');
}

// Click functionality for menu
startButton.addEventListener('click', playTutorial);

//Clicking on objects
doorHitbox.addEventListener('click', goToBookDropDoorZoomIn)