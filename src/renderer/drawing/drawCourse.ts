import type { GameState } from '../../types';
import { GAME_WIDTH } from '../../engine/constants';

/**
 * Draw course elements: cones, finish line, start line.
 * Called in world-space (ctx already translated by camera).
 */
export function drawCourse(ctx: CanvasRenderingContext2D, state: GameState): void {
  drawFinishLine(ctx, state);
  drawCones(ctx, state);

  if (state.courseComplete) {
    drawCompletionBanner(ctx, state);
  }
}

function drawCones(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const cone of state.cones) {
    const { x, y } = cone.position;

    if (cone.hit) {
      // Knocked-over cone — flat, dimmed
      ctx.fillStyle = '#884422';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      // Deterministic rotation based on cone id
      const tilt = (cone.id * 1.7) % 1.0;
      ctx.ellipse(x, y, cone.radius, cone.radius * 0.6, tilt, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      // Standing cone (witch's hat) — orange with white stripe
      // Base shadow
      ctx.fillStyle = '#00000033';
      ctx.beginPath();
      ctx.ellipse(x + 2, y + 2, cone.radius + 1, cone.radius * 0.5 + 1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cone body (triangle from top)
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(x, y - cone.radius * 1.4);          // tip
      ctx.lineTo(x - cone.radius, y + cone.radius * 0.4);  // bottom left
      ctx.lineTo(x + cone.radius, y + cone.radius * 0.4);  // bottom right
      ctx.closePath();
      ctx.fill();

      // White reflective stripe
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const stripeY = y - cone.radius * 0.3;
      const stripeHalfW = cone.radius * 0.55;
      ctx.fillRect(x - stripeHalfW, stripeY, stripeHalfW * 2, 3);

      // Base
      ctx.fillStyle = '#ff8833';
      ctx.beginPath();
      ctx.ellipse(x, y + cone.radius * 0.4, cone.radius, cone.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFinishLine(ctx: CanvasRenderingContext2D, state: GameState): void {
  const fl = state.finishLine;
  const squareSize = 15;
  const rows = 2;
  const cols = Math.ceil(fl.width / squareSize);

  // Checkerboard pattern
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isBlack = (row + col) % 2 === 0;
      ctx.fillStyle = isBlack ? '#111111' : '#ffffff';
      ctx.fillRect(
        fl.x + col * squareSize,
        fl.y - rows * squareSize + row * squareSize,
        squareSize,
        squareSize,
      );
    }
  }

  // "FINISH" text
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FINISH', fl.x + fl.width / 2, fl.y - rows * squareSize - 8);
  ctx.textAlign = 'left';
}

function drawCompletionBanner(ctx: CanvasRenderingContext2D, state: GameState): void {
  const fl = state.finishLine;
  const bannerY = fl.y - 100;

  ctx.fillStyle = '#000000bb';
  ctx.fillRect(fl.x - 50, bannerY - 30, fl.width + 100, 80);

  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('COURSE COMPLETE!', fl.x + fl.width / 2, bannerY);

  ctx.fillStyle = '#ffff00';
  ctx.font = '18px monospace';
  ctx.fillText(`Score: ${state.score} | Cones Hit: ${state.conesHit}`, fl.x + fl.width / 2, bannerY + 30);

  ctx.fillStyle = '#ffffff88';
  ctx.font = '14px monospace';
  ctx.fillText('Press R to restart', fl.x + fl.width / 2, bannerY + 55);
  ctx.textAlign = 'left';
}

