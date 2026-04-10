import { describe, it, expect } from 'vitest';
import { GameManager } from './GameManager';
import { STARTING_SCORE, COURSE_START_Y } from './constants';

describe('GameManager', () => {
  describe('construction', () => {
    it('creates in headless mode', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().gameStatus).toBe('playing');
      gm.destroy();
    });

    it('starts with a vehicle at course start', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().vehicle.position.y).toBe(COURSE_START_Y);
      gm.destroy();
    });

    it('starts with full score', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().score).toBe(STARTING_SCORE);
      gm.destroy();
    });
  });

  describe('headless ticking', () => {
    it('advances time correctly', () => {
      const gm = new GameManager({ headless: true });
      gm.tickHeadless(60);
      expect(gm.getState().currentTime).toBeGreaterThan(900);
      expect(gm.getState().currentTime).toBeLessThan(1100);
      gm.destroy();
    });

    it('swap occurs before mutations (previousState != currentState after tick)', () => {
      const gm = new GameManager({ headless: true });
      gm.tickHeadless(1);

      const current = gm.getState();
      const previous = gm.getPreviousState();
      expect(current.currentTime).toBeGreaterThan(previous.currentTime);
      gm.destroy();
    });
  });

  describe('throttle and driving', () => {
    it('vehicle accelerates when throttle is applied', () => {
      const gm = new GameManager({ headless: true });

      gm.inputHandler.injectKeyPress('Equal'); // throttle 1
      gm.tickHeadless(1);

      expect(gm.getState().vehicle.throttle).toBe(1);

      // Run more frames to build speed
      gm.tickHeadless(60);
      expect(gm.getState().vehicle.speed).toBeGreaterThan(0);
      gm.destroy();
    });

    it('vehicle moves north with throttle', () => {
      const gm = new GameManager({ headless: true });
      const startY = gm.getState().vehicle.position.y;

      // Set throttle to 5
      for (let i = 0; i < 5; i++) {
        gm.inputHandler.injectKeyPress('Equal');
        gm.tickHeadless(1);
      }

      // Run for a few seconds
      gm.tickHeadless(120);

      expect(gm.getState().vehicle.position.y).toBeLessThan(startY);
      gm.destroy();
    });
  });

  describe('restart', () => {
    it('resets state when R is pressed', () => {
      const gm = new GameManager({ headless: true });

      // Drive forward a bit
      gm.inputHandler.injectKeyPress('Equal');
      gm.tickHeadless(60);

      const movedY = gm.getState().vehicle.position.y;
      expect(movedY).toBeLessThan(COURSE_START_Y);

      // Press R to restart
      gm.inputHandler.injectKeyPress('KeyR');
      gm.tickHeadless(1);

      expect(gm.getState().vehicle.position.y).toBe(COURSE_START_Y);
      expect(gm.getState().score).toBe(STARTING_SCORE);
      gm.destroy();
    });
  });

  describe('course completion', () => {
    it('marks course complete when vehicle reaches finish', () => {
      const gm = new GameManager({ headless: true });
      const state = gm.getState();

      // Teleport vehicle to finish line
      state.vehicle.position.y = state.finishLine.y - 1;
      state.vehicle.position.x = state.finishLine.x + state.finishLine.width / 2;

      gm.tickHeadless(1);

      expect(gm.getState().courseComplete).toBe(true);
      expect(gm.getState().gameStatus).toBe('finished');
      gm.destroy();
    });
  });
});
