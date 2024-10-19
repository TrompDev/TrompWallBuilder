let bricksBuilt = 0;
let bricksRemoved = 0;
let addClickCount = 0;
let removeClickCount = 0;
const maxBricksPerLine = Math.floor(document.querySelector('.brick-area').clientWidth / 64); // Now exactly 64px width

document.getElementById('republicans').addEventListener('click', function() {
    addClickCount++;
    if (addClickCount % 10 === 0) {
        addBrick();
    }
    updateCounters();
    animateButton(this);
});

document.getElementById('democrats').addEventListener('click', function() {
    removeClickCount++;
    if (removeClickCount % 10 === 0) {
        removeBrick();
    }
    updateCounters();
    animateButton(this);
});

function addBrick() {
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

    // Trigger reflow
    brick.offsetWidth;

    // Add the 'show' class to trigger the animation
    brick.classList.add('show');

    bricksBuilt++;
    updateCounters();
}

function removeBrick() {
    const area = document.querySelector('.brick-area');
    let lastLine = area.lastElementChild;

    if (lastLine) {
        const lastBrick = lastLine.lastElementChild;
        if (lastBrick) {
            // Add the 'remove' class to trigger the removal animation
            lastBrick.classList.add('remove');

            // Wait for the animation to complete before removing the brick
            lastBrick.addEventListener('transitionend', function() {
                lastLine.removeChild(lastBrick);
                bricksRemoved++;

                if (lastLine.childElementCount === 0) {
                    area.removeChild(lastLine);
                }

                updateCounters();
            }, { once: true });
        }
    }
}

function updateCounters() {
    document.getElementById('bricks-built').textContent = `Bricks Built: ${bricksBuilt} | Bricks Removed: ${bricksRemoved} | Add Clicks: ${addClickCount} | Remove Clicks: ${removeClickCount}`;
}

function animateButton(button) {
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 100);
}

function automaticBrickAction() {
    if (Math.random() < 0.5) {
        addBrick();
    } else {
        removeBrick();
    }
}

// Start the automatic brick addition/removal process
setInterval(automaticBrickAction, 10000);

// Initialize counters and info text
updateCounters();
document.getElementById('click-info').textContent = 'A brick is added or removed every 10 clicks of the respective button. Every 10 seconds, a brick is automatically added or removed.';