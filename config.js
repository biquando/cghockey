import {defs, tiny} from './examples/common.js';

const {
    Vector3,
} = tiny;

export const config = {
    PUCK_INIT_POS: Vector3.create(0, 0, 0),
    MALLET1_INIT_POS: Vector3.create(-5, 0, 0),
    MALLET2_INIT_POS: Vector3.create(5, 0, 0),

    PUCK_RADIUS: 1.3,
    MALLET1_RADIUS: 2,
    MALLET2_RADIUS: 2,

    PUCK_ELASTICITY: 0.9,

    MALLET1_SPEED: 20,
    MALLET2_SPEED: 20,

    LOWER_BOUND: -20,
    UPPER_BOUND: 20,
    LEFT_BOUND: -30,
    RIGHT_BOUND: 30,

    CENTER_LINE: 0,
};
