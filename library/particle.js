class Particle {
    position = new Vector(0, 0)
    velocity = new Vector(0, 0)
    acceleration = new Vector(0, 0)
    damping = 1
    pressureCoeff = 1
    density = 1

    constructor(x, y) { this.position.x = x; this.position.y = y }

    move(step) {
        this.position = this.position.add(step)
    }

    resolveCollision(maxWidth, maxHeight) {
        if (this.position.x < 0) {
            this.position.x = 0
            this.velocity.x = -this.velocity.x * this.damping
        } else if (this.position.x > maxWidth) {
            this.position.x = maxWidth
            this.velocity.x = -this.velocity.x * this.damping
        }

        if (this.position.y < 0) {
            this.position.y = 0
            this.velocity.y = -this.velocity.y * this.damping
        } else if (this.position.y > maxHeight) {
            this.position.y = maxHeight
            this.velocity.y = -this.velocity.y * this.damping
        }
    }
}
