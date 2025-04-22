


class Canvas {
    container = null
    canvas = null
    context = null

    constructor({
        boxId,
        box,
        height,
        width,
        background, border
    }) {
        const container = document.getElementById(boxId)
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        container.appendChild(canvas)
        canvas.height = height
        canvas.width = width
        canvas.style.background = background
        canvas.style.border = border


        context.fillStyle = "rgb(10 100 40)";
        // context.fillStyle = "grey";

        context.save()

        this.container = container
        this.canvas = canvas
        this.context = context
    }

    clear() {
        const { context, canvas } = this

        context.restore()
        context.save()

        // context.fillStyle = "rgb(255 255 255 / 0.1)";
        context.fillStyle = "white";
        context.globalAlpha = 0.1

        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawCircle(x, y, { radius, fill, color } = { radius: 10, fill: true, color: 'green' }) {
        const { context } = this

        context.restore()
        context.save()

        const circle = new Path2D()
        circle.arc(x, y, radius, 0, 2 * Math.PI)

        fill ? context.fillStyle = color : context.strokeStyle = color
        fill ? context.fill(circle) : context.stroke(circle)

    }

    drawGradientCircle(x, y, { radius, color } = { radius: 10, color: 'green' }) {
        const { context, canvas } = this

        context.restore()
        context.save()

        const grad = context.createRadialGradient(x, y, 0, x, y, radius)
        grad.addColorStop(0, color);
        // grad.addColorStop(0.7, "rgb(255 255 255 / 0.1)");
        grad.addColorStop(1, "rgb(255 255 255 / 0)");


        const circle = new Path2D()
        circle.arc(x, y, radius * 5, 0, 2 * Math.PI)

        // context.globalAlpha = 0.4
        context.fillStyle = grad
        // context.fill(circle)
        context.fillRect(0, 0, canvas.width, canvas.height);


    }
}

// export { Canvas }

// new Canvas({
//     boxId: 'root',
//     width: '100px',
//     height: '100px',
//     background: 'red'
// })
