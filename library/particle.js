

class Particle {
    position = [0, 0]


    constructor() { }

    get x() { return this.position[0] }
    get y() { return this.position[1] }
    set x(d) { this.position[0] = d }
    set y(d) { this.position[1] = d }
}
