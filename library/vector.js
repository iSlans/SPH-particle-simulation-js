export default class Vector {
    static Down = new Vector(0, 1)
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(v) {
        return new Vector(this.x * v.x, this.y * v.y);
    }

    multiplyScalar(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divideScalar(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    normalize() {
        const len = this.length;
        if (len === 0) return new Vector(0, 0);
        return new Vector(this.x / len, this.y / len);
    }
}
