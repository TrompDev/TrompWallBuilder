let bricksBuilt = 0;
let bricksRemoved = 0;
let addClickCount = 0;
let removeClickCount = 0;
const maxBricksPerLine = Math.floor(document.querySelector('.brick-area').clientWidth / 64);
const initialBricks = 100;

document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    document.getElementById('republicans').addEventListener('click', handleRepublicanClick);
    document.getElementById('democrats').addEventListener('click', handleDemocratClick);
});

function initializeGame() {
    const area = document.querySelector('.brick-area');
    for (let i = 0; i < initialBricks; i++) {
        addBrick(false);
    }
    scrollToBottom(area);
    updateCounters();
}

function handleRepublicanClick() {
    addClickCount++;
    if (addClickCount % 10 === 0) {
        addBrick(true);
    }
    updateCounters();
    animateButton(this);
}

function handleDemocratClick() {
    removeClickCount++;
    if (removeClickCount % 10 === 0) {
        removeBrick(true);
    }
    updateCounters();
    animateButton(this);
}

function addBrick(countTowardsTotal = true) {
    const area = document.querySelector('.brick-area');
    let currentLine = area.lastElementChild;

    if (!currentLine || currentLine.childElementCount >= maxBricksPerLine) {
        const newLine = document.createElement('div');
        newLine.classList.add('line');
        area.appendChild(newLine);
        currentLine = newLine;
    }

    const brick = document.createElement('div');
    brick.classList.add('brick');
    currentLine.appendChild(brick);

    brick.offsetWidth; // Trigger reflow
    brick.classList.add('show');

    if (countTowardsTotal) {
        bricksBuilt++;
        updateCounters();
    }
    
    scrollToBottom(area);
}

function removeBrick(countTowardsTotal = true) {
    const area = document.querySelector('.brick-area');
    let lastLine = area.lastElementChild;

    if (lastLine) {
        const lastBrick = lastLine.lastElementChild;
        if (lastBrick) {
            lastBrick.classList.add('remove');
            lastBrick.addEventListener('transitionend', function() {
                lastLine.removeChild(lastBrick);
                if (countTowardsTotal) {
                    bricksRemoved++;
                    updateCounters();
                }
                if (lastLine.childElementCount === 0) {
                    area.removeChild(lastLine);
                }
            }, { once: true });
        }
    }
    
    scrollToBottom(area);
}

function updateCounters() {
    document.getElementById('bricks-built').textContent = `Bricks Built: ${bricksBuilt} | Bricks Removed: ${bricksRemoved} | Add Clicks: ${addClickCount} | Remove Clicks: ${removeClickCount}`;
}

function animateButton(button) {
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 100);
}

function automaticBrickAction() {
    if (Math.random() < 0.5) {
        addBrick(true);
    } else {
        removeBrick(true);
    }
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

setInterval(automaticBrickAction, 10000);

document.getElementById('click-info').textContent = 'A brick is added or removed every 10 clicks of the respective button. Every 10 seconds, a brick is automatically added or removed.';