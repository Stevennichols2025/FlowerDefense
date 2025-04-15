class Saucer {
  constructor(size, color, x, y, speed) {
    this.size = size
    this.color = color
    this.x = x
    this.y = y
    this.initialY = y // Store initial Y
    this.baseSpeed = speed // Store base horizontal speed
    this.speed = speed // Current horizontal speed
    this.isHit = false
    this.isDefeated = false
    this.initialHealth = cTEST_MODE
      ? 20
      : 120 + SAUCER_HEALTH_INCREASE * gameLevel
    this.health = this.initialHealth // Set health to initial health

    this.isBerserk = false // Berserk flag, gets set to true near end of level
    this.berserkTargetY = 0 // Target Y for berserk mode (Where saucer will move down to)
    this.verticalSpeed = 3 // Speed for moving down
  }

  create() {
    let saucerElement = document.getElementById('Saucer')
    if (!saucerElement) {
      // Only create new element if it doesn't exist
      saucerElement = document.createElement('div')
      saucerElement.id = 'Saucer'
      saucerElement.innerHTML = '&#x1f6f8;'
      document.body.appendChild(saucerElement)
    }
    saucerElement.className = 'saucer'
    saucerElement.style.width = this.size + 'px'
    saucerElement.style.height = this.size + 'px'
    saucerElement.style.fontSize = `${ALIEN_SIZE}px`
    this.element = saucerElement

    // Calculate berserk target Y position (needs gameArea boundaries)
    this.berserkTargetY =
      gameAreaTop + (gameAreaBottom - gameAreaTop) / 2 - this.size / 2
    console.log(
      `Saucer created. InitialY=${this.initialY.toFixed(2)}, BerserkTargetY=${this.berserkTargetY.toFixed(2)}`,
    )

    // Reset position and health bar
    this.element.style.top = this.y + 'px'
    document.getElementById('saucerHealthBar').style.width = '100%'
  }

  takeDamage(damageAmount) {
    this.health = Math.max(0, this.health - damageAmount)

    // Calculate health as a percentage of initial health
    const healthPercentage = (this.health / this.initialHealth) * 100

    // Update health bar with percentage
    document.getElementById('saucerHealthBar').style.width =
      `${healthPercentage}%`

    // --- Berserk Trigger ---
    if (this.health <= this.initialHealth * 0.3 && !this.isBerserk) {
      console.log('Saucer entering BERSERK mode!')
      this.isBerserk = true
      // Add visual indicator
      if (this.element) {
        this.element.classList.add('berserk')
      }
    }
    // ---------------------

    if (this.health <= 0) {
      this.defeat()
    }
  }

  defeat() {
    // --- Pause game logic immediately, but not music ---
    pauseGame(false)
    // -------------------------------------------------

    // Set defeated flag
    this.isDefeated = true

    // Create big explosion effect
    const explosion = document.createElement('div')
    explosion.className = 'big-explosion'
    explosion.style.left = this.x + this.size / 2 - 100 + 'px'
    explosion.style.top = this.y + this.size / 2 - 100 + 'px'
    document.body.appendChild(explosion)

    // Add defeat animation to saucer
    this.element.classList.add('saucer-defeat')

    // Play explosion sound
    SPACESHIP_HIT_SOUND.currentTime = 0
    SPACESHIP_HIT_SOUND.play()

    // Show level complete message
    showLevelComplete()

    // Clear any existing balls
    while (balls.length > 0) {
      const ball = balls.pop()
      ball.destroy()
    }

    // Clear any existing bonuses
    while (bonuses.length > 0) {
      const bonus = bonuses.pop()
      bonus.destroy()
    }

    // Remove explosion effect after animation completes
    setTimeout(() => {
      if (explosion.parentNode) {
        explosion.parentNode.removeChild(explosion)
      }
    }, 1000)

    // Make sure to remove berserk visual if active
    if (this.element) {
      this.element.classList.remove('berserk')
      this.element.classList.add('saucer-defeat')
    }
  }

  move() {
    // --- Calculate Horizontal Speed ---
    const levelMultiplier = 1 + (gameLevel - 1) * SAUCER_LEVEL_SCALING // Existing level scaling
    const berserkMultiplier = this.isBerserk ? 1.8 : 1 // Speed boost for berserk
    const currentHorizontalSpeed =
      this.baseSpeed * levelMultiplier * berserkMultiplier
    let horizontalDirection = Math.sign(this.speed) // Get current direction (-1 or 1)
    this.speed = currentHorizontalSpeed * horizontalDirection // Apply speed with direction
    // ----------------------------------

    // --- Vertical Movement (Berserk Transition) ---
    if (this.isBerserk && this.y < this.berserkTargetY) {
      this.y += this.verticalSpeed
      // Clamp Y to targetY if overshot
      if (this.y > this.berserkTargetY) {
        this.y = this.berserkTargetY
      }
    } // Add else if later if it needs to move back up?
    // ---------------------------------------------

    // --- Horizontal Movement & Wall Collision ---
    this.x += this.speed
    if (this.x < gameAreaLeft || this.x + this.size > gameAreaRight) {
      this.speed *= -1 // Reverse direction
      // Adjust position slightly
      if (this.x < gameAreaLeft) {
        this.x = gameAreaLeft
      }
      if (this.x + this.size > gameAreaRight) {
        this.x = gameAreaRight - this.size
      }
    }
    // -----------------------------------------

    // Update element position (Both Left and Top)
    this.element.style.left = this.x + 'px'
    this.element.style.top = this.y + 'px'
  }

  createExplosion() {
    const numParticles = 60
    const explosionContainer = document.createElement('div')
    explosionContainer.style.position = 'absolute'
    explosionContainer.style.left = this.x + this.size / 2 + 'px'
    explosionContainer.style.top = this.y + this.size / 2 + 'px'
    explosionContainer.style.zIndex = '1000'

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div')
      particle.className = 'explosion-particle'

      // Calculate random direction for each particle
      const angle = (i / numParticles) * 360 + Math.random() * 30
      const distance = 50 + Math.random() * 30
      const tx = Math.cos((angle * Math.PI) / 180) * distance
      const ty = Math.sin((angle * Math.PI) / 180) * distance

      particle.style.setProperty('--tx', `${tx}px`)
      particle.style.setProperty('--ty', `${ty}px`)

      explosionContainer.appendChild(particle)
    }

    document.body.appendChild(explosionContainer)

    // Remove explosion container after animation
    setTimeout(() => {
      if (explosionContainer.parentNode) {
        explosionContainer.parentNode.removeChild(explosionContainer)
      }
    }, 600)
  }

  flash() {
    if (!this.isHit) {
      this.isHit = true

      // Create explosion effect
      this.createExplosion()

      // Add wobble animation
      this.element.classList.add('wobble')

      // Remove wobble after animation
      setTimeout(() => {
        this.element.classList.remove('wobble')
        this.isHit = false
      }, 300)
    }
  }

  isColliding(x, y, size) {
    const saucerCenterX = this.x + this.size / 2
    const saucerCenterY = this.y + this.size / 2
    const targetCenterX = x + size / 2
    const targetCenterY = y + size / 2

    const dx = saucerCenterX - targetCenterX
    const dy = saucerCenterY - targetCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)
    //console.log("collide distance=" + this.size / 2 + size / 2)
    //console.log("actual distance=" + distance)
    return distance < this.size / 2 + size / 2
  }
}
