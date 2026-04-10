import type { GameState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../engine/constants';

/**
 * Draw the heads-up display showing vehicle settings.
 * Drawn in screen space (no camera offset).
 */
export function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  engineFps: number,
  renderFps: number,
): void {
  const v = state.vehicle;
  const cfg = state.config;

  // Background panel (bottom)
  ctx.fillStyle = '#000000cc';
  ctx.fillRect(0, GAME_HEIGHT - 100, GAME_WIDTH, 100);

  // Divider line
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GAME_HEIGHT - 100);
  ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 100);
  ctx.stroke();

  const baseY = GAME_HEIGHT - 85;
  ctx.font = '13px monospace';

  // Column 1: Controls
  const col1 = 15;
  ctx.fillStyle = '#88ff88';
  ctx.fillText('THROTTLE', col1, baseY);
  drawBar(ctx, col1, baseY + 5, v.throttle, 10, '#00cc44');

  ctx.fillStyle = '#ff8888';
  ctx.fillText('BRAKE', col1, baseY + 35);
  drawBar(ctx, col1, baseY + 40, v.brake, 5, '#cc4444');

  // Column 2: Steering
  const col2 = 160;
  ctx.fillStyle = '#88ccff';
  ctx.fillText('STEERING', col2, baseY);
  drawSteeringIndicator(ctx, col2, baseY + 20, v.steering);

  ctx.fillStyle = '#aaaaaa';
  ctx.font = '11px monospace';
  ctx.fillText(`Angle: ${v.steering.toFixed(1)}`, col2, baseY + 50);

  // Column 3: Speed
  const col3 = 330;
  ctx.font = '13px monospace';
  ctx.fillStyle = '#ffcc44';
  ctx.fillText('SPEED', col3, baseY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`${Math.round(v.speed)}`, col3, baseY + 30);

  ctx.fillStyle = '#888';
  ctx.font = '11px monospace';
  ctx.fillText('px/s', col3 + 60, baseY + 30);

  // Column 4: Config
  const col4 = 470;
  ctx.font = '11px monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText(`PWR: ${cfg.power}  WGT: ${cfg.weight}  TRN: ${cfg.turningCircle}`, col4, baseY);

  // Column 5: Score
  const col5 = 660;
  ctx.font = '13px monospace';
  ctx.fillStyle = '#ffff00';
  ctx.fillText('SCORE', col5, baseY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`${state.score}`, col5, baseY + 30);

  ctx.fillStyle = '#ff6666';
  ctx.font = '11px monospace';
  ctx.fillText(`Cones: ${state.conesHit}`, col5, baseY + 50);

  // FPS (top-left)
  ctx.font = '10px monospace';
  const fpsText = `E:${engineFps} R:${renderFps}`;
  const fpsWidth = ctx.measureText(fpsText).width;
  ctx.fillStyle = '#000000aa';
  ctx.fillRect(2, 1, fpsWidth + 8, 15);
  ctx.fillStyle = '#88ff88cc';
  ctx.fillText(fpsText, 5, 12);

  // Controls help (top-right) — dark background for readability
  const helpText = '=/- Throttle | A/Z Brake | ←→ Steer | R Restart';
  ctx.font = '10px monospace';
  const helpWidth = ctx.measureText(helpText).width;
  ctx.fillStyle = '#000000aa';
  ctx.fillRect(GAME_WIDTH - helpWidth - 12, 1, helpWidth + 10, 15);
  ctx.fillStyle = '#ffffffcc';
  ctx.textAlign = 'right';
  ctx.fillText(helpText, GAME_WIDTH - 5, 12);
  ctx.textAlign = 'left';
}

function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  max: number,
  color: string,
): void {
  const barW = 100;
  const barH = 12;

  // Background
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, barW, barH);

  // Fill
  ctx.fillStyle = color;
  ctx.fillRect(x, y, (value / max) * barW, barH);

  // Value text
  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.fillText(`${value}/${max}`, x + barW + 5, y + 10);
}

function drawSteeringIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  steering: number,
): void {
  const width = 120;
  const height = 14;
  const centerX = x + width / 2;

  // Background track
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, width, height);

  // Center mark
  ctx.fillStyle = '#666';
  ctx.fillRect(centerX - 1, y, 2, height);

  // Steering position indicator
  const indicatorX = centerX + (steering / 10) * (width / 2);
  ctx.fillStyle = '#44aaff';
  ctx.fillRect(indicatorX - 4, y - 1, 8, height + 2);

  // Labels
  ctx.fillStyle = '#666';
  ctx.font = '8px monospace';
  ctx.fillText('L', x - 8, y + 10);
  ctx.fillText('R', x + width + 3, y + 10);
}
