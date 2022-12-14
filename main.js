import {defs, tiny} from './examples/common.js';

const {
        vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Material, Scene, Texture, 
} = tiny;

const {
    Textured_Phong,
} = defs;

import {Puck, Mallet} from './physics.js';
import {config} from './config.js';



export class Main extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.scoreL=0;
        this.scoreR=0;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            sphere: new defs.Subdivision_Sphere(4),
            cylinder: new defs.Capped_Cylinder(100,100),
            puck: new defs.Rounded_Capped_Cylinder(100,100),
            cube: new defs.Cube(),
            table: new defs.Cube(),
            rail: new defs.Cube(),
            floor: new defs.Cube(),
        };

        // Scale the table texture to fit the table
        for (let i = 0; i < this.shapes.table.arrays.texture_coord.length; i++) {
            this.shapes.table.arrays.texture_coord[i][1] *= config.UPPER_BOUND/config.RIGHT_BOUND;
            this.shapes.table.arrays.texture_coord[i][1] += 0.258;
        }
        // Scale the floor texture to be smaller
        for (let i = 0; i < this.shapes.floor.arrays.texture_coord.length; i++) {
            this.shapes.floor.arrays.texture_coord[i][0] *= 4;
            this.shapes.floor.arrays.texture_coord[i][1] *= 4;
        }

        // *** Materials
        this.materials = {
            test: new Material(new Gouraud_Shader(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 1, specularity: 1, 
                texture: new Texture("assets/Mallet.jpg")
            }),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            table: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.8, specularity: 0.3,
                texture: new Texture("assets/table.png", "LINEAR_MIPMAP_LINEAR")
            }),
            floor: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/floor.png", "LINEAR_MIPMAP_LINEAR")
            }),
            puck: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1, specularity: 0.2,
                texture: new Texture("assets/Puck.jpg")
            }),
            mallet: new Material(new defs.Fake_Bump_Map(1), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 1, specularity: 1, 
                texture: new Texture("assets/Mallet.jpg")
            }),
            rail: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 1, specularity: 1, 
                texture: new Texture("assets/Mallet.jpg")
            }),
            zero: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/0.png", "LINEAR_MIPMAP_LINEAR")
            }),
            one: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/1.png", "LINEAR_MIPMAP_LINEAR")
            }),
            two: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/2.png", "LINEAR_MIPMAP_LINEAR")
            }),
            three: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/3.png", "LINEAR_MIPMAP_LINEAR")
            }),
            four: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/4.png", "LINEAR_MIPMAP_LINEAR")
            }),
            five: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/5.png", "LINEAR_MIPMAP_LINEAR")
            }),
            six: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/6.png", "LINEAR_MIPMAP_LINEAR")
            }),
            seven: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .77,
                texture: new Texture("assets/7.png", "LINEAR_MIPMAP_LINEAR")
            }),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, -5, 200), vec3(0, 0, 0), vec3(0, 1, 0));

        // Bgm and sound effects
        this.bgm_flag = false;
        this.bgm = new Audio("assets/Seatbelts - Bad Dog No Biscuits.mp3");
        this.winRound = new Audio("assets/WinRound.mp3");
        this.winGame = new Audio("assets/GameWin.mp3");


        /*=== OUR CODE STARTS HERE ===========================================*/

        // Initialize puck and mallets
        // Parameters: radius, mass, position
        this.puck    = new Puck  (config.PUCK_RADIUS,       config.PUCK_MASS, config.PUCK_INIT_POS);
        this.mallet1 = new Mallet(config.MALLET1_RADIUS, config.MALLET1_MASS, config.MALLET1_INIT_POS);
        this.mallet2 = new Mallet(config.MALLET2_RADIUS, config.MALLET2_MASS, config.MALLET2_INIT_POS);

        // Don't let the mallets cross the center line
        this.mallet1.rightBound = config.CENTER_LINE;
        this.mallet2.leftBound = config.CENTER_LINE;

        this.scoreL = this.scoreR = 0;
    }

    reset() {
        this.puck.position = config.PUCK_INIT_POS.copy();
        this.puck.velocity = vec3(0, 0, 0);
        this.puck.angle = 0;
        this.puck.spin = 0;
        this.mallet1.position = config.MALLET1_INIT_POS.copy();
        this.mallet2.position = config.MALLET2_INIT_POS.copy();
        this.scoreL = this.scoreR = 0;
    }

    make_control_panel() {
        const BUTTON_COLOR = "#6E6460";

        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("P1 Up", ["w"], () => {this.mallet1.movingUp = true;},
            BUTTON_COLOR, () => {this.mallet1.movingUp = false;});
        this.new_line();
        this.key_triggered_button("P1 Left", ["a"], () => {this.mallet1.movingLeft = true;},
            BUTTON_COLOR, () => {this.mallet1.movingLeft = false;});
        this.key_triggered_button("P1 Down", ["s"], () => {this.mallet1.movingDown = true;},
            BUTTON_COLOR, () => {this.mallet1.movingDown = false;});
        this.key_triggered_button("P1 Right", ["d"], () => {this.mallet1.movingRight = true;},
            BUTTON_COLOR, () => {this.mallet1.movingRight = false;});
        this.new_line();
        this.new_line();
        this.key_triggered_button("P2 Up", ["ArrowUp"], () => {this.mallet2.movingUp = true;},
            BUTTON_COLOR, () => {this.mallet2.movingUp = false;});
        this.new_line();
        this.key_triggered_button("P2 Left", ["ArrowLeft"], () => {this.mallet2.movingLeft = true;},
            BUTTON_COLOR, () => {this.mallet2.movingLeft = false;});
        this.key_triggered_button("P2 Down", ["ArrowDown"], () => {this.mallet2.movingDown = true;},
            BUTTON_COLOR, () => {this.mallet2.movingDown = false;});
        this.key_triggered_button("P2 Right", ["ArrowRight"], () => {this.mallet2.movingRight = true;},
            BUTTON_COLOR, () => {this.mallet2.movingRight = false});
        this.new_line();
        this.new_line();
        this.key_triggered_button("Reset", ["x"], () => {this.reset();});
        this.key_triggered_button("Play BGM", ["b"], () => {this.playMusic();});
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // Lighting
        const light1_position = vec4(0, 0, -5, 0);
        const light2_position = vec4(0, 0, 5, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light1_position, color(1, 1, 1, 1), 1000), 
                                new Light(light2_position, color(1, 1, 1, 1), 1000),
                                ];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();


        /*=== OUR CODE STARTS HERE ===========================================*/

        /*=== Draw models ====================================================*/
        // Draw puck
        model_transform = model_transform
            .times(Mat4.translation(this.puck.position[0], this.puck.position[1], this.puck.position[2]));
        this.drawPuck(context, program_state, model_transform, this.puck.radius, this.puck.angle);
        model_transform = Mat4.identity();

        // Draw mallet 1
        model_transform = model_transform
            .times(Mat4.translation(this.mallet1.position[0], this.mallet1.position[1], this.mallet1.position[2]));
        this.drawMallet(context, program_state, model_transform, this.mallet1.radius);
        model_transform = Mat4.identity();

        // Draw mallet 2
        model_transform = model_transform
            .times(Mat4.translation(this.mallet2.position[0], this.mallet2.position[1], this.mallet2.position[2]));
        this.drawMallet(context, program_state, model_transform, this.mallet2.radius);
        model_transform = Mat4.identity();

        // Draw table
        model_transform = model_transform
            .times(Mat4.translation(0, 0, -config.TABLE_HEIGHT / 2))
            .times(Mat4.scale(config.RIGHT_BOUND + config.RAIL_WIDTH, config.UPPER_BOUND + config.RAIL_WIDTH, config.TABLE_HEIGHT / 2));
        this.drawTable(context, program_state, model_transform);
        model_transform = Mat4.identity();

        // Draw floor
        model_transform = model_transform
            .times(Mat4.translation(0, 0, -config.TABLE_HEIGHT))
            .times(Mat4.scale(256, 256, 1));
        this.shapes.floor.draw(context, program_state, model_transform, this.materials.floor);
        model_transform = Mat4.identity();

        //determine numbers printed
        let player1Score=this.materials.zero;
        switch(this.scoreL){
            case 1:
                player1Score=this.materials.one;
                break;
            case 2:
                player1Score=this.materials.two;
                break;
            case 3:
                player1Score=this.materials.three;
                break;
            case 4:
                player1Score=this.materials.four;
                break;
            case 5:
                player1Score=this.materials.five;
                break;
            case 6:
                player1Score=this.materials.six;
                break;
            case 7:
                this.reset();
                this.winGame.play();
                break;
        }

        //print score
        model_transform = model_transform
            .times(Mat4.translation(-70, 0, -0.95))
            .times(Mat4.scale(10, 10, 1));
        this.shapes.cube.draw(context, program_state, model_transform, player1Score);
        model_transform = Mat4.identity();

        let player2Score=this.materials.zero;
        switch(this.scoreR){
            case 1:
                player2Score=this.materials.one;
                break;
            case 2:
                player2Score=this.materials.two;
                break;
            case 3:
                player2Score=this.materials.three;
                break;
            case 4:
                player2Score=this.materials.four;
                break;
            case 5:
                player2Score=this.materials.five;
                break;
            case 6:
                player2Score=this.materials.six;
                break;
            case 7:
                this.reset();
                this.winGame.play();
                break;
        }

        model_transform = model_transform
            .times(Mat4.translation(70, 0, -0.95))
            .times(Mat4.scale(10, 10, 1));
        this.shapes.cube.draw(context, program_state, model_transform, player2Score);
        model_transform = Mat4.identity();

        /*=== Collision detection (this only affects the puck) ===============*/
        // puck and mallet1
        if (this.puck.position.minus(this.mallet1.position).norm() < this.mallet1.radius + this.puck.radius) {
            if (!this.puckInsideMallet1) { // If the puck was not inside mallet 1 last frame
                this.puckInsideMallet1 = true;
                this.puck.elastic_collision(this.mallet1);
            }
        } else {
            this.puckInsideMallet1 = false;
        }
        // puck and mallet2
        if (this.puck.position.minus(this.mallet2.position).norm() < this.mallet2.radius + this.puck.radius) {
            if (!this.puckInsideMallet2) { // If the puck was not inside mallet 2 last frame
                this.puckInsideMallet2 = true;
                this.puck.elastic_collision(this.mallet2);
            }
        } else {
            this.puckInsideMallet2 = false;
        }
        // upper wall and lower wall
        if (this.puck.position[1] + this.puck.radius > config.UPPER_BOUND
            || this.puck.position[1] - this.puck.radius < config.LOWER_BOUND) {
            if (!this.puckInsideVertWall) { // If the puck was not inside the wall last frame
                this.puckInsideVertWall = true;
                this.puck.calculateSpin(
                    this.puck.velocity,
                    this.puck.position[1] > 0 ? vec3(0, 1, 0) : vec3(0, -1, 0),
                    Math.abs(this.puck.velocity[1] * 2),
                    false);
                this.puck.velocity[1] = -this.puck.velocity[1] * config.PUCK_ELASTICITY;
            }
        } else {
            this.puckInsideVertWall = false;
        }
        // left wall and right wall
        if ((this.puck.position[1] > (config.GOAL_SIZE / 2)
            || this.puck.position[1] < -(config.GOAL_SIZE / 2))
            && (this.puck.position[0] + this.puck.radius > config.RIGHT_BOUND
            || this.puck.position[0] - this.puck.radius < config.LEFT_BOUND)) {
            if (!this.puckInsideHorizWall) { // If the puck was not inside the wall last frame
                this.puckInsideHorizWall = true;
                this.puck.calculateSpin(
                    this.puck.velocity,
                    this.puck.position[0] > 0 ? vec3(1, 0, 0) : vec3(-1, 0, 0),
                    Math.abs(this.puck.velocity[0] * 2),
                    false);
                this.puck.velocity[0] = -this.puck.velocity[0] * config.PUCK_ELASTICITY;
            }
        } else {
            this.puckInsideHorizWall = false;
        }

        /*=== Goal detection =================================================*/
        let p1Scored = false, p2Scored = false;
        if (this.puck.position[0] < (config.LEFT_BOUND - this.puck.radius)){
            p2Scored = true;
            this.scoreR += 1;
            console.log("P1 Scored: " + this.scoreL + " " + "P2 Scored: " + this.scoreR)
            this.puck.position = config.PUCK_INIT_POS_P1.copy(); // Give the puck to player 1
        }
        if(this.puck.position[0] > (config.RIGHT_BOUND + this.puck.radius)){
            p1Scored = true;
            this.scoreL += 1;
            console.log("P1 Scored: " + this.scoreL + " " + "P2 Scored: " + this.scoreR);
            this.puck.position = config.PUCK_INIT_POS_P2.copy(); // Give the puck to player 2
        }
        if (p1Scored || p2Scored) {
            this.playSound(this.winRound);
            this.puck.velocity = vec3(0, 0, 0);
            this.puck.angle = 0;
            this.puck.spin = 0;
            this.mallet1.position = config.MALLET1_INIT_POS.copy();
            this.mallet2.position = config.MALLET2_INIT_POS.copy();
        }

        /*=== Update moving objects ==========================================*/
        this.mallet1.update(dt);
        this.mallet2.update(dt);
        this.puck.update(dt);
    }

    drawPuck(context, program_state, model_transform, radius, angle) {
        const PUCK_RADIUS = radius, PUCK_HEIGHT = 1;
        const Z_OFFSET = PUCK_HEIGHT / 2; // Offset so the puck's bottom is at the origin
                                          // This makes it easier to position the puck on the table
        const puck_transform = model_transform
            .times(Mat4.translation(0, 0, Z_OFFSET))
            .times(Mat4.rotation(angle, 0, 0, 1))
            .times(Mat4.scale(PUCK_RADIUS, PUCK_RADIUS, PUCK_HEIGHT));
        this.shapes.puck.draw(context, program_state, puck_transform, this.materials.puck);

        // Draw bar on top (to see the puck's spin)
        const BAR_LENGTH = PUCK_RADIUS * 0.9, BAR_WIDTH = BAR_LENGTH * 0.2;
        const bar_transform = model_transform
            .times(Mat4.translation(0, 0, Z_OFFSET))
            .times(Mat4.rotation(angle, 0, 0, 1))
            .times(Mat4.scale(BAR_LENGTH, BAR_WIDTH, BAR_WIDTH));
        this.shapes.cube.draw(context, program_state, bar_transform,
            this.materials.test.override({ambient: 1, color: hex_color("#600000")}));
    }

    drawMallet(context, program_state, model_transform, radius) {
        // Draw base
        const BASE_RADIUS = radius, BASE_HEIGHT = 3;
        const Z_OFFSET = BASE_HEIGHT / 2; // Offset so the mallet's bottom is at the origin
                                          // This makes it easier to position the mallet on the table
        let base_transform = model_transform
            .times(Mat4.translation(0, 0, Z_OFFSET))
            .times(Mat4.scale(BASE_RADIUS, BASE_RADIUS, BASE_HEIGHT));
        this.shapes.cylinder.draw(context, program_state, base_transform, this.materials.mallet);

        // Draw stick shaft
        const SHAFT_RADIUS = BASE_RADIUS / 2, SHAFT_HEIGHT = 4;
        let shaft_transform = model_transform
            .times(Mat4.translation(0, 0, Z_OFFSET))
            .times(Mat4.translation(0, 0, BASE_HEIGHT/2 + SHAFT_HEIGHT/2)) // Move to top of base
            .times(Mat4.scale(SHAFT_RADIUS, SHAFT_RADIUS, SHAFT_HEIGHT));
        this.shapes.cylinder.draw(context, program_state, shaft_transform, this.materials.mallet);

        // Draw stick head
        let head_transform = model_transform
            .times(Mat4.translation(0, 0, Z_OFFSET))
            .times(Mat4.translation(0, 0, BASE_HEIGHT/2 + SHAFT_HEIGHT)) // Move to top of shaft
            .times(Mat4.scale(SHAFT_RADIUS, SHAFT_RADIUS, SHAFT_RADIUS));
        this.shapes.sphere.draw(context, program_state, head_transform, this.materials.mallet);
    }

    drawTable(context, program_state, model_transform) {

        // Draw table
        this.shapes.table.draw(context, program_state, model_transform, this.materials.table);

        // Draw rails
        model_transform = Mat4.identity();
        const RAIL_HEIGHT = config.RAIL_HEIGHT;
        const RAIL_WIDTH = config.RAIL_WIDTH;
        // Upper rail
        let upper_rail_transform = model_transform
            .times(Mat4.translation(0, config.UPPER_BOUND + RAIL_WIDTH / 2, RAIL_HEIGHT / 2))
            .times(Mat4.scale(config.RIGHT_BOUND + RAIL_WIDTH, RAIL_WIDTH / 2, RAIL_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, upper_rail_transform, this.materials.rail);
        // Lower rail
        let lower_rail_transform = model_transform
            .times(Mat4.translation(0, config.LOWER_BOUND - RAIL_WIDTH / 2, RAIL_HEIGHT / 2))
            .times(Mat4.scale(config.RIGHT_BOUND + RAIL_WIDTH, RAIL_WIDTH / 2, RAIL_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, lower_rail_transform, this.materials.rail);
        // Left rail
        const GOAL_SIZE = config.GOAL_SIZE;
        const SIDE_RAIL_LENGTH = (config.UPPER_BOUND - config.LOWER_BOUND - GOAL_SIZE) / 2;
        let upper_left_transform = model_transform
            .times(Mat4.translation(config.LEFT_BOUND - RAIL_WIDTH / 2, config.UPPER_BOUND - SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2))
            .times(Mat4.scale(RAIL_WIDTH / 2, SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, upper_left_transform, this.materials.rail);
        let lower_left_transform = model_transform
            .times(Mat4.translation(config.LEFT_BOUND - RAIL_WIDTH / 2, config.LOWER_BOUND + SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2))
            .times(Mat4.scale(RAIL_WIDTH / 2, SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, lower_left_transform, this.materials.rail);
        // Right rail
        let upper_right_transform = model_transform
            .times(Mat4.translation(config.RIGHT_BOUND + RAIL_WIDTH / 2, config.UPPER_BOUND - SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2))
            .times(Mat4.scale(RAIL_WIDTH / 2, SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, upper_right_transform, this.materials.rail);
        let lower_right_transform = model_transform
            .times(Mat4.translation(config.RIGHT_BOUND + RAIL_WIDTH / 2, config.LOWER_BOUND + SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2))
            .times(Mat4.scale(RAIL_WIDTH / 2, SIDE_RAIL_LENGTH / 2, RAIL_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, lower_right_transform, this.materials.rail);

        // Draw goal posts
        const GOAL_POST_LENGTH = config.GOAL_POST_LENGTH;
        const GOAL_POST_HEIGHT = config.GOAL_POST_HEIGHT;
        const GOAL_HEIGHT = config.RAIL_HEIGHT;
        // Left post
        let left_goal_post = model_transform
            .times(Mat4.translation(config.LEFT_BOUND - RAIL_WIDTH / 2, 0, GOAL_POST_HEIGHT / 2 + GOAL_HEIGHT))
            .times(Mat4.scale(RAIL_WIDTH / 2, GOAL_POST_LENGTH / 2, GOAL_POST_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, left_goal_post, this.materials.rail);
        // Right post
        let right_goal_post = model_transform
            .times(Mat4.translation(config.RIGHT_BOUND + RAIL_WIDTH / 2, 0, GOAL_POST_HEIGHT / 2 + GOAL_HEIGHT))
            .times(Mat4.scale(RAIL_WIDTH / 2, GOAL_POST_LENGTH / 2, GOAL_POST_HEIGHT / 2));
        this.shapes.rail.draw(context, program_state, right_goal_post, this.materials.rail);
    }

    playMusic() {
        this.bgm_flag ^= true;
        if (this.bgm_flag) {
            this.bgm.play();
        }
        else {
            this.bgm.pause();
        }
    }

    playSound(sound) {
        sound.play();
    }
}


class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        varying vec3 vertex_color;
        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                vertex_color =phong_model_lights(normalize(N), vertex_worldspace);
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += vertex_color;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}


