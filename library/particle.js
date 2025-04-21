class Particle {
    position = new Vector(0, 0)
    velocity = new Vector(0, 10)
    acceleration = new Vector(0, 10)
    damping = 0.9

    // constructor() { }

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
