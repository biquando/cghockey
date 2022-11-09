import {defs, tiny} from './examples/common.js';

const {
    Vector3,
} = tiny;

import {config} from './config.js';

class MovableObject {
    constructor(mass=1, position) {
        this.position = position.copy();
        this.velocity = Vector3.create(0, 0, 0);
        this.acceleration = Vector3.create(0, 0, 0);
        this.mass = mass;
    }

    update(delta_time) {
        this.position.add_by(this.velocity.times(delta_time));
        this.velocity.add_by(this.acceleration.times(delta_time));
    }
}

export class Puck extends MovableObject {
    constructor(radius, ...args) {
        super(...args);
        this.radius = radius;
    }

    // Using the formula from https://en.wikipedia.org/wiki/Elastic_collision
    elastic_collision(other) {
        const m1 = this.mass;
        const m2 = other.mass;
        const v1 = this.velocity;
        const v2 = other.velocity;
        const x1 = this.position;
        const x2 = other.position;

        const v1_prime = v1.minus(x1.minus(x2).times(2 * m2 / (m1 + m2)
            * v1.minus(v2).dot(x1.minus(x2)) / x1.minus(x2).norm()**2));

        this.velocity = v1_prime.times(config.PUCK_ELASTICITY);
    }
}

export class Mallet extends MovableObject {
    constructor(radius, ...args) {
        super(...args);
        this.radius = radius;
    }

    update(delta_time) {
        super.update(delta_time);

        // Bound the mallet to the table
        this.position[0] = Math.max(config.LEFT_BOUND + this.radius,
            Math.min(config.RIGHT_BOUND - this.radius, this.position[0]));
        this.position[1] = Math.max(config.LOWER_BOUND + this.radius,
            Math.min(config.UPPER_BOUND - this.radius, this.position[1]));

        // Don't let the mallet cross specific left/right bounds
        console.log(this.leftBound);
        if (this.leftBound !== undefined) {
            this.position[0] = Math.max(this.leftBound + this.radius, this.position[0]);
        }
        if (this.rightBound !== undefined) {
            this.position[0] = Math.min(this.rightBound - this.radius, this.position[0]);
        }
    }
}
