// Smoothed-particle hydrodynamics
// import { Canvas } from './library/canvas'


const maxWidth = 600
const maxHeight = 500

const canvas = new Canvas({
    boxId: "root",
    width: maxWidth,
    height: maxHeight,
    background: "white",
    border: "1px solid black",
});

const numParticles = 10
const particles = [new Particle()].slice(0, 0)

function setupParticles() {
    const row = Math.floor(Math.sqrt(numParticles))
    const col = numParticles - 1 / row + 1
    const spacing = 30

    for (let i = 0; i < numParticles; i++) {
        const x = (i % row) * spacing
        const y = Math.floor(i / row) * spacing + 20

        const p = new Particle()
        p.position = new Vector(x + 100, y)
        p.velocity = new Vector(0, 20)
        p.damping = 0.8

        particles.push(p)
    }
}

function update() {

    const acceleration = new Vector(0, 300)

    for (const p of particles) {
        p.velocity = p.velocity.add(
            new Vector(1, 1)
                .multiply(acceleration)
                .multiplyScalar(Timer.deltaTime / 1000)
        )

        p.move(p.velocity.multiplyScalar(Timer.deltaTime / 1000))

        p.resolveCollision(maxWidth, maxHeight)
        canvas.drawCircle(p.position.x, p.position.y)
    }

}


let maxFrames = 1000
function animation(timestamp) {
    Timer.update()
    canvas.clear()
    update()
    if (maxFrames--) {
        window.requestAnimationFrame(animation)
    }
}

setupParticles()
Timer.init()
animation()
