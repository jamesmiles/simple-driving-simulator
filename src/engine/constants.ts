// Display
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Physics timestep
export const FIXED_TIMESTEP = 1000 / 60;   // ~16.667ms
export const MAX_ACCUMULATED = 200;          // Spiral-of-death guard

// Map dimensions
export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 4000;

// Vehicle dimensions
export const VEHICLE_LENGTH = 40;
export const VEHICLE_WIDTH = 20;
export const VEHICLE_COLLISION_RADIUS = 16;

// Vehicle physics base values (scaled by config)
export const BASE_ACCELERATION = 80;         // px/s² per power unit
export const BASE_BRAKE_DECEL = 40;          // px/s² per brake level (modified by weight)
export const BASE_TURN_SPEED = 0.2;          // rad/s per steering unit per turning circle unit
export const MAX_SPEED_PER_THROTTLE = 15;    // px/s per throttle level
export const ENGINE_FRICTION = 10;           // natural deceleration px/s²

// Cone
export const CONE_RADIUS = 10;
export const CONE_PENALTY = 10;

// Road boundaries
export const ROAD_LEFT = 100;
export const ROAD_RIGHT = 700;

// Camera
export const CAMERA_SMOOTH_SPEED = 3.0;
export const CAMERA_ANCHOR_Y = 450;          // Keep vehicle near bottom of screen
export const CAMERA_ANCHOR_X = GAME_WIDTH / 2;

// Course layout
export const COURSE_START_Y = MAP_HEIGHT - 200;
export const COURSE_FINISH_Y = 400;
export const CONE_SPACING_Y = 150;           // Vertical spacing between slalom cones
export const SLALOM_OFFSET_X = 120;          // Horizontal offset from center for slalom
export const STARTING_SCORE = 0;
export const CONE_PASS_BONUS = 10;

// Finish line
export const FINISH_LINE_WIDTH = 300;
