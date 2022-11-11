import {defs, tiny} from './examples/common.js';

const {
    Vector3,
} = tiny;

export const config = {
    PUCK_INIT_POS_P1: Vector3.create(-50, 0, 0),
    PUCK_INIT_POS_P2: Vector3.create(50, 0, 0),
    MALLET1_INIT_POS: Vector3.create(-100, 0, 0),
    MALLET2_INIT_POS: Vector3.create(100, 0, 0),

    PUCK_RADIUS: 4,
    MALLET1_RADIUS: 5,
    MALLET2_RADIUS: 5,

    PUCK_MASS: 5,
    MALLET1_MASS: 14,
    MALLET2_MASS: 14,

    PUCK_ELASTICITY: 0.75,

    MALLET_SPEED: 130,

    LOWER_BOUND: -57,
    UPPER_BOUND: 57,
    LEFT_BOUND: -118,
    RIGHT_BOUND: 118,

    RAIL_WIDTH: 10,
    RAIL_HEIGHT: 5,
    TABLE_HEIGHT: 50,
    GOAL_SIZE: 40,
    GOAL_POST_LENGTH: 48,
    GOAL_POST_HEIGHT: 1,

    CENTER_LINE: 0,
};
