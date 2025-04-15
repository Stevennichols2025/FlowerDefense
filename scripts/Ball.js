class Ball {
  constructor(size, color, x, y, speed, angle, type = 'standard') {
    this.size = BALL_SIZE
    this.color = color
    this.x = x
    this.y = y
    this.type = type // 'standard' or 'armored'
    this.hitPoints = this.type === 'standard' ? 1 : 4
    const levelMultiplier = 1 + (gameLevel - 1) * 0.15
    this.speed = speed * (GAME_WIDTH / 1500) * levelMultiplier
    this.angle = angle
    this.lastPlayerHitTime = 0
    this.playerImmunityEndTime = 0
    this.isTargetedByBee = false // <<< ADDED: Flag for bee targeting
  }

  create() {
    const ballElement = document.createElement('div')
    ballElement.className = 'ball'
    ballElement.style.width = this.size + 'px'
    ballElement.style.height = this.size + 'px'

    // Choose emoji based on type
    const emojiMap = {
      standard: '&#x1F47D;', // Regular alien
      armored: '&#x1F47E;', // Alien monster/space invader
    }

    ballElement.innerHTML = emojiMap[this.type] || emojiMap['standard']
    ballElement.style.fontSize = `${this.size}px`
    ballElement.style.color = this.color

    // Add a subtle visual indicator of armored status
    if (this.type === 'armored') {
      ballElement.style.textShadow = '0 0 10px #ff0, 0 0 15px #ff0' // Yellow glow
    }

    document.body.appendChild(ballElement)
    this.element = ballElement
  }

  // New method to handle taking damage
  takeDamage() {
    this.hitPoints--
    // Visual feedback
    this.flash()
    return this.hitPoints <= 0 // Return true if destroyed
  }

  // Flash effect when hit
  flash() {
    if (this.element) {
      // Store original color
      const originalColor = this.element.style.color
      // Flash white
      this.element.style.color = '#fff'

      // Return to original color
      setTimeout(() => {
        if (this.element) {
          this.element.style.color = originalColor

          // Update visual indicator based on remaining health (for armored balls)
          if (this.type === 'armored') {
            const opacity = this.hitPoints / 3 // Fade based on remaining health
            this.element.style.textShadow = `0 0 10px rgba(255,255,0,${opacity}), 0 0 15px rgba(255,255,0,${opacity})`
          }
        }
      }, 100)
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }

  move() {
    const radianAngle = (this.angle * Math.PI) / 180
    const yVelocity = Math.sin(radianAngle) * this.speed
    const xSpeed = Math.cos(radianAngle) * this.speed
    const ySpeed = Math.sin(radianAngle) * this.speed

    // 1. Calculate potential next position
    let potentialX = this.x + xSpeed
    let potentialY = this.y + ySpeed

    // Calculate potential visual edges
    const visualLeft = potentialX - this.size / 2
    const visualRight = potentialX + this.size / 2
    const visualTop = potentialY - this.size / 2
    const visualBottom = potentialY + this.size / 2

    // 2. Perform Wall Collision Checks & Corrections
    if (visualLeft < gameAreaLeft) {
      this.angle = 180 - this.angle
      potentialX = gameAreaLeft + this.size / 2
    } else if (visualRight > gameAreaRight) {
      this.angle = 180 - this.angle
      potentialX = gameAreaRight - this.size / 2
    }
    if (visualTop < gameAreaTop && yVelocity < 0) {
      this.angle = 360 - this.angle
      potentialY = gameAreaTop + this.size / 2
    }

    // 3. Perform Player Collision Check & Corrections (if immunity allows)
    const now = Date.now()
    const playerImmunityDuration = 300
    if (now > this.playerImmunityEndTime) {
      // Calculate player hitbox boundaries (using reduced size)
      const playerBottomYVal = parseFloat(player.style.bottom || '0')
      const playerTopYVal = WINDOW_HEIGHT - playerBottomYVal - PLAYER_SIZE
      const playerCollisionWidthVal = PLAYER_SIZE * 0.4
      const playerCollisionHeightVal = PLAYER_SIZE * 0.8
      const playerVisualOffsetX = playerCollisionWidthVal / 2
      const playerLeftXVal = playerX - playerVisualOffsetX
      const playerRightXVal = playerX + playerVisualOffsetX
      const playerCollisionTopYVal =
        playerTopYVal + (PLAYER_SIZE - playerCollisionHeightVal) / 2
      const playerCollisionBottomYVal =
        playerCollisionTopYVal + playerCollisionHeightVal

      // Check for overlap
      if (
        potentialX + this.size / 2 > playerLeftXVal &&
        potentialX - this.size / 2 < playerRightXVal &&
        potentialY + this.size / 2 > playerCollisionTopYVal &&
        potentialY - this.size / 2 < playerCollisionBottomYVal
      ) {
        this.playerImmunityEndTime = now + playerImmunityDuration // Set immunity

        // Apply Penalty/Boost (separate cooldown)
        const playerHitCooldown = 200
        if (now - this.lastPlayerHitTime > playerHitCooldown) {
          // ... (penalty, boost, log, warning effect logic) ...
          if (score > 0) {
            score--
            document.getElementById('score').innerHTML = score.toString()
          }
          this.speed *= 1.2
          this.lastPlayerHitTime = now
          consoleLog(
            `Player hit! Score: ${score}, New Ball Speed: ${this.speed.toFixed(2)}`,
          )
          const warningDuration = 400
          applyBorderEffect('border-top', 'warning', warningDuration)
          applyBorderEffect('border-left', 'warning', warningDuration)
          applyBorderEffect('border-right', 'warning', warningDuration)
          applyBorderEffect('border-bottom-left', 'warning', warningDuration)
          applyBorderEffect('border-bottom-right', 'warning', warningDuration)
        }

        // Apply Bounce Physics (Modify potentialX/Y and angle)
        if (potentialX < playerLeftXVal || potentialX > playerRightXVal) {
          // SIDE HIT LOGIC (Upper/Lower check based on visual center)
          const playerVisualCenterYVal = playerTopYVal + PLAYER_SIZE / 2
          const separationBufferVal = 8
          if (visualBottom >= playerVisualCenterYVal) {
            // Lower Half
            if (potentialX < playerX) {
              this.angle = 45 + (Math.random() * 10 - 5)
              potentialX = playerLeftXVal - this.size / 2 - separationBufferVal
            } else {
              this.angle = 135 + (Math.random() * 10 - 5)
              potentialX = playerRightXVal + this.size / 2 + separationBufferVal
            }
          } else {
            // Upper Half
            this.angle = 180 - this.angle + playerSpeed * 1.5
            this.angle = (this.angle + 360) % 360
            if (potentialX < playerX) {
              potentialX = playerLeftXVal - this.size / 2 - separationBufferVal
            } else {
              potentialX = playerRightXVal + this.size / 2 + separationBufferVal
            }
          }
          potentialY -= 1 // Nudge up after side hit
          const correctedVisualBottom = potentialY + this.size / 2
          if (correctedVisualBottom > gameAreaBottom) {
            potentialY = gameAreaBottom - this.size / 2 - 1
          }
        } else {
          // TOP HIT LOGIC
          if (ySpeed > 0) {
            this.angle = 360 - this.angle
            potentialY = playerTopYVal - this.size / 2 - 1 // Place slightly above visual top
          }
          // Ignore if moving up
        }
      }
    }

    // 4. Perform Bottom Collision Checks (using potentially modified potentialX/Y)
    if (potentialY > gameAreaBottom) {
      // Check ball CENTER against game area bottom
      const ballCenterXVal = potentialX

      // Check if horizontally within the gap
      if (ballCenterXVal >= gapStartX && ballCenterXVal <= gapEndX) {
        // Ball is potentially in the flower gap
        const flowers = document.getElementsByClassName('static-flower')
        // let hitFlower = false; // Flag not needed due to immediate return
        for (let flower of flowers) {
          const flowerRect = flower.getBoundingClientRect()
          const flowerCenterXVal = flowerRect.left + flowerRect.width / 2
          const flowerCenterYVal = flowerRect.top + flowerRect.height / 2
          const dxVal = ballCenterXVal - flowerCenterXVal
          // Use potentialY for ball's vertical center check
          const dyVal = potentialY - flowerCenterYVal
          const distanceVal = Math.sqrt(dxVal * dxVal + dyVal * dyVal)

          // Check collision based on ball radius and flower radius (approx)
          if (distanceVal < this.size / 2 + flowerRect.width / 2) {
            // hitFlower = true; // Mark that a flower was hit
            createFlowerDeathAnimation(flower)
            setTimeout(() => {
              flower.remove()
              if (
                document.getElementsByClassName('static-flower').length === 0
              ) {
                setTimeout(endGame, 1000)
              }
            }, 100)
            this.destroy()
            balls.splice(balls.indexOf(this), 1)
            return // Destroyed - exit function immediately
          }
        }
        // If loop completes and no flower was hit, ball passes through gap.
        // Position (potentialX, potentialY) will be updated at the end.
      } else {
        // Hit solid bottom border - Bounce logic
        // Calculate current Y speed again to ensure we bounce only when moving down
        const currentRadianAngle = (this.angle * Math.PI) / 180
        const currentYSpeed = Math.sin(currentRadianAngle) * this.speed

        if (currentYSpeed > 0) {
          // Only bounce if moving down
          this.angle = 360 - this.angle
          // Correct position to be just above the border line
          potentialY = gameAreaBottom - this.size / 2 - 1 // Place edge slightly above
        }
        // If moving up towards the border, let it pass (position updated at end)
      }
    }

    // 5. Final Position Update (Always happens unless returned early after flower hit)
    this.x = potentialX
    this.y = potentialY

    // 6. Update element style
    if (this.element && this.element.parentNode) {
      this.element.style.left = this.x + 'px'
      this.element.style.top = this.y + 'px'
    }
  }
  isColliding(x, y, size) {
    const ballCenterX = this.x + this.size / 2
    const ballCenterY = this.y + this.size / 2
    const targetCenterX = x + size / 2
    const targetCenterY = y + size / 2

    const dx = ballCenterX - targetCenterX
    const dy = ballCenterY - targetCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance < this.size / 2 + size / 2
  }

  createExplosion() {
    const numParticles = 12
    const explosionContainer = document.createElement('div')
    explosionContainer.style.position = 'absolute'
    explosionContainer.style.left = this.x + this.size / 2 + 'px'
    explosionContainer.style.top = this.y + this.size / 2 + 'px'
    explosionContainer.style.zIndex = '1000'

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div')
      particle.style.position = 'absolute'
      particle.style.width = '6px'
      particle.style.height = '6px'
      particle.style.backgroundColor = this.color
      particle.style.borderRadius = '50%'
      particle.style.pointerEvents = 'none'

      // Calculate random direction for each particle
      const angle = (i / numParticles) * 360 + Math.random() * 30
      const distance = 30 + Math.random() * 20
      const tx = Math.cos((angle * Math.PI) / 180) * distance
      const ty = Math.sin((angle * Math.PI) / 180) * distance

      // Add animation
      particle.style.animation = 'explode 0.3s ease-out forwards'
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
    }, 300)
  }
}
