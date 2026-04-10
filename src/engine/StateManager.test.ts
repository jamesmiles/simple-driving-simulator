import { describe, it, expect } from 'vitest';
import { StateManager, createInitialState } from './StateManager';
import { COURSE_START_Y, GAME_WIDTH, STARTING_SCORE } from './constants';

describe('StateManager', () => {
  describe('construction', () => {
    it('initializes with two distinct buffer objects', () => {
      const sm = new StateManager();
      expect(sm.currentState).not.toBe(sm.previousState);
    });

    it('initializes both buffers in playing status', () => {
      const sm = new StateManager();
      expect(sm.currentState.gameStatus).toBe('playing');
      expect(sm.previousState.gameStatus).toBe('playing');
    });
  });

  describe('swapBuffers', () => {
    it('swaps the pointer references', () => {
      const sm = new StateManager();
      const originalCurrent = sm.currentState;
      const originalPrevious = sm.previousState;

      sm.swapBuffers();

      expect(sm.previousState).toBe(originalCurrent);
      expect(sm.currentState).toBe(originalPrevious);
    });

    it('copies previous state values into current after swap', () => {
      const sm = new StateManager();
      sm.currentState.currentTime = 1000;
      sm.currentState.score = 50;

      sm.swapBuffers();

      expect(sm.previousState.currentTime).toBe(1000);
      expect(sm.currentState.currentTime).toBe(1000);
      expect(sm.currentState.score).toBe(50);
    });

    it('is O(1) — no deep copy', () => {
      const sm = new StateManager();

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        sm.swapBuffers();
      }
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(50);
    });

    it('allows mutations on currentState without affecting previousState (primitives)', () => {
      const sm = new StateManager();
      sm.currentState.currentTime = 500;

      sm.swapBuffers();
      sm.currentState.currentTime = 600;

      expect(sm.previousState.currentTime).toBe(500);
    });

    it('shares array references after swap (by design)', () => {
      const sm = new StateManager();
      sm.swapBuffers();
      expect(sm.currentState.cones).toBe(sm.previousState.cones);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      const sm = new StateManager();
      sm.currentState.score = 10;
      sm.currentState.conesHit = 5;
      sm.currentState.courseComplete = true;

      sm.reset();

      expect(sm.currentState.score).toBe(STARTING_SCORE);
      expect(sm.currentState.conesHit).toBe(0);
      expect(sm.currentState.courseComplete).toBe(false);
    });
  });
});

describe('createInitialState', () => {
  it('creates vehicle at course start facing north', () => {
    const state = createInitialState();
    expect(state.vehicle.position.x).toBe(GAME_WIDTH / 2);
    expect(state.vehicle.position.y).toBe(COURSE_START_Y);
    expect(state.vehicle.heading).toBeCloseTo(Math.PI / 2);
  });

  it('creates vehicle with zero speed and controls', () => {
    const state = createInitialState();
    expect(state.vehicle.speed).toBe(0);
    expect(state.vehicle.throttle).toBe(0);
    expect(state.vehicle.brake).toBe(0);
    expect(state.vehicle.steering).toBe(0);
  });

  it('creates cones that are not hit', () => {
    const state = createInitialState();
    expect(state.cones.length).toBeGreaterThan(0);
    for (const cone of state.cones) {
      expect(cone.hit).toBe(false);
    }
  });

  it('creates a finish line', () => {
    const state = createInitialState();
    expect(state.finishLine.y).toBeGreaterThan(0);
    expect(state.finishLine.width).toBeGreaterThan(0);
  });

  it('starts with full score', () => {
    const state = createInitialState();
    expect(state.score).toBe(STARTING_SCORE);
    expect(state.conesHit).toBe(0);
  });

  it('starts with default config values', () => {
    const state = createInitialState();
    expect(state.config.power).toBe(5);
    expect(state.config.weight).toBe(5);
    expect(state.config.turningCircle).toBe(5);
  });
});
