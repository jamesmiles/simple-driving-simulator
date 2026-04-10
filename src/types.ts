export interface Vector2D {
  x: number;
  y: number;
}

export interface VehicleConfig {
  power: number;          // 1-10, affects acceleration
  weight: number;         // 1-10, affects braking (higher = more momentum)
  turningCircle: number;  // 1-10, affects steering responsiveness
}

export interface VehicleState {
  position: Vector2D;
  velocity: Vector2D;
  heading: number;        // radians, PI/2 = north
  speed: number;          // current speed in px/s
  throttle: number;       // 0-10
  brake: number;          // 0-5
  steering: number;       // -10 to 10
}

export interface Cone {
  id: number;
  position: Vector2D;
  hit: boolean;
  radius: number;
}

export interface CameraState {
  worldX: number;
  worldY: number;
  targetX: number;
  targetY: number;
  smoothSpeed: number;
}

export interface FinishLine {
  y: number;
  width: number;
  x: number;
}

export interface Gate {
  id: number;
  position: Vector2D;
  collected: boolean;
  radius: number;
}

export interface GameState {
  currentTime: number;
  deltaTime: number;
  gameStatus: 'playing' | 'finished' | 'crashed';
  vehicle: VehicleState;
  config: VehicleConfig;
  cones: Cone[];
  gates: Gate[];
  camera: CameraState;
  score: number;
  conesHit: number;
  finishLine: FinishLine;
  courseComplete: boolean;
}
