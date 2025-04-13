// Bee-related variables and constants
const bees = [];    // Array to hold active bees
let beehiveReady = true; // Is the defense ready to use?
let lastBeehiveTime = 0; // Timestamp of last use
const BEEHIVE_COOLDOWN = 15000; // 15 seconds cooldown
let beehiveIconElement = null; // Reference to the icon DOM element

// ****** Bee Class (For the Beehive Defense) *********
class Bee {
    constructor(startX, startY) {
        this.size = 18; // Matches CSS font-size
        this.x = startX;
        this.y = startY;
        this.speed = 4 + Math.random() * 2; // Vertical speed
        this.drift = (Math.random() - 0.5) * 1; // Slight horizontal drift (-0.5 to +0.5)
        this.element = null;
    }

    create() {
        const beeElement = document.createElement('div');
        beeElement.className = 'bee';
        beeElement.innerHTML = '&#x1F41D;'; // Honeybee emoji
        beeElement.style.left = `${this.x - this.size / 2}px`; // Center horizontally
        beeElement.style.top = `${this.y - this.size / 2}px`; // Center vertically
        beeElement.style.fontSize = `${this.size}px`; // Ensure size matches
        // Other styles like position: absolute are handled by CSS

        document.body.appendChild(beeElement);
        this.element = beeElement;
    }

    move() {
        // Assumes gameAreaTop is globally accessible or passed in
        this.y -= this.speed; // Move upwards
        this.x += this.drift; // Apply horizontal drift

        if (this.element) {
            this.element.style.top = `${this.y}px`;
            this.element.style.left = `${this.x}px`;
        }

        // Check if off-screen top
        if (this.y + this.size < gameAreaTop) { // Requires gameAreaTop
            this.destroy();
            const index = bees.indexOf(this);
            if (index > -1) {
                bees.splice(index, 1);
            }
        }
    }

    // Basic collision check against a ball's center
    checkCollision(ball) {
        // Requires ball.x, ball.y, ball.size
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Check if distance is less than sum of radii (approximate)
        return distance < (this.size / 2 + ball.size / 2);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    }
}

// Function to launch the bee swarm from the icon
function launchBeeSwarm() {
    const now = Date.now();
    if (!beehiveReady || now < lastBeehiveTime + BEEHIVE_COOLDOWN) {
        console.log("Beehive on cooldown.");
        // Optionally provide visual feedback like a shake
        return;
    }

    beehiveReady = false;
    lastBeehiveTime = now;

    // Update icon visual state
    if (beehiveIconElement) {
        beehiveIconElement.classList.add('cooldown');
        // Change icon during cooldown?
        // beehiveIconElement.innerHTML = '⏳'; // Hourglass maybe?
    }

    // Start cooldown timer to reset readiness
    setTimeout(() => {
        beehiveReady = true;
        if (beehiveIconElement) {
            beehiveIconElement.classList.remove('cooldown');
            // Restore icon
            beehiveIconElement.innerHTML = '&#x1F6F0;'; // Beehive (or fallback)
        }
        console.log("Beehive ready!");
    }, BEEHIVE_COOLDOWN);

    // Create the swarm
    const swarmSize = 8; // Number of bees
    if (!beehiveIconElement) {
        console.error("Cannot launch bees: Beehive icon element not cached.");
        return; // Can't proceed without the icon element
    }
    const iconRect = beehiveIconElement.getBoundingClientRect();
    const startX = iconRect.left + iconRect.width / 2;
    const startY = iconRect.top + iconRect.height / 2;

    for (let i = 0; i < swarmSize; i++) {
        // Add slight randomness to start position to avoid perfect stack
        const beeStartX = startX + (Math.random() - 0.5) * 10;
        const beeStartY = startY + (Math.random() - 0.5) * 10;
        const bee = new Bee(beeStartX, beeStartY);
        bee.create();
        bees.push(bee);
    }

    // TODO: Play bee launch sound
    // BEE_LAUNCH_SOUND.currentTime = 0;
    // BEE_LAUNCH_SOUND.play();

    console.log(`Launched ${swarmSize} bees.`);
}

// Function to move all active bees and check collisions
function moveBees() {
    // Assumes isGamePaused is globally accessible or passed in
    if (isGamePaused) return;

    // Iterate backwards for safe removal
    for (let i = bees.length - 1; i >= 0; i--) {
        const bee = bees[i];
        if (!bee) continue; // Should not happen, but safety check

        bee.move(); // Move bee first

        // Check collision with balls (iterate backwards on balls too)
        // Assumes `balls` array is globally accessible or passed in
        let hitBall = false;
        for (let j = balls.length - 1; j >= 0; j--) {
            const ball = balls[j];
            // Assumes ball has isImmune() method and hit() method
            if (!ball || (ball.isImmune && ball.isImmune())) continue; // Skip immune balls

            if (bee.checkCollision(ball)) {
                // Collision!
                if (ball.hit) ball.hit(0); // Trigger ball hit effect (0 damage)
                balls.splice(j, 1); // Remove ball

                bee.destroy();    // Destroy bee
                bees.splice(i, 1); // Remove bee
                hitBall = true;

                // TODO: Play bee/ball pop sound?

                break; // Bee can only hit one ball, exit inner loop
            }
        }
        // If bee was destroyed by collision, the outer loop continues correctly
    }
}

// --- Initialization Code (needs to run after DOM is ready) ---
function initializeBeehiveIcon() {
    const iconElement = document.getElementById('beehiveDefenseIcon');
    if (iconElement) {
        iconElement.innerHTML = '&#x1F41D;'; // Bee emoji
        iconElement.addEventListener('click', launchBeeSwarm);
        beehiveIconElement = iconElement; // Assign to global cache variable
    } else {
        console.error("Beehive icon element not found!");
    }
}

// --- Interval Management (needs integration into game loop logic) ---
// Example:
// Add `moveBees: setInterval(moveBees, 25)` to gameIntervals object in initializeGame/unpauseGame
// Add `clearInterval(gameIntervals.moveBees)` in pauseGame
// Add clearing of `bees` array in `restartGame` and `endGame`

// NOTE: This file assumes that global variables like `gameAreaTop`, `isGamePaused`,
// and the `balls` array are accessible. You would need to properly scope or pass
// these variables if integrating this as a module. 