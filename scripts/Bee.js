class Bee {
  constructor(startX, startY) {
    this.size = 32
    this.x = startX
    this.y = startY
    const baseSpeed = 4 + Math.random() * 2
    const levelMultiplier = 1 + (gameLevel - 1) * 0.15 // Same scaling as balls
    this.baseSpeed = baseSpeed * levelMultiplier
    this.drift = (Math.random() - 0.5) * 1
    this.element = null
    this.targetBall = null
    this.state = 'seeking'

    // <<< ADDED: Idle Target Initialization >>>
    this.setNewIdleTarget()
  }

  // <<< ADDED: Helper function to set a new random idle target >>>
  setNewIdleTarget() {
    // Ensure gameArea boundaries are defined before calling this
    const padding = this.size * 2 // Keep away from edges
    this.idleTargetX =
      gameAreaLeft +
      padding +
      Math.random() * (gameAreaRight - gameAreaLeft - 2 * padding)
    // Target upper 2/3rds of the game area for patrolling
    this.idleTargetY =
      gameAreaTop +
      padding +
      Math.random() * ((gameAreaBottom - gameAreaTop) * 0.66 - padding)
    consoleLog(
      `Bee ${this.element?.id || 'New'} set new idle target: (${this.idleTargetX.toFixed(2)}, ${this.idleTargetY.toFixed(2)})`,
    )
  }

  create() {
    const beeElement = document.createElement('div')
    beeElement.className = 'bee'
    beeElement.innerHTML = '&#x1F41D;' // Honeybee emoji
    beeElement.style.left = `${this.x - this.size / 2}px` // Center horizontally
    beeElement.style.top = `${this.y - this.size / 2}px` // Center vertically
    beeElement.style.fontSize = `${this.size}px` // Ensure size matches
    // Other styles like position: absolute are handled by CSS
    consoleLog(
      `Bee element created with style: left=${beeElement.style.left}, top=${beeElement.style.top}`,
    ) // <<< LOG ELEMENT STYLE
    document.body.appendChild(beeElement)
    this.element = beeElement
  }

  move() {
    const oldY = this.y
    const oldX = this.x
    let moveDescription = 'Default' // Simplified log description

    // --- State-Based Movement ---
    if (this.state === 'attacking') {
      // ... (Target validation logic remains the same) ...
      if (
        !this.targetBall ||
        this.targetBall.element === null ||
        !balls.includes(this.targetBall)
      ) {
        // ... (Handle lost target -> seeking) ...
        consoleLog(
          `Bee ${this.element?.id || 'N/A'} lost target, switching to seeking.`,
        )
        if (this.targetBall) this.targetBall.isTargetedByBee = false // Clear flag if target existed
        this.targetBall = null
        this.state = 'seeking' // Go back to seeking/idle behavior
        this.speed = this.baseSpeed // Reset speed
        // Seeking/Idle movement will be handled in the else block below for this frame
        moveDescription = 'Target Lost -> Seeking/Idle'
      } else {
        // 2. Move Towards Target & Check Collision
        moveDescription = 'Attacking'
        const targetX = this.targetBall.x
        const targetY = this.targetBall.y
        const dx = targetX - this.x
        const dy = targetY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        this.speed = this.baseSpeed * 1.5

        if (distance < 10) {
          // Increased hit distance slightly
          consoleLog(
            `Bee ${this.element?.id || 'N/A'} hit target Ball! Switching to Exiting.`,
          )

          // Process ball hit
          let ballDestroyed = false
          if (this.targetBall.takeDamage()) {
            this.targetBall.createExplosion()
            this.targetBall.destroy()
            // Ensure removal from balls array if destroy didn't handle it
            const ballArrayIndex = balls.indexOf(this.targetBall)
            if (ballArrayIndex > -1) balls.splice(ballArrayIndex, 1)
            ballDestroyed = true
          }

          // Clear target reference and flag LAST
          this.targetBall.isTargetedByBee = false
          this.targetBall = null

          // Change bee state and speed for exit
          this.state = 'exiting'
          this.speed = this.baseSpeed * 2 // Faster exit speed
          moveDescription = 'Hit Target -> Exiting'
          // --- Bee continues to move in this frame, handled by 'exiting' state below ---
        } else {
          // Move towards target (Attacking)
          this.x += (dx / distance) * this.speed
          this.y += (dy / distance) * this.speed
        }
      }
    }

    // Handle Exiting state
    else if (this.state === 'exiting') {
      moveDescription = 'Exiting'
      this.y -= this.speed // Move straight up
      // Optional: Add slight horizontal drift back?
      // this.x += this.drift * 0.2;

      // Check if off-screen top during exit
      const topBoundary = gameAreaTop
      if (this.y + this.size < topBoundary) {
        consoleLog(
          `Bee ${this.element?.id || 'N/A'} destroyed (Exited screen top)`,
        )
        this.destroy()
        const index = bees.indexOf(this)
        if (index > -1) {
          bees.splice(index, 1)
        }
        consoleLog('bees count=' + bees.length)
        if (bees.length === 0) {
          BEE_LAUNCH_SOUND.pause() // Pause the sound
          BEE_LAUNCH_SOUND.currentTime = 0 // Reset to beginning
        }
        return // Stop further processing for this destroyed bee
      }
    }

    // Handle Seeking/Idle state
    else if (this.state === 'seeking' || this.state === 'idle') {
      // ... (Seeking/Idle logic remains the same) ...
      moveDescription = this.state // Set description based on current state
      const targetX = this.idleTargetX
      const targetY = this.idleTargetY
      const dx = targetX - this.x
      const dy = targetY - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      this.speed = this.baseSpeed // Use base speed for idle

      if (distance < 15) {
        // Close enough to idle target
        this.setNewIdleTarget() // Get a new patrol point
      } else {
        // Move towards idle target
        this.x += (dx / distance) * this.speed
        this.y += (dy / distance) * this.speed
      }
    }
    // --------------------------

    // Update element position (if not destroyed during exit check)
    if (this.element) {
      this.element.style.top = `${this.y}px`
      this.element.style.left = `${this.x}px`
    }

    // General Off-screen Check (redundant if handled in Exiting state? Keep as failsafe for now?)
    // Let's remove this for now, rely on the Exiting state check.
    /*
        const topBoundary = gameAreaTop; 
        if (this.state !== 'attacking' && this.y + this.size < topBoundary) { 
            consoleLog(`Bee ${this.element?.id || 'N/A'} destroyed (Off-screen top - Failsafe)`); 
            this.destroy(); 
        }
        */
  }

  checkCollision(ball) {
    // Requires ball.x, ball.y, ball.size
    const dx = this.x - ball.x
    const dy = this.y - ball.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    // Check if distance is less than sum of radii (approximate)
    return distance < this.size / 2 + ball.size / 2
  }

  destroy() {
    // Clear target flag on the ball if this bee had one
    if (this.targetBall) {
      consoleLog(
        `Bee ${this.element?.id || 'N/A'} destroyed, clearing target flag on ball.`,
      )
      this.targetBall.isTargetedByBee = false
      this.targetBall = null // Clear own reference
    }
    // Original destroy logic
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null
    }
  }
}
