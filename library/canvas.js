


class Canvas {
    container = null
    context = null

    constructor({
        boxId,
        box,
        height,
        width,
        background
    }) {
        const container = document.getElementById(boxId)
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        container.appendChild(canvas)
        canvas.height = height
        canvas.width = width
        canvas.style.background = background

        this.container = container
        this.context = context


    }

    drawCircle(x, y) {
        const radius = 10
        const { context } = this


        const circle = new Path2D()
        circle.arc(x, y, radius, 0, 2 * Math.PI)

        context.fill(circle)

    }
}

// export { Canvas }

// new Canvas({
//     boxId: 'root',
//     width: '100px',
//     height: '100px',
//     background: 'red'
// })
