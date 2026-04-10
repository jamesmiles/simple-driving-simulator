import type { GameState, VehicleState, CameraState, Cone, Gate, VehicleConfig, FinishLine } from '../types';
import {
  GAME_WIDTH, MAP_HEIGHT, COURSE_START_Y, COURSE_FINISH_Y,
  CONE_RADIUS, VEHICLE_LENGTH, VEHICLE_COLLISION_RADIUS,
  CAMERA_SMOOTH_SPEED, CAMERA_ANCHOR_Y,
  FINISH_LINE_WIDTH, STARTING_SCORE,
} from './constants';

/**
 * Double-buffered state manager adapted from pb-galaga.
 */
export class StateManager {
  private bufferA: GameState;
  private bufferB: GameState;
  currentState: GameState;
  previousState: GameState;

  constructor() {
    this.bufferA = createInitialState();
    this.bufferB = createInitialState();
    this.currentState = this.bufferA;
    this.previousState = this.bufferB;
  }

  swapBuffers(): void {
    const temp = this.previousState;
    this.previousState = this.currentState;
    this.currentState = temp;
    copyStateInto(this.currentState, this.previousState);
  }

  reset(): void {
    this.bufferA = createInitialState();
    this.bufferB = createInitialState();
    this.currentState = this.bufferA;
    this.previousState = this.bufferB;
  }
}

function createDefaultConfig(): VehicleConfig {
  return {
    power: 5,
    weight: 5,
    turningCircle: 5,
  };
}

function createDefaultVehicle(): VehicleState {
  return {
    position: { x: GAME_WIDTH / 2, y: COURSE_START_Y },
    velocity: { x: 0, y: 0 },
    heading: Math.PI / 2,  // Facing north
    speed: 0,
    throttle: 0,
    brake: 0,
    steering: 0,
  };
}

function createCones(): Cone[] {
  const cones: Cone[] = [];
  let id = 0;
  const centerX = GAME_WIDTH / 2;
  const coneSpacing = VEHICLE_LENGTH * 4; // 4 car lengths apart

  // Single central line of slalom cones
  for (let y = COURSE_START_Y - 200; y > COURSE_FINISH_Y; y -= coneSpacing) {
    cones.push({
      id: id++,
      position: { x: centerX, y },
      hit: false,
      radius: CONE_RADIUS,
    });
  }

  return cones;
}

/** Create invisible gate collectibles at the midpoint between each consecutive pair of cones. */
function createGates(cones: Cone[]): Gate[] {
  const gates: Gate[] = [];
  for (let i = 0; i < cones.length - 1; i++) {
    const a = cones[i];
    const b = cones[i + 1];
    gates.push({
      id: i,
      position: {
        x: (a.position.x + b.position.x) / 2,
        y: (a.position.y + b.position.y) / 2,
      },
      collected: false,
      radius: 3,
    });
  }
  return gates;
}

function createCamera(): CameraState {
  return {
    worldX: 0,
    worldY: COURSE_START_Y - CAMERA_ANCHOR_Y,
    targetX: 0,
    targetY: COURSE_START_Y - CAMERA_ANCHOR_Y,
    smoothSpeed: CAMERA_SMOOTH_SPEED,
  };
}

function createFinishLine(): FinishLine {
  return {
    y: COURSE_FINISH_Y,
    width: FINISH_LINE_WIDTH,
    x: (GAME_WIDTH - FINISH_LINE_WIDTH) / 2,
  };
}

export function createInitialState(): GameState {
  const cones = createCones();
  return {
    currentTime: 0,
    deltaTime: 0,
    gameStatus: 'playing',
    vehicle: createDefaultVehicle(),
    config: createDefaultConfig(),
    cones,
    gates: createGates(cones),
    camera: createCamera(),
    score: STARTING_SCORE,
    conesHit: 0,
    finishLine: createFinishLine(),
    courseComplete: false,
  };
}

function copyStateInto(target: GameState, source: GameState): void {
  target.currentTime = source.currentTime;
  target.deltaTime = source.deltaTime;
  target.gameStatus = source.gameStatus;
  target.vehicle = source.vehicle;
  target.config = source.config;
  target.cones = source.cones;
  target.gates = source.gates;
  target.camera = source.camera;
  target.score = source.score;
  target.conesHit = source.conesHit;
  target.finishLine = source.finishLine;
  target.courseComplete = source.courseComplete;
}
