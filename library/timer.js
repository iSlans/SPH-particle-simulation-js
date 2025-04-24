class Timer {
    static #lastTime
    static deltaTime
    static init() { Timer.#lastTime = Date.now() }
    static update() {
        // Timer.deltaTime = 1 / 20
        const now = Date.now()
        Timer.deltaTime = (now - Timer.#lastTime) / 1000
        Timer.#lastTime = now

    }
}
