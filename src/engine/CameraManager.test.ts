import { describe, it, expect } from 'vitest';
import { updateCamera, worldToScreen, isInViewport } from './CameraManager';
import type { CameraState, VehicleState } from '../types';
import { CAMERA_ANCHOR_Y, CAMERA_ANCHOR_X, CAMERA_SMOOTH_SPEED, GAME_HEIGHT } from './constants';

function makeCamera(worldY: number = 3000, worldX: number = 0): CameraState {
  return {
    worldY,
    targetY: worldY,
    worldX,
    targetX: worldX,
    smoothSpeed: CAMERA_SMOOTH_SPEED,
  };
}

function makeVehicle(x: number, y: number): VehicleState {
  return {
    position: { x, y },
    velocity: { x: 0, y: 0 },
    heading: Math.PI / 2,
    speed: 0,
    throttle: 0,
    brake: 0,
    steering: 0,
  };
}

describe('CameraManager', () => {
  describe('updateCamera', () => {
    it('sets targetY based on vehicle position and anchor', () => {
      const cam = makeCamera(3000);
      const vehicle = makeVehicle(400, 3500);
      updateCamera(cam, vehicle, 1 / 60);

      expect(cam.targetY).toBe(3500 - CAMERA_ANCHOR_Y);
    });

    it('follows vehicle northward (decreasing Y)', () => {
      const cam = makeCamera(3000);
      const vehicle = makeVehicle(400, 2800);
      updateCamera(cam, vehicle, 1 / 60);

      expect(cam.worldY).toBeLessThan(3000);
    });

    it('follows vehicle southward (increasing Y)', () => {
      const cam = makeCamera(3000);
      const vehicle = makeVehicle(400, 3600);
      updateCamera(cam, vehicle, 1 / 60);

      expect(cam.worldY).toBeGreaterThan(3000);
    });

    it('clamps worldY to 0 minimum', () => {
      const cam = makeCamera(10);
      const vehicle = makeVehicle(400, 100);
      for (let i = 0; i < 300; i++) {
        updateCamera(cam, vehicle, 1 / 60);
      }
      expect(cam.worldY).toBeGreaterThanOrEqual(0);
    });

    it('centers horizontally on vehicle', () => {
      const cam = makeCamera(3000, 0);
      const vehicle = makeVehicle(600, 3500);
      updateCamera(cam, vehicle, 1 / 60);

      expect(cam.targetX).toBe(600 - CAMERA_ANCHOR_X);
    });

    it('converges on target over many frames', () => {
      const cam = makeCamera(3000, 0);
      const vehicle = makeVehicle(400, 2000);

      for (let i = 0; i < 300; i++) {
        updateCamera(cam, vehicle, 1 / 60);
      }

      expect(cam.worldY).toBeCloseTo(2000 - CAMERA_ANCHOR_Y, 0);
    });
  });

  describe('worldToScreen', () => {
    it('offsets both X and Y by camera position', () => {
      const cam = makeCamera(3000, 100);
      const screen = worldToScreen({ x: 500, y: 3400 }, cam);
      expect(screen.x).toBe(400);
      expect(screen.y).toBe(400);
    });

    it('returns world position when camera is at origin', () => {
      const cam = makeCamera(0, 0);
      const screen = worldToScreen({ x: 300, y: 500 }, cam);
      expect(screen.x).toBe(300);
      expect(screen.y).toBe(500);
    });
  });

  describe('isInViewport', () => {
    it('returns true for Y within viewport', () => {
      const cam = makeCamera(3000);
      expect(isInViewport(3300, cam)).toBe(true);
    });

    it('returns false for Y far above viewport', () => {
      const cam = makeCamera(3000);
      expect(isInViewport(2800, cam)).toBe(false);
    });

    it('returns true within margin', () => {
      const cam = makeCamera(3000);
      // screenY = 2950 - 3000 = -50, within default margin 100
      expect(isInViewport(2950, cam, 100)).toBe(true);
    });
  });
});
