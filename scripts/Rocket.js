class Rocket {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.speed = 11 // Reduced from 18 (40% slower)
    this.size = 30 // Matches CSS font-size
    this.element = null
  }

  create() {
    const rocketElement = document.createElement('div')
    rocketElement.className = 'rocket'
    rocketElement.innerHTML = '<span class="rocket-visual">🚀</span>'
    // Initial position set using translate in CSS, adjust positioning logic here
    rocketElement.style.left = `${this.x}px`
    rocketElement.style.top = `${this.y}px`
    document.body.appendChild(rocketElement)
    this.element = rocketElement
    consoleLog(`Rocket created at: ${this.x.toFixed(2)}, ${this.y.toFixed(2)}`)
  }

  move() {
    this.y -= this.speed // Move up
    if (this.element) {
      this.element.style.top = `${this.y}px`
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null
    }
    consoleLog('Rocket destroyed.')
  }
}
