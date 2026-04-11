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

  // Background panel (bottom)
  ctx.fillStyle = '#000000cc';
  ctx.fillRect(0, GAME_HEIGHT - 80, GAME_WIDTH, 80);

  // Divider line
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GAME_HEIGHT - 80);
  ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 80);
  ctx.stroke();

  const labelY = GAME_HEIGHT - 65;
  const valueY = GAME_HEIGHT - 28;

  // Throttle
  const col1 = 30;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#88ff88';
  ctx.font = '11px monospace';
  ctx.fillText('THROTTLE', col1 + 30, labelY);

  ctx.fillStyle = '#00ff44';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`${v.throttle}`, col1 + 30, valueY);

  // Brake
  const col2 = 160;
  ctx.fillStyle = '#ff8888';
  ctx.font = '11px monospace';
  ctx.fillText('BRAKE', col2 + 20, labelY);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`${v.brake}`, col2 + 20, valueY);

  // Steering
  const col3 = 290;
  ctx.fillStyle = '#88ccff';
  ctx.font = '11px monospace';
  ctx.fillText('STEER', col3 + 20, labelY);

  ctx.fillStyle = '#44aaff';
  ctx.font = 'bold 28px monospace';
  const steerText = v.steering > 0 ? `+${v.steering}` : `${v.steering}`;
  ctx.fillText(steerText, col3 + 20, valueY);

  // Speed
  const col4 = 430;
  ctx.fillStyle = '#ffcc44';
  ctx.font = '11px monospace';
  ctx.fillText('SPEED', col4 + 20, labelY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`${Math.round(v.speed)}`, col4 + 20, valueY);

  // Score
  const col5 = 570;
  ctx.fillStyle = '#ffff00';
  ctx.font = '11px monospace';
  ctx.fillText('SCORE', col5 + 20, labelY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`${state.score}`, col5 + 20, valueY);

  // Cones Hit
  const col6 = 710;
  ctx.fillStyle = '#ff6666';
  ctx.font = '11px monospace';
  ctx.fillText('CONES', col6 + 20, labelY);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`${state.conesHit}`, col6 + 20, valueY);

  ctx.textAlign = 'left';

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
