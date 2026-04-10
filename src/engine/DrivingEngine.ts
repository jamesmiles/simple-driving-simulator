import type { GameState } from '../types';
import { InputHandler } from './InputHandler';
import { updateCamera } from './CameraManager';
import { SoundManager } from '../audio/SoundManager';
import {
  BASE_ACCELERATION, BASE_BRAKE_DECEL, BASE_TURN_SPEED,
  MAX_SPEED_PER_THROTTLE, ENGINE_FRICTION,
  VEHICLE_COLLISION_RADIUS, CONE_PENALTY, CONE_PASS_BONUS,
  MAP_WIDTH, MAP_HEIGHT, ROAD_LEFT, ROAD_RIGHT,
} from './constants';

/**
 * Core driving physics engine.
 * Decoupled from rendering following pb-galaga's EpisodeEngine pattern.
 */
export class DrivingEngine {
  private input: InputHandler;

  constructor(input: InputHandler) {
    this.input = input;
  }

  update(state: GameState, dtSeconds: number): void {
    if (state.courseComplete || state.gameStatus === 'crashed') return;

    state.currentTime += dtSeconds * 1000;
    state.deltaTime = dtSeconds;

    this.processInput(state);
    this.updateVehiclePhysics(state, dtSeconds);
    if (this.checkOffRoad(state)) return;
    this.checkConeCollisions(state);
    this.checkGateCollection(state);
    this.checkFinishLine(state);
    updateCamera(state.camera, state.vehicle, dtSeconds);
  }

  private processInput(state: GameState): void {
    const v = state.vehicle;

    // Throttle: = to increase, - to decrease (consumed on press)
    if (this.input.wasJustPressed('Equal')) {
      v.throttle = Math.min(10, v.throttle + 1);
    }
    if (this.input.wasJustPressed('Minus')) {
      v.throttle = Math.max(0, v.throttle - 1);
    }

    // Brake: A to increase, Z to decrease (consumed on press)
    if (this.input.wasJustPressed('KeyA')) {
      v.brake = Math.min(5, v.brake + 1);
    }
    if (this.input.wasJustPressed('KeyZ')) {
      v.brake = Math.max(0, v.brake - 1);
    }

    // Steering: left/right tap to adjust angle (consumed on press)
    if (this.input.wasJustPressed('ArrowLeft')) {
      v.steering = Math.max(-10, v.steering - 1);
    }
    if (this.input.wasJustPressed('ArrowRight')) {
      v.steering = Math.min(10, v.steering + 1);
    }
  }

  private updateVehiclePhysics(state: GameState, dt: number): void {
    const v = state.vehicle;
    const cfg = state.config;

    // Target speed from throttle
    const targetSpeed = v.throttle * MAX_SPEED_PER_THROTTLE;

    // Acceleration from power config
    const accel = cfg.power * BASE_ACCELERATION * dt;

    // Apply throttle acceleration
    if (v.speed < targetSpeed) {
      v.speed = Math.min(targetSpeed, v.speed + accel);
    }

    // Natural friction/engine braking when above target speed
    if (v.speed > targetSpeed) {
      v.speed = Math.max(targetSpeed, v.speed - ENGINE_FRICTION * dt);
    }

    // Apply braking (affected by weight — heavier = less effective braking)
    if (v.brake > 0) {
      const brakeForce = v.brake * BASE_BRAKE_DECEL / (cfg.weight * 0.3 + 0.7);
      v.speed = Math.max(0, v.speed - brakeForce * dt);
    }

    // Steering rotation (only when moving)
    if (v.speed > 0.5) {
      const turnEffectiveness = Math.min(1, v.speed / 50);  // Less turn at very low speed
      const turnRate = v.steering * BASE_TURN_SPEED * cfg.turningCircle * 0.1 * turnEffectiveness;
      v.heading -= turnRate * dt;
    }

    // Update position from heading + speed
    // heading: PI/2 = north = -Y in screen coords
    v.position.x += Math.cos(v.heading) * v.speed * dt;
    v.position.y -= Math.sin(v.heading) * v.speed * dt;

    // Sync velocity for interpolation
    v.velocity.x = Math.cos(v.heading) * v.speed;
    v.velocity.y = -Math.sin(v.heading) * v.speed;

    // Clamp to map bounds
    v.position.x = Math.max(20, Math.min(MAP_WIDTH - 20, v.position.x));
    v.position.y = Math.max(20, Math.min(MAP_HEIGHT - 20, v.position.y));
  }

  private checkOffRoad(state: GameState): boolean {
    const x = state.vehicle.position.x;
    if (x < ROAD_LEFT || x > ROAD_RIGHT) {
      state.gameStatus = 'crashed';
      state.vehicle.speed = 0;
      SoundManager.playError();
      return true;
    }
    return false;
  }

  private checkConeCollisions(state: GameState): void {
    const v = state.vehicle;

    for (const cone of state.cones) {
      if (cone.hit) continue;

      const dx = v.position.x - cone.position.x;
      const dy = v.position.y - cone.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < VEHICLE_COLLISION_RADIUS + cone.radius) {
        cone.hit = true;
        state.conesHit++;
        state.score -= CONE_PENALTY;

        // Void the next uncollected gate
        for (const gate of state.gates) {
          if (!gate.collected) {
            gate.collected = true;
            break;
          }
        }

        SoundManager.playError();
      }
    }
  }

  private checkGateCollection(state: GameState): void {
    const v = state.vehicle;

    for (const gate of state.gates) {
      if (gate.collected) continue;

      const dx = v.position.x - gate.position.x;
      const dy = v.position.y - gate.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < VEHICLE_COLLISION_RADIUS + gate.radius) {
        gate.collected = true;
        state.score += CONE_PASS_BONUS;
        SoundManager.playScore();
      }
    }
  }

  private checkFinishLine(state: GameState): void {
    const v = state.vehicle;
    const fl = state.finishLine;

    if (v.position.y <= fl.y &&
        v.position.x >= fl.x &&
        v.position.x <= fl.x + fl.width) {
      state.courseComplete = true;
      state.gameStatus = 'finished';
    }
  }
}
