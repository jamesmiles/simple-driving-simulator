import type { CameraState, VehicleState, Vector2D } from '../types';
import { CAMERA_ANCHOR_Y, CAMERA_ANCHOR_X, GAME_WIDTH, GAME_HEIGHT } from './constants';

/**
 * Camera tracking adapted from pb-galaga Episode 2.
 * Follows the vehicle with smooth lerp.
 */
export function updateCamera(
  camera: CameraState,
  vehicle: VehicleState,
  dtSeconds: number,
): void {
  // Vertical: keep vehicle anchored near bottom
  camera.targetY = vehicle.position.y - CAMERA_ANCHOR_Y;

  // Smooth lerp
  camera.worldY += (camera.targetY - camera.worldY) * camera.smoothSpeed * dtSeconds;

  // Horizontal: center on vehicle
  camera.targetX = vehicle.position.x - CAMERA_ANCHOR_X;
  camera.worldX += (camera.targetX - camera.worldX) * camera.smoothSpeed * dtSeconds;

  // Clamp so we don't go past map edges
  if (camera.worldY < 0) camera.worldY = 0;
  if (camera.worldX < 0) camera.worldX = 0;
}

export function worldToScreen(worldPos: Vector2D, camera: CameraState): Vector2D {
  return {
    x: worldPos.x - camera.worldX,
    y: worldPos.y - camera.worldY,
  };
}

export function isInViewport(worldY: number, camera: CameraState, margin: number = 100): boolean {
  const screenY = worldY - camera.worldY;
  return screenY > -margin && screenY < GAME_HEIGHT + margin;
}
