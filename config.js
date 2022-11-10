import {defs, tiny} from './examples/common.js';

const {
    Vector3,
} = tiny;

export const config = {
    PUCK_INIT_POS: Vector3.create(0, 0, 0),
    MALLET1_INIT_POS: Vector3.create(-21, 0, 0),
    MALLET2_INIT_POS: Vector3.create(21, 0, 0),

    PUCK_RADIUS: 8,
    MALLET1_RADIUS: 10,
    MALLET2_RADIUS: 10,

    PUCK_MASS: 5,
    MALLET1_MASS: 14,
    MALLET2_MASS: 14,

    PUCK_ELASTICITY: 0.8,

    MALLET_SPEED: 150,

    LOWER_BOUND: -65,
    UPPER_BOUND: 65,
    LEFT_BOUND: -126,
    RIGHT_BOUND: 126,

    CENTER_LINE: 0,
};
