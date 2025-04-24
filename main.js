// Smoothed-particle hydrodynamics
// import { Canvas } from './library/canvas'


const maxWidth = 700
const maxHeight = 600

const numParticles = 800
const particles = [new Particle()].slice(0, 0)

const visualRadius = 15

SPH.smoothingRadius = 80
SPH.sampleId = numParticles / 2

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
    return 1000_000 + c.x * 1000 + c.y
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
        let x = (i % row) * spacing + 150
        let y = Math.floor(i / row) * spacing + 220
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

let pp = new Particle(200, 100)
pp.pressureCoeff = 4
let mousePos = new Particle(-1000, -1000)
mousePos.density = 10
mousePos.pressureCoeff = 6000
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

    let sampleParticle = particles[SPH.sampleId]

    canvas.drawCircle(
        // canvas.canvas.width / 2, canvas.canvas.height / 2,
        sampleParticle.position.x, sampleParticle.position.y,
        {
            radius: SPH.smoothingRadius,
            fill: false
        }
    )
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

    // const cell = cellCoordinate(toCell(mousePos.position.x, mousePos.position.y))
    // canvas.drawRect(cell[0], cell[1], cell[2], cell[2])

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


let maxFrames = 1000
async function animation(timestamp) {
    Timer.update()
    canvas.clear()
    await update()
    window.requestAnimationFrame(animation)
    if (maxFrames--) {
    }
}

setupParticles()
Timer.init()
animation()
