let score = 0;

//Objects for the Front Page Menu
const menu = document.getElementById('menu-screen');
const startButton = document.getElementById('start-button');

//Objects for the tutorial
const tutorial = document.getElementById('tutorial');
const bookDropDoorZoomOut = document.getElementById('bookDropDoorZoomOutPage');
const bookDropDoorZoomIn = document.getElementById('bookDropDoorZoomInPage')
const bookDropDoorHitbox = document.getElementById('bookDropDoor-hitbox');
const bookDrop = document.getElementById('bookDropClosedPage');
const bookDropHitbox = document.getElementById('bookDrop-hitbox');
const bookDropDoorHandleHitbox = document.getElementById("bookDropDoorHandle-hitbox");
const bookDropDoorHandle = document.getElementById("bookDropDoorHandle");

//function to start the tutorial: runs when the player clicks the start game button
function playTutorial() {
    console.log("Start button was clicked!");

    //FIXME add text boxes for tutorial

    //hid menu, show tutorial first page
    menu.classList.add('hidden');
    tutorial.classList.remove('hidden');
    bookDropDoorZoomOut.classList.remove('hidden');

    //if they click on the door, it zooms in on it
    bookDropDoorHitbox.addEventListener('click', goToBookDropDoorZoomIn);

    function goToBookDropDoorZoomIn() {
        console.log("Swapping to the close-up photo");

        //hide book drop zoomed out image
        bookDropDoorZoomOut.classList.add('hidden');

        //show book drop zoomed in image
        bookDropDoorZoomIn.classList.remove('hidden');

        bookDropHitbox.addEventListener('click', goToBookDrop);

        function goToBookDrop() {
            bookDropDoorZoomIn.classList.add('hidden');
            bookDrop.classList.remove('hidden');
        }

        function goToBookDropDoorHandle() {
            bookDropDoorZoomIn.classList.add('hidden');


        }

    }





}



// Click functionality for menu
startButton.addEventListener('click', playTutorial);

//Clicking on objects
