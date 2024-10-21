let bricksBuilt = 0;
let bricksRemoved = 0;
let addClickCount = 0;
let removeClickCount = 0;
const maxBricksPerLine = Math.floor(document.querySelector('.brick-area').clientWidth / 64);
const initialBricks = 100;

async function fetchGameState() {
    const response = await fetch('/api/gameState');
    return response.json();
}

async function updateGameState() {
    await fetch('/api/updateGameState', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bricksBuilt,
            bricksRemoved,
            addClickCount,
            removeClickCount,
        }),
    });
}

function setupRealtimeListener() {
    setInterval(async () => {
        const gameState = await fetchGameState();
        if (gameState && gameState.bricksBuilt !== undefined) {
            const oldTotal = bricksBuilt - bricksRemoved;
            bricksBuilt = gameState.bricksBuilt;
            bricksRemoved = gameState.bricksRemoved;
            addClickCount = gameState.addClickCount;
            removeClickCount = gameState.removeClickCount;
            const newTotal = bricksBuilt - bricksRemoved;
            
            if (newTotal !== oldTotal) {
                renderBricks(newTotal);
                updateCounters();
            }
        }
    }, 1000);
}

async function initializeGame() {
    const gameState = await fetchGameState();
    if (!gameState || gameState.bricksBuilt === undefined) {
        bricksBuilt = initialBricks;
        bricksRemoved = 0;
        addClickCount = 0;
        removeClickCount = 0;
        await updateGameState();
    } else {
        bricksBuilt = gameState.bricksBuilt;
        bricksRemoved = gameState.bricksRemoved;
        addClickCount = gameState.addClickCount;
        removeClickCount = gameState.removeClickCount;
    }
    renderBricks(bricksBuilt - bricksRemoved);
    updateCounters();
    setupRealtimeListener();
}

document.getElementById('republicans').addEventListener('click', async function() {
    addClickCount++;
    if (addClickCount % 10 === 0) {
        bricksBuilt++;
        renderBricks(bricksBuilt - bricksRemoved);
    }
    await updateGameState();
    updateCounters();
    animateButton(this);
});

document.getElementById('democrats').addEventListener('click', async function() {
    removeClickCount++;
    if (removeClickCount % 10 === 0 && bricksBuilt > bricksRemoved) {
        bricksRemoved++;
        renderBricks(bricksBuilt - bricksRemoved);
    }
    await updateGameState();
    updateCounters();
    animateButton(this);
});

function renderBricks(totalBricks) {
    const area = document.querySelector('.brick-area');
    const currentBricks = area.querySelectorAll('.brick').length;
    
    if (totalBricks > currentBricks) {
        // Add bricks
        for (let i = currentBricks; i < totalBricks; i++) {
            addBrick(false, true);
        }
    } else if (totalBricks < currentBricks) {
        // Remove bricks
        for (let i = currentBricks; i > totalBricks; i--) {
            removeBrick(false, true);
        }
    }
}

function addBrick(countTowardsTotal = false, animate = true) {
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
    if (animate) {
        brick.classList.add('show');
    } else {
        brick.style.opacity = '1';
        brick.style.transform = 'scale(1)';
    }
    currentLine.appendChild(brick);

    if (countTowardsTotal) {
        bricksBuilt++;
    }
}

function removeBrick(countTowardsTotal = false, animate = true) {
    const area = document.querySelector('.brick-area');
    let lastLine = area.lastElementChild;

    if (lastLine) {
        const lastBrick = lastLine.lastElementChild;
        if (lastBrick) {
            if (animate) {
                lastBrick.classList.add('remove');
                lastBrick.addEventListener('transitionend', function() {
                    lastLine.removeChild(lastBrick);
                    if (lastLine.childElementCount === 0) {
                        area.removeChild(lastLine);
                    }
                }, { once: true });
            } else {
                lastLine.removeChild(lastBrick);
                if (lastLine.childElementCount === 0) {
                    area.removeChild(lastLine);
                }
            }

            if (countTowardsTotal) {
                bricksRemoved++;
            }
        }
    }
}

function updateCounters() {
    document.getElementById('bricks-built').textContent = `Bricks Built: ${bricksBuilt} | Bricks Removed: ${bricksRemoved} | Add Clicks: ${addClickCount} | Remove Clicks: ${removeClickCount}`;
    if (typeof sendScore === 'function') {
        sendScore(bricksBuilt - bricksRemoved);
    }
}

function animateButton(button) {
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 100);
}

async function automaticBrickAction() {
    if (Math.random() < 0.5) {
        bricksBuilt++;
    } else if (bricksBuilt > bricksRemoved) {
        bricksRemoved++;
    }
    renderBricks(bricksBuilt - bricksRemoved);
    await updateGameState();
}

setInterval(automaticBrickAction, 10000);

initializeGame();

document.getElementById('click-info').textContent = 'A brick is added or removed every 10 clicks of the respective button. Every 10 seconds, a brick is automatically added or removed.';