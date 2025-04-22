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

const numParticles = 200
const particles = [new Particle()].slice(0, 0)

function setupParticles() {
    const row = Math.floor(Math.sqrt(numParticles))
    const col = numParticles - 1 / row + 1
    const spacing = 30

    for (let i = 0; i < numParticles; i++) {
        const x = (i % row) * spacing * Math.random() * 1.2
        const y = Math.floor(i / row) * spacing * Math.random() * 1.2

        const p = new Particle()
        p.position = new Vector(x + 100, y)
        p.velocity = new Vector(0, 0)
        p.damping = 1

        particles.push(p)
    }
}

SPH.smoothingRadius = 570

function update() {

    // const sample = particles[0]
    // SPH.calculateDensity(particles, sample)
    // canvas.drawCircle(sample.position.x, sample.position.y, SPH.smoothingRadius, false)

    for (const p of particles) {
        p.density = SPH.calculateDensity(particles, p)
        p.pressure = SPH.calculatePressure(particles, p)
    }
    const maxDensity = Math.max(...particles.map(p => p.density))

    const acceleration = new Vector(0, 300)
    for (const p of particles) {
        p.velocity = p.pressure
            .multiplyScalar(80000000)
            .multiplyScalar(Timer.deltaTime / 1000)


        p.move(p.velocity.multiplyScalar(Timer.deltaTime / 1000))


        // const opacity = (p.density / maxDensity).toFixed(2)
        const vel = p.velocity.length
        canvas.drawGradientCircle(p.position.x, p.position.y, {
            radius: 8,
            color: `rgb(0 0 255)`
            // color: vel > 17 ? 'red' : vel < 9 ? 'blue': 'yellow'
        })

        p.resolveCollision(maxWidth, maxHeight)
        // canvas.drawCircle(p.position.x, p.position.y)
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
