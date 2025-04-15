// ****** Bonus Class (For adding bonus boxes to the screen that the player can hit to collect points*********)
class Bonus {
  constructor(startYPosition) {
    // Renamed parameter for clarity
    this.size = BALL_SIZE * 0.7
    this.value = 5 * (Math.floor(Math.random() * 6) + 1)
    // Use min dimension for speed scaling
    const baseSpeed = 8 * (Math.min(GAME_WIDTH, GAME_HEIGHT) / 1500)
    const levelMultiplier = 1 + (gameLevel - 1) * 0.08
    this.speed = baseSpeed * levelMultiplier

    // --- Sine Wave & Direction ---
    this.direction = Math.random() < 0.5 ? 1 : -1 // 1 = R->L, -1 = L->R
    this.startY = startYPosition // Vertical center of the wave
    this.amplitude = Math.random() * 80 + 40 // Random wave height (20 to 60px)
    this.frequency = Math.random() * 0.02 + 0.01 // Random wave tightness (0.01 to 0.03)
    this.time = 0 // Time variable for sine wave calculation

    // Set initial X based on direction
    if (this.direction === 1) {
      this.x = gameAreaRight + this.size // Start off-screen right
    } else {
      this.x = gameAreaLeft - this.size // Start off-screen left
    }
    this.y = this.startY // Initial Y position
    // --- End Sine Wave & Direction ---

    this.element = null
  }

  create() {
    const bonusElement = document.createElement('div')
    bonusElement.className = 'bonus'
    // --- Dynamic Styles (Set via JS) ---
    bonusElement.style.width = `${this.size}px`
    bonusElement.style.height = `${this.size}px`
    bonusElement.style.position = 'absolute' // Keep position absolute for JS control
    bonusElement.style.left = `${this.x}px`
    bonusElement.style.top = `${this.y}px` // Use initial Y
    bonusElement.style.fontSize = `${this.size * 0.5}px`
    bonusElement.textContent = this.value

    document.body.appendChild(bonusElement)
    this.element = bonusElement
  }

  move() {
    // Update horizontal position based on direction
    this.x += this.speed * this.direction * -1 // -1 because direction 1 means R->L (negative X movement)

    // Update vertical position using sine wave
    this.time += 1
    this.y = this.startY + this.amplitude * Math.sin(this.frequency * this.time)

    // Clamp Y to stay within game area boundaries (optional but good practice)
    this.y = Math.max(
      gameAreaTop + this.size / 2,
      Math.min(this.y, gameAreaBottom - this.size / 2),
    )

    if (this.element) {
      this.element.style.left = `${this.x}px`
      this.element.style.top = `${this.y}px`
    }

    // Check if off-screen (adjust for both directions)
    const isOffScreenLeft =
      this.direction === 1 && this.x + this.size < gameAreaLeft
    const isOffScreenRight = this.direction === -1 && this.x > gameAreaRight

    if (isOffScreenLeft || isOffScreenRight) {
      this.destroy()
      const index = bonuses.indexOf(this)
      if (index > -1) {
        bonuses.splice(index, 1)
      }
    }
  }

  // Method called when hit by a laser
  hit() {
    score += this.value // Award points
    document.getElementById('score').innerHTML = score.toString()
    // TODO: Play bonus collect sound
    // BONUS_COLLECT_SOUND.currentTime = 0;
    // BONUS_COLLECT_SOUND.play();

    this.createHitEffect() // Trigger visual effect
    this.destroy() // Remove element

    // Find and remove from the global bonuses array immediately
    const index = bonuses.indexOf(this)
    if (index > -1) {
      bonuses.splice(index, 1)
    }
  }

  createHitEffect() {
    // Dramatic particle effect (e.g., purple/gold particles)
    const numParticles = 25
    const effectContainer = document.createElement('div')
    effectContainer.style.position = 'absolute'
    // Center the effect on the bonus's last position
    effectContainer.style.left = this.x + this.size / 2 + 'px'
    effectContainer.style.top = this.y + this.size / 2 + 'px'
    effectContainer.style.zIndex = '1100' // Above other elements

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div')
      particle.style.position = 'absolute'
      particle.style.width = '8px' // Slightly larger particles
      particle.style.height = '8px'
      // Alternate colors
      particle.style.backgroundColor = i % 2 === 0 ? 'gold' : 'purple'
      particle.style.borderRadius = '50%'
      particle.style.boxShadow = `0 0 5px ${particle.style.backgroundColor}` // Glow
      particle.style.pointerEvents = 'none'

      // Similar explosion animation to balls/alien
      const angle = Math.random() * 360
      const distance = 50 + Math.random() * 40
      const tx = Math.cos((angle * Math.PI) / 180) * distance
      const ty = Math.sin((angle * Math.PI) / 180) * distance

      particle.style.animation = 'explode 0.5s ease-out forwards' // Longer duration
      particle.style.setProperty('--tx', `${tx}px`)
      particle.style.setProperty('--ty', `${ty}px`)

      effectContainer.appendChild(particle)
    }

    document.body.appendChild(effectContainer)

    // Remove effect container after animation
    setTimeout(() => {
      if (effectContainer.parentNode) {
        effectContainer.parentNode.removeChild(effectContainer)
      }
    }, 500) // Match animation duration
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null // Clear reference
    }
  }
}
