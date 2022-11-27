import {defs, tiny} from './examples/common.js';

const {
    Vector3
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
        this.angle = 0; // radians
        this.spin = 0;  // angular frequency
    }

    // Using the formula from https://en.wikipedia.org/wiki/Elastic_collision
    elastic_collision(other) {
        const m1 = this.mass;
        const m2 = other.mass;
        const v1 = this.velocity;
        const v2 = other.velocity;
        const x1 = this.position;
        const x2 = other.position;

        // Calculate new velocity
        const v1_prime = v1.minus(x1.minus(x2).times(2 * m2 / (m1 + m2)
            * v1.minus(v2).dot(x1.minus(x2)) / x1.minus(x2).norm()**2));

        // Will use these for calculating spin
        const deltaV = v1_prime.minus(this.velocity);
        const relVelocity = v1.minus(v2);

        this.velocity = v1_prime;

        this.calculateSpin(relVelocity, x2.minus(x1), deltaV.norm(), true);
    }

    // On collision, take the cross product of (puck's velocity) and (vector
    // from the puck to the collision point). Call this the spin vector (spinVec).
    //
    // If spinVec points down, then we spin clockwise.
    // If spinVec points up, then we spin counter-clockwise.
    //
    // The spin's magnitude is proportional to |spinVec| * |change in speed|.
    calculateSpin(relVelocity, collisionVec, deltaSpeed, adjustTrajectory) {
        const spinVec = relVelocity.cross(collisionVec.normalized());
        let deltaSpin = spinVec.norm() * deltaSpeed;
        if (spinVec[2] < 0) {  // spin clockwise
            deltaSpin *= -1;
        }
        deltaSpin *= config.SPIN_CONSTANT;
        this.spin = Math.max(Math.min(this.spin + deltaSpin, config.MAX_SPIN), -config.MAX_SPIN);

        // Adjust trajectory based on spin (rotate velocity by theta)
        if (adjustTrajectory) {
            const theta = -deltaSpin / config.MAX_SPIN * config.MAX_SPIN_TRAJECTORY_ANGLE;
            const cs = Math.cos(theta), sn = Math.sin(theta);
            const newVelX = this.velocity[0] * cs + this.velocity[1] * -sn;
            const newVelY = this.velocity[0] * sn + this.velocity[1] * cs;
            this.velocity[0] = newVelX;
            this.velocity[1] = newVelY;
        }
    }

    update(delta_time) {
        this.angle += this.spin * delta_time;

        // Bound the puck to the table
        if (Math.abs(this.position[1]) > config.GOAL_SIZE/2
                && this.position[0] <= config.LEFT_BOUND + this.radius) {
            this.velocity[0] = Math.max(0, this.velocity[0]);
            this.position[0] = Math.max(config.LEFT_BOUND + this.radius, this.position[0]);
        }
        if (Math.abs(this.position[1]) > config.GOAL_SIZE/2
                && this.position[0] >= config.RIGHT_BOUND - this.radius) {
            this.velocity[0] = Math.min(0, this.velocity[0]);
            this.position[0] = Math.min(config.RIGHT_BOUND - this.radius, this.position[0]);
        }
        if (this.position[1] <= config.LOWER_BOUND + this.radius) {
            this.velocity[1] = Math.max(0, this.velocity[1]);
            this.position[1] = Math.max(config.LOWER_BOUND + this.radius, this.position[1]);
        }
        if (this.position[1] >= config.UPPER_BOUND - this.radius) {
            this.velocity[1] = Math.min(0, this.velocity[1]);
            this.position[1] = Math.min(config.UPPER_BOUND - this.radius, this.position[1]);
        }

        super.update(delta_time);
    }
}

export class Mallet extends MovableObject {
    constructor(radius, ...args) {
        super(...args);
        this.radius = radius;
        this.movingUp = false;
        this.movingDown = false;
        this.movingLeft = false;
        this.movingRight = false;
    }

    update(delta_time) {
        // Update acceleration based on user input
        this.acceleration = this.velocity.times(-20);
        if (this.movingUp) {
            this.acceleration[1] = config.MALLET_ACCELERATION;
        }
        if (this.movingDown) {
            this.acceleration[1] = -config.MALLET_ACCELERATION;
        }
        if (this.movingLeft) {
            this.acceleration[0] = -config.MALLET_ACCELERATION;
        }
        if (this.movingRight) {
            this.acceleration[0] = config.MALLET_ACCELERATION;
        }

        // Limit velocity
        if (this.velocity.norm() > config.MALLET_SPEED) {
            this.velocity = this.velocity.normalized().times(config.MALLET_SPEED);
        }

        // Don't let the mallet cross specific left/right bounds
        if (this.leftBound !== undefined && this.position[0] <= this.leftBound + this.radius) {
            this.velocity[0] = Math.max(0, this.velocity[0]);
            this.position[0] = Math.max(this.leftBound + this.radius, this.position[0]);
        }
        if (this.rightBound !== undefined && this.position[0] >= this.rightBound - this.radius) {
            this.velocity[0] = Math.min(0, this.velocity[0]);
            this.position[0] = Math.min(this.rightBound - this.radius, this.position[0]);
        }

        // Bound the mallet to the table
        if (this.position[0] <= config.LEFT_BOUND + this.radius) {
            this.velocity[0] = Math.max(0, this.velocity[0]);
            this.position[0] = Math.max(config.LEFT_BOUND + this.radius, this.position[0]);
        }
        if (this.position[0] >= config.RIGHT_BOUND - this.radius) {
            this.velocity[0] = Math.min(0, this.velocity[0]);
            this.position[0] = Math.min(config.RIGHT_BOUND - this.radius, this.position[0]);
        }
        if (this.position[1] <= config.LOWER_BOUND + this.radius) {
            this.velocity[1] = Math.max(0, this.velocity[1]);
            this.position[1] = Math.max(config.LOWER_BOUND + this.radius, this.position[1]);
        }
        if (this.position[1] >= config.UPPER_BOUND - this.radius) {
            this.velocity[1] = Math.min(0, this.velocity[1]);
            this.position[1] = Math.min(config.UPPER_BOUND - this.radius, this.position[1]);
        }

        super.update(delta_time);
    }
}
