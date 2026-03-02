let score = 0;
const scoreDisplay = document.getElementById('score');
const square = document.getElementById('game-square');

function updateScore() {
    score++;
    scoreDisplay.innerText = score;
    // Change color randomly to show it's working
    square.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
}

// Click accessibility
square.addEventListener('click', updateScore);

// Keyboard accessibility (Spacebar)
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        updateScore();
    }
});