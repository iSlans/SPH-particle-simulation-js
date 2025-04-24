// Smoothed-particle hydrodynamics

import Timer from "./library/timer.js"
import Vector from "./library/vector.js"
import Canvas from "./library/canvas.js"
import Particle from "./library/particle.js"
import SPH from "./library/hydrodynamics.js"

const show = {
    neighbors: false,
    smoothingRadius: false,
    mouseGrid: false
}

window.show = show

window.SPH = SPH
window.Timer = Timer
const maxWidth = 400
const maxHeight = 400

const numParticles = 200

/** @type {Particle[]} */
const particles = []

const visualRadius = 10

SPH.smoothingRadius = 80
SPH.sampleId = numParticles / 2

let pp = new Particle(200, 100)
pp.pressureCoeff = 4
let mousePos = new Particle(-1000, -1000)
mousePos.density = 1
mousePos.pressureCoeff = 10000

// https://gka.github.io/chroma.js/#chroma-scale
const gradientColor = chroma
    .scale(['blue', 'green', 'yellow', 'orange', 'red'])
    .mode('lrgb')
    .domain([0, 2.5]);

function toCell(x, y) {
    let mod = new Vector(
        Math.floor(x / SPH.smoothingRadius),
        Math.floor(y / SPH.smoothingRadius)
    )
    return mod
}

function hashCell(c) {
    if (c.x < 0 || c.y < 0) return 0
    return SPH.smoothingRadius * 1_000_000 + c.x * 1000 + c.y
}
function cellCoordinate(c) { return [c.x * SPH.smoothingRadius, c.y * SPH.smoothingRadius, SPH.smoothingRadius] }

const canvas = new Canvas({
    boxId: "root",
    width: maxWidth,
    height: maxHeight,
    background: "white",
    border: "1px solid black",
});


function setupParticles() {
    const row = Math.floor(Math.sqrt(numParticles))
    const col = numParticles - 1 / row + 1
    const spacing = 10

    for (let i = 0; i < numParticles; i++) {
        let x = (i % row) * spacing + maxWidth / 4
        let y = Math.floor(i / row) * spacing + maxHeight / 4
        // x = Math.random() * maxWidth
        // y = Math.random() * maxHeight

        const p = new Particle()
        p.position = new Vector(x, y)
        p.velocity = new Vector(0, 0)
        p.damping = 1
        // p.pressureCoeff = 0.5

        particles.push(p)
    }
}

document.onmousemove = (e) => {
    let offset = canvas.canvas.getBoundingClientRect()
    mousePos.position.x = e.clientX - offset.x
    mousePos.position.y = e.clientY - offset.y
}

const neighborsCellOffset = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [0, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
]
const neighborsCellsHash = {}

async function update() {

    const sampleParticle = particles[SPH.sampleId]

    if (show.smoothingRadius) {
        canvas.drawCircle(
            // canvas.canvas.width / 2, canvas.canvas.height / 2,
            sampleParticle.position.x, sampleParticle.position.y,
            {
                radius: SPH.smoothingRadius,
                fill: false
            }
        )
    }
    // const a = particles.map(p => (
    //     (async () => {
    //         // p.density = SPH.calculateDensity(particles, p)
    //         const dist = SPH.distance(p, sampleParticle)
    //         if (dist < SPH.smoothingRadius) {
    //             canvas.drawCircle(p.position.x, p.position.y)
    //         }
    //     })())
    // )
    // await Promise.all(a)

    if (show.mouseGrid) {
        const cell = cellCoordinate(toCell(mousePos.position.x, mousePos.position.y))
        canvas.drawRect(cell[0], cell[1], cell[2], cell[2])
    }

    const cellTable = { '0': [] }
    particles.forEach(p => {
        const cell = toCell(p.position.x, p.position.y)
        const hash = hashCell(cell)
        p.cellHash = hash

        cellTable[p.cellHash] = cellTable[p.cellHash] ?
            [p, ...cellTable[p.cellHash]] : [p]

        if (!neighborsCellsHash[hash]) {
            neighborsCellsHash[hash] = neighborsCellOffset.flatMap(
                ([offx, offy]) => hashCell(cell.add(new Vector(offx, offy)))
            )
        }
    })


    let parallel = particles.map(p =>
        (async () => {
            const neighbors = neighborsCellsHash[p.cellHash].flatMap(hash => {
                return cellTable[hash] || []
            })
            p.density = SPH.calculateDensity(neighbors, p)

            if (show.neighbors && p === sampleParticle) {
                neighbors.map(n => {
                    canvas.drawCircle(n.position.x, n.position.y)

                })
            }
        })()
    )
    await Promise.all(parallel)

    parallel = particles.map(p =>
        (async () => {
            const neighbors = neighborsCellsHash[p.cellHash].flatMap(hash => {
                return cellTable[hash] || []
            })

            p.pressure = SPH.calculatePressure([
                ...neighbors,
                // ...particles,
                mousePos
            ], p)
        })()
    )
    await Promise.all(parallel)

    parallel = particles.map(p => (async () => {
        p.velocity = p.pressure
            .multiplyScalar(20)
            .divideScalar(p.density)
            .multiplyScalar(Timer.deltaTime)
            .add(p.velocity.multiplyScalar(0.94))
        // .add(
        //     Vector.Down
        //         .multiplyScalar(100)
        //         .multiplyScalar(Timer.deltaTime)
        // )


        // 1 ||
        //     canvas.drawLine(
        //         p.position.x, p.position.y,
        //         // p.position.x + p.velocity.x,
        //         // p.position.y + p.velocity.y,
        //         p.position.add(p.pressure.normalize().multiplyScalar(10)).x,
        //         p.position.add(p.pressure.normalize().multiplyScalar(10)).y
        //     )

        const step = p.velocity.multiplyScalar(Timer.deltaTime)
        p.move(step)


        // const opacity = (p.density / maxDensity).toFixed(2)
        const vel = step.length / 8

        canvas.drawGradientCircle(p.position.x, p.position.y, {
            radius: visualRadius,
            // color: `rgb(${pickHex([255, 0 , 0], [0, 255, 100], vel)})`
            color: `${gradientColor(vel)}`
        })

        p.resolveCollision(maxWidth, maxHeight)
        // canvas.drawCircle(p.position.x, p.position.y)
    })())
    await Promise.all(parallel)

}

window.deltas = []
let maxFrames = 1000
async function animation(timestamp) {
    Timer.update(timestamp)
    canvas.clear()
    update()
    window.requestAnimationFrame(animation)
    if (maxFrames > 0) {
        maxFrames--
        window.deltas.push(Timer.deltaTime)
    }
}

async function firstFrame(timestamp) {
    Timer.init(timestamp)
    requestAnimationFrame(animation)
}

setupParticles()
// animation()
requestAnimationFrame(firstFrame)
