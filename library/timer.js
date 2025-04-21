class Timer {
    static #lastTime
    static deltaTime
    static init() { Timer.#lastTime = Date.now() }
    static update() {
        const now = Date.now()
        Timer.deltaTime = now - Timer.#lastTime
        Timer.#lastTime = now
    }
}
