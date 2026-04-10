import { describe, it, expect } from 'vitest';
import { DrivingEngine } from './DrivingEngine';
import { InputHandler } from './InputHandler';
import { createInitialState } from './StateManager';
import {
  MAX_SPEED_PER_THROTTLE, CONE_PENALTY, CONE_PASS_BONUS, STARTING_SCORE,
  COURSE_START_Y, COURSE_FINISH_Y,
} from './constants';

function createEngine(): { engine: DrivingEngine; input: InputHandler } {
  const input = new InputHandler(true);
  const engine = new DrivingEngine(input);
  return { engine, input };
}

describe('DrivingEngine', () => {
  describe('throttle control', () => {
    it('increases throttle on = key press', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();

      input.injectKeyPress('Equal');
      engine.update(state, 1 / 60);

      expect(state.vehicle.throttle).toBe(1);
    });

    it('decreases throttle on - key press', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.throttle = 5;

      input.injectKeyPress('Minus');
      engine.update(state, 1 / 60);

      expect(state.vehicle.throttle).toBe(4);
    });

    it('clamps throttle to 0-10 range', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();

      // Can't go below 0
      input.injectKeyPress('Minus');
      engine.update(state, 1 / 60);
      expect(state.vehicle.throttle).toBe(0);

      // Set to 10 and try to go above
      state.vehicle.throttle = 10;
      input.injectKeyPress('Equal');
      engine.update(state, 1 / 60);
      expect(state.vehicle.throttle).toBe(10);
    });
  });

  describe('brake control', () => {
    it('increases brake on A key press', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();

      input.injectKeyPress('KeyA');
      engine.update(state, 1 / 60);

      expect(state.vehicle.brake).toBe(1);
    });

    it('decreases brake on Z key press', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.brake = 3;

      input.injectKeyPress('KeyZ');
      engine.update(state, 1 / 60);

      expect(state.vehicle.brake).toBe(2);
    });

    it('clamps brake to 0-5 range', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();

      input.injectKeyPress('KeyZ');
      engine.update(state, 1 / 60);
      expect(state.vehicle.brake).toBe(0);

      state.vehicle.brake = 5;
      input.injectKeyPress('KeyA');
      engine.update(state, 1 / 60);
      expect(state.vehicle.brake).toBe(5);
    });
  });

  describe('steering', () => {
    it('steers left on left arrow tap', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();

      input.injectKeyPress('ArrowLeft');
      engine.update(state, 1 / 60);

      expect(state.vehicle.steering).toBe(-1);
    });

    it('steers right on right arrow tap', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();

      input.injectKeyPress('ArrowRight');
      engine.update(state, 1 / 60);

      expect(state.vehicle.steering).toBe(1);
    });

    it('steering stays at set angle without input', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.steering = 5;

      engine.update(state, 1 / 60);

      expect(state.vehicle.steering).toBe(5);
    });

    it('clamps steering to -10 to 10 range', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.steering = 10;

      input.injectKeyPress('ArrowRight');
      engine.update(state, 1 / 60);

      expect(state.vehicle.steering).toBeLessThanOrEqual(10);
    });
  });

  describe('vehicle physics', () => {
    it('accelerates toward target speed based on throttle', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.throttle = 5;

      for (let i = 0; i < 120; i++) {
        engine.update(state, 1 / 60);
      }

      const targetSpeed = 5 * MAX_SPEED_PER_THROTTLE;
      expect(state.vehicle.speed).toBeCloseTo(targetSpeed, 0);
    });

    it('vehicle moves north when facing north with throttle', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      const startY = state.vehicle.position.y;
      state.vehicle.throttle = 5;

      for (let i = 0; i < 60; i++) {
        engine.update(state, 1 / 60);
      }

      // Moving north = decreasing Y
      expect(state.vehicle.position.y).toBeLessThan(startY);
    });

    it('braking reduces speed', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.speed = 200;
      state.vehicle.throttle = 0;
      state.vehicle.brake = 5;

      engine.update(state, 1 / 60);

      expect(state.vehicle.speed).toBeLessThan(200);
    });

    it('heavier weight makes braking less effective', () => {
      const { engine: engine1, input: input1 } = createEngine();
      const { engine: engine2, input: input2 } = createEngine();

      const lightState = createInitialState();
      lightState.config.weight = 1;
      lightState.vehicle.speed = 200;
      lightState.vehicle.brake = 3;

      const heavyState = createInitialState();
      heavyState.config.weight = 10;
      heavyState.vehicle.speed = 200;
      heavyState.vehicle.brake = 3;

      engine1.update(lightState, 1 / 60);
      engine2.update(heavyState, 1 / 60);

      // Light vehicle should decelerate more (lower speed after braking)
      expect(lightState.vehicle.speed).toBeLessThan(heavyState.vehicle.speed);
    });

    it('higher power increases acceleration', () => {
      const { engine: engine1 } = createEngine();
      const { engine: engine2 } = createEngine();

      const lowPower = createInitialState();
      lowPower.config.power = 1;
      lowPower.vehicle.throttle = 10;

      const highPower = createInitialState();
      highPower.config.power = 10;
      highPower.vehicle.throttle = 10;

      for (let i = 0; i < 30; i++) {
        engine1.update(lowPower, 1 / 60);
        engine2.update(highPower, 1 / 60);
      }

      expect(highPower.vehicle.speed).toBeGreaterThan(lowPower.vehicle.speed);
    });

    it('speed does not exceed target speed for throttle level', () => {
      const { engine } = createEngine();
      const state = createInitialState();
      state.vehicle.throttle = 3;

      for (let i = 0; i < 300; i++) {
        engine.update(state, 1 / 60);
      }

      const targetSpeed = 3 * MAX_SPEED_PER_THROTTLE;
      expect(state.vehicle.speed).toBeLessThanOrEqual(targetSpeed + 0.1);
    });

    it('steering changes heading when moving', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.speed = 100;
      state.vehicle.steering = 5;
      const startHeading = state.vehicle.heading;

      engine.update(state, 1 / 60);

      expect(state.vehicle.heading).not.toBeCloseTo(startHeading, 3);
    });

    it('steering has no effect when stationary', () => {
      const { engine, input } = createEngine();
      const state = createInitialState();
      state.vehicle.speed = 0;
      state.vehicle.steering = 10;
      const startHeading = state.vehicle.heading;

      engine.update(state, 1 / 60);

      expect(state.vehicle.heading).toBeCloseTo(startHeading);
    });

    it('clamps vehicle position to map bounds', () => {
      const { engine } = createEngine();
      const state = createInitialState();
      state.vehicle.position.x = -100;
      state.vehicle.position.y = -100;

      engine.update(state, 1 / 60);

      expect(state.vehicle.position.x).toBeGreaterThanOrEqual(20);
      expect(state.vehicle.position.y).toBeGreaterThanOrEqual(20);
    });
  });

  describe('cone collisions', () => {
    it('detects collision with cone and marks it hit', () => {
      const { engine } = createEngine();
      const state = createInitialState();

      // Place vehicle directly on a cone
      const cone = state.cones[0];
      state.vehicle.position.x = cone.position.x;
      state.vehicle.position.y = cone.position.y;

      engine.update(state, 1 / 60);

      expect(cone.hit).toBe(true);
      expect(state.conesHit).toBe(1);
    });

    it('deducts score when cone is hit', () => {
      const { engine } = createEngine();
      const state = createInitialState();

      const cone = state.cones[0];
      state.vehicle.position.x = cone.position.x;
      state.vehicle.position.y = cone.position.y;

      engine.update(state, 1 / 60);

      expect(state.score).toBe(STARTING_SCORE - CONE_PENALTY);
    });

    it('does not re-penalize already-hit cones', () => {
      const { engine } = createEngine();
      const state = createInitialState();

      const cone = state.cones[0];
      cone.hit = true;
      state.conesHit = 1;
      state.score = STARTING_SCORE - CONE_PENALTY;

      state.vehicle.position.x = cone.position.x;
      state.vehicle.position.y = cone.position.y;

      engine.update(state, 1 / 60);

      expect(state.conesHit).toBe(1); // no change
      expect(state.score).toBe(STARTING_SCORE - CONE_PENALTY);
    });

    it('score can go negative from cone hits', () => {
      const { engine } = createEngine();
      const state = createInitialState();
      state.score = 5;

      const cone = state.cones[0];
      state.vehicle.position.x = cone.position.x;
      state.vehicle.position.y = cone.position.y;

      engine.update(state, 1 / 60);

      expect(state.score).toBe(5 - CONE_PENALTY);
    });
  });

  describe('finish line', () => {
    it('completes course when vehicle crosses finish line', () => {
      const { engine } = createEngine();
      const state = createInitialState();

      // Move vehicle to finish line
      state.vehicle.position.y = state.finishLine.y - 1;
      state.vehicle.position.x = state.finishLine.x + state.finishLine.width / 2;

      engine.update(state, 1 / 60);

      expect(state.courseComplete).toBe(true);
      expect(state.gameStatus).toBe('finished');
    });

    it('does not complete if vehicle is beside finish line', () => {
      const { engine } = createEngine();
      const state = createInitialState();

      state.vehicle.position.y = state.finishLine.y - 1;
      state.vehicle.position.x = state.finishLine.x - 50; // Off to the side

      engine.update(state, 1 / 60);

      expect(state.courseComplete).toBe(false);
    });

    it('stops updating once course is complete', () => {
      const { engine } = createEngine();
      const state = createInitialState();
      state.courseComplete = true;
      state.vehicle.throttle = 10;
      state.vehicle.speed = 100;
      const posY = state.vehicle.position.y;

      engine.update(state, 1 / 60);

      // Position should not change
      expect(state.vehicle.position.y).toBe(posY);
    });
  });

  describe('gate collection', () => {
    it('awards points when vehicle passes through a gate', () => {
      const { engine } = createEngine();
      const state = createInitialState();

      const gate = state.gates[0];
      state.vehicle.position.x = gate.position.x;
      state.vehicle.position.y = gate.position.y;

      engine.update(state, 1 / 60);

      expect(gate.collected).toBe(true);
      expect(state.score).toBe(STARTING_SCORE + CONE_PASS_BONUS);
    });

    it('does not re-award already collected gates', () => {
      const { engine } = createEngine();
      const state = createInitialState();

      const gate = state.gates[0];
      gate.collected = true;
      state.score = 10;

      state.vehicle.position.x = gate.position.x;
      state.vehicle.position.y = gate.position.y;

      engine.update(state, 1 / 60);

      expect(state.score).toBe(10);
    });

    it('gates exist between consecutive cones', () => {
      const state = createInitialState();
      expect(state.gates.length).toBe(state.cones.length - 1);

      // Each gate is at midpoint between two cones
      for (let i = 0; i < state.gates.length; i++) {
        const midY = (state.cones[i].position.y + state.cones[i + 1].position.y) / 2;
        expect(state.gates[i].position.y).toBeCloseTo(midY);
      }
    });
  });
});
