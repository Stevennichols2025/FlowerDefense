class Laser {
  constructor(x, y, angle = 90) {
    this.x = x
    this.y = y
    this.speed = 25 // Define a consistent speed
    this.width = 5 // Visual width of the laser beam
    this.angle = angle // Angle in degrees (90 is straight up)
  }

  move() {
    // Convert angle to radians and calculate movement
    const radians = (this.angle * Math.PI) / 180
    this.x += Math.cos(radians) * this.speed
    this.y -= Math.sin(radians) * this.speed // Subtract because y increases downward
    this.element.style.left = `${this.x}px`
    this.element.style.top = `${this.y}px`
    // Rotate the laser beam to match its movement direction
    this.element.style.transform = `translateX(-50%) rotate(${90 - this.angle}deg)`
  }

  create() {
    const laserElement = document.createElement('div')
    laserElement.className = 'laser'
    laserElement.style.width = `${this.width}px`
    laserElement.style.height = '32px'
    laserElement.style.backgroundColor = '#0ff' // Cyan color
    laserElement.style.boxShadow = '0 0 5px #0ff, 0 0 10px #0ff' // Glow effect
    laserElement.style.left = `${this.x}px` // Center the laser on x
    laserElement.style.top = `${this.y}px`
    laserElement.style.transformOrigin = 'center' // Set rotation origin
    document.body.appendChild(laserElement)
    this.element = laserElement
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }
}
