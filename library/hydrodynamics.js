import Vector from "./vector.js"

/**
 * SPH (Smoothed Particle Hydrodynamics) class provides methods for simulating fluid dynamics
 * using particle-based techniques. It includes kernel functions, density calculations,
 * pressure calculations, and utility methods for particle interactions.
 */
export default class SPH {
    static smoothingRadius = 0.1;
    static sampleId = 76;


    /**
     * Kernel function used to calculate the influence of neighboring particles.
     * Typically used in SPH simulations to determine the weight of a particle's contribution
     * based on its distance from another particle.
     *
     * @param {number} r - The distance between two particles.
     * @param {number} h - The smoothing length, which defines the area of influence.
     * @returns {number} - The kernel value for the given distance and smoothing length.
     */
    static kernel(radius, dist) {
        if (radius <= 0) return 0;
        if (dist >= radius) return 0;

        const volume = Math.PI * Math.pow(radius, 4) / 6;
        return (radius - dist) * (radius - dist) / volume;
    }

    static kernelDerivative(radius, dist) {
        if (radius <= 0) return 0;
        if (dist >= radius) return 0;

        const scale = 12 / (Math.pow(radius, 4) * Math.PI);
        return scale * (dist - radius);
    }

    /**
     * Calculates the density of each particle based on the contributions of neighboring particles.
     * The density is computed using the kernel function and the mass of neighboring particles.
     *
     * @param {Array<Object>} particles - Array of particle objects, each containing position, mass, and density.
     * @param {number} smoothingLength - The smoothing length used in the kernel function.
     */
    static calculateDensity(particles, sampleParticle) {
        let density = 0;
        const mass = 1;

        for (const particle of particles) {
            const dist = SPH.distance(particle, sampleParticle);
            const influence = SPH.kernel(SPH.smoothingRadius, dist);
            density += mass * influence;
        }
        return density
    }

    static densityToPressure(density) {
        return Math.abs(density - 2.75) * 2

    }

    static calculatePressure(particles, sampleParticle) {
        let pressure = new Vector(0, 0);
        const mass = 1;

        for (const particle of particles) {
            if (particle === sampleParticle) {
                // debugger
                continue
            }
            const dist = SPH.distance(particle, sampleParticle);
            const slope = SPH.kernelDerivative(SPH.smoothingRadius, dist);

            let direction = particle.position.subtract(sampleParticle.position).normalize();
            if (direction.length === 0) {
                direction = new Vector(Math.random(), Math.random()).normalize()
            }
            const force = direction
                .multiplyScalar(
                    (SPH.densityToPressure(particle.density) +
                        SPH.densityToPressure(sampleParticle.density)) / 2
                )
                .multiplyScalar(slope)
                .multiplyScalar(particle.pressureCoeff)
                .divideScalar(Math.abs(particle.density));
            pressure = pressure.add(force);
        }
        return pressure
    }

    /**
     * Calculates the pressure of each particle using the ideal gas law.
     * The pressure is determined based on the particle's density and a given gas constant.
     *
     * @param {Array<Object>} particles - Array of particle objects, each containing density, restDensity, and pressure.
     * @param {number} gasConstant - The gas constant used in the pressure calculation.
     */
    // static calculatePressure(particles, gasConstant) {
    //     for (let particle of particles) {
    //         particle.pressure = gasConstant * (particle.density - particle.restDensity);
    //     }
    // }

    /**
     * Helper function to calculate the Euclidean distance between two particles in 3D space.
     *
     * @param {Object} p1 - The first particle, containing a position object with x, y, and z coordinates.
     * @param {Object} p2 - The second particle, containing a position object with x, y, and z coordinates.
     * @returns {number} - The distance between the two particles.
     */
    static distance(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.position.x - p2.position.x, 2)
            + Math.pow(p1.position.y - p2.position.y, 2)
            // + Math.pow(p1.position.z - p2.position.z, 2)
        );
    }
}
