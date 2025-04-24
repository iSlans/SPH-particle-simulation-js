export default class Timer {
    static #lastTime
    static deltaTime
    static init(now = Date.now()) {
        Timer.#lastTime = now
    }
    static update(now = Date.now()) {
        // const now = Date.now()
        Timer.deltaTime = (now - Timer.#lastTime) / 1000
        Timer.#lastTime = now
        // Timer.deltaTime = 0.01

    }
}
