class Particle {
    constructor() {
        this.reset(true);
    }
    
    reset(isInitial = false) {
        // For initial creation, distribute stars throughout the screen
        // For ongoing resets, only create them at the top
        if (isInitial) {
            this.y = BORDER_MARGIN + Math.random() * GAME_HEIGHT;
        } else {
            this.y = BORDER_MARGIN;
        }
        
        // Randomize x position
        this.x = BORDER_MARGIN + Math.random() * GAME_WIDTH;
        
        // Depth gives illusion of 3D (0 = far, 1 = close)
        this.depth = Math.random();
        
        // Speed based on depth - closer stars move faster
        this.speed = 0.5 + this.depth * 2.5;
        
        // Brightness based on depth - closer stars are brighter
        const brightness = 0.2 + this.depth * 0.8;
        this.fill = `rgba(255,255,255,${brightness})`;
        
        // Size based on depth - closer stars are bigger
        this.size = 0.3 + this.depth * 0.7;
    }

    update() {
        // Move star down the screen
        this.y += this.speed;
        
        // If star goes off screen, reset it at the top
        if (this.y > GAME_HEIGHT + BORDER_MARGIN) {
            this.reset();
        }
    }

    render() {
        // Skip if out of bounds
        if (this.x < BORDER_MARGIN || 
            this.x > GAME_WIDTH + BORDER_MARGIN ||
            this.y < BORDER_MARGIN || 
            this.y > GAME_HEIGHT + BORDER_MARGIN) {
            return;
        }

        this.update();
        
        // Draw the star as a simple circle
        CTX.beginPath();
        CTX.fillStyle = this.fill;
        CTX.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        CTX.fill();
    }
}

function render() {
    for (let i = 0; i < PARTICLES.length; i++) {
        PARTICLES[i].render();
    }
}

// Create more particles for a denser star field
function createParticles() {
    PARTICLES.length = 0; // Clear any existing particles
    // Create a lot more particles for a denser star field
    const particleCount = Math.floor((WINDOW_WIDTH * WINDOW_HEIGHT) / 2000);
    for (let i = 0; i < particleCount; i++) {
        PARTICLES.push(new Particle());
    }
}