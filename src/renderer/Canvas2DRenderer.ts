import type { GameState, CameraState, Vector2D } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';
import { worldToScreen, isInViewport } from '../engine/CameraManager';
import { drawVehicle } from './drawing/drawVehicle';
import { drawCourse } from './drawing/drawCourse';
import { drawHUD } from './HUD';

/**
 * Canvas 2D renderer — purely visual, no game logic.
 * Adapted from pb-galaga's Canvas2DRenderer.
 */
export class Canvas2DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private engineFps: number = 0;
  private renderFps: number = 0;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container #${containerId} not found`);

    this.canvas = document.createElement('canvas');
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
  }

  setFpsCounters(engine: number, render: number): void {
    this.engineFps = engine;
    this.renderFps = render;
  }

  render(current: GameState, previous: GameState, alpha: number): void {
    const ctx = this.ctx;
    const cam = current.camera;

    // Clear
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw road surface
    this.drawRoad(ctx, cam);

    // Save and translate for world-space drawing
    ctx.save();
    ctx.translate(-cam.worldX, -cam.worldY);

    // Draw course elements (cones, finish line)
    drawCourse(ctx, current);

    // Draw vehicle (interpolated)
    const interpVehicle = interpolateVehicle(current, previous, alpha);
    drawVehicle(ctx, interpVehicle.x, interpVehicle.y, interpVehicle.heading);

    ctx.restore();

    // Screen-space overlays
    if (current.gameStatus === 'crashed') {
      this.drawCrashBanner(ctx, current);
    }

    // HUD (screen space)
    drawHUD(ctx, current, this.engineFps, this.renderFps);
  }

  private drawCrashBanner(ctx: CanvasRenderingContext2D, state: GameState): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 50;

    ctx.fillStyle = '#000000cc';
    ctx.fillRect(cx - 180, cy - 30, 360, 90);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CRASHED!', cx, cy);

    ctx.fillStyle = '#ffff00';
    ctx.font = '16px monospace';
    ctx.fillText(`Score: ${state.score} | Cones Hit: ${state.conesHit}`, cx, cy + 28);

    ctx.fillStyle = '#ffffff88';
    ctx.font = '14px monospace';
    ctx.fillText('Press R to restart', cx, cy + 52);
    ctx.textAlign = 'left';
  }

  private drawRoad(ctx: CanvasRenderingContext2D, cam: CameraState): void {
    // Asphalt background
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // World-space X positions converted to screen
    const centerX = GAME_WIDTH / 2 - cam.worldX;
    const leftEdge = 100 - cam.worldX;
    const rightEdge = 700 - cam.worldX;

    // Road markings — dashed center line
    // Offset the dash pattern by camera Y so dashes stay fixed in world space
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 30]);
    ctx.lineDashOffset = cam.worldY;

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, GAME_HEIGHT);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Road edge lines
    ctx.strokeStyle = '#ffffff22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftEdge, 0);
    ctx.lineTo(leftEdge, GAME_HEIGHT);
    ctx.moveTo(rightEdge, 0);
    ctx.lineTo(rightEdge, GAME_HEIGHT);
    ctx.stroke();
  }
}

function interpolateVehicle(
  current: GameState,
  previous: GameState,
  alpha: number,
): { x: number; y: number; heading: number } {
  const c = current.vehicle;
  const p = previous.vehicle;
  return {
    x: p.position.x + (c.position.x - p.position.x) * alpha,
    y: p.position.y + (c.position.y - p.position.y) * alpha,
    heading: p.heading + (c.heading - p.heading) * alpha,
  };
}
