console.clear()

class App {

  constructor({ el }) {
    this.container = el

    this.tick = this.tick.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.update = this.update.bind(this)
    this.render = this.render.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.isOnSnake = this.isOnSnake.bind(this)
    this.addSnakeParts = this.addSnakeParts.bind(this)
    this.getRandomPosition = this.getRandomPosition.bind(this)
    this.outOfGrid = this.outOfGrid.bind(this)
    this.snakeIntersection = this.snakeIntersection.bind(this)

    this.init.call(this)
  }

  init() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.time = 0
    this.paused = false
    this.gameOver = false
    this.gridSize = 21
    this.snakeSpeed = 10
    this.snakeNewParts = 0
    this.snakeGrowthRate = 1
    this.snakeBody = [{ x: 11, y: 11 }]
    this.inputDirection = { x: 0, y: 0 }
    this.prevInputDirection = { x: 0, y: 0 }
    this.food = this.getRandomPosition()
    this.onResize()
    this.tick()

    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('visibilitychange', () => document.hidden ? this.pause() : this.play())
  }

  onKeyDown(event) {
    switch (event.key) {
      case 'ArrowLeft':
        if (this.prevInputDirection.x !== 0) break
        this.inputDirection = { x: -1, y: 0 }
        break
      case 'ArrowRight':
        if (this.prevInputDirection.x !== 0) break
        this.inputDirection = { x: 1, y: 0 }
        break
      case 'ArrowUp':
        if (this.prevInputDirection.y !== 0) break
        this.inputDirection = { x: 0, y: -1 }
        break
      case 'ArrowDown':
        if (this.prevInputDirection.y !== 0) break
        this.inputDirection = { x: 0, y: 1 }
        break
    }
  }

  update() {
    this.addSnakeParts()
    for (let i = this.snakeBody.length - 2; i >= 0; i--) {
      this.snakeBody[i + 1] = { ...this.snakeBody[i] }
    }
    this.snakeBody[0].x += this.inputDirection.x
    this.snakeBody[0].y += this.inputDirection.y

    this.prevInputDirection = this.inputDirection

    if (this.isOnSnake(this.food)) {
      this.snakeNewParts += this.snakeGrowthRate
      this.food = this.getRandomPosition()
    }

    this.gameOver = this.outOfGrid() || this.snakeIntersection()
  }

  render() {
    this.container.innerHTML = ''

    this.snakeBody.forEach(part => {
      const snakePart = document.createElement('div')
      snakePart.classList.add('snake')
      snakePart.style.gridRowStart = part.y
      snakePart.style.gridColumnStart = part.x
      this.container.append(snakePart)
    })

    const foodPart = document.createElement('div')
    foodPart.classList.add('food')
    foodPart.style.gridRowStart = this.food.y
    foodPart.style.gridColumnStart = this.food.x
    this.container.append(foodPart)
  }

  tick(currentTime) {
    if (this.paused) return
    if (this.gameOver) {
      if (confirm('You lose! Press OK to restart')) {
        window.location.reload()
      }
      this.pause()
    }
    requestAnimationFrame(this.tick)
    const seconds = (currentTime - this.time) / 1000
    if (seconds < 1 / this.snakeSpeed) return

    this.update()
    this.render()
    this.time = currentTime
  }

  onResize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
  }

  pause() {
    this.paused = true
  }

  play() {
    this.paused = false
  }

  isOnSnake(position, { ignoreHead = false } = {}) {
    return this.snakeBody.some((part, idx) => {
      if (ignoreHead && idx === 0) return false
      return part.x === position.x && part.y === position.y
    })
  }

  addSnakeParts() {
    for (let i = 0; i < this.snakeNewParts; i++) {
      this.snakeBody.push({ ...this.snakeBody[this.snakeBody.length - 1] })
    }
    this.snakeNewParts = 0
  }

  getRandomPosition() {
    let newFoodPosition

    while (typeof newFoodPosition === 'undefined' || this.isOnSnake(newFoodPosition)) {
      newFoodPosition = {
        x: Math.floor(Math.random() * this.gridSize) + 1,
        y: Math.floor(Math.random() * this.gridSize) + 1
      }
    }

    return newFoodPosition
  }

  outOfGrid() {
    const position = this.snakeBody[0]

    return (
      position.x < 1 || position.x > this.gridSize ||
      position.y < 1 || position.y > this.gridSize
    )
  }

  snakeIntersection() {
    return this.isOnSnake(this.snakeBody[0], { ignoreHead: true })
  }

}

new App({ el: document.getElementById('app') })
