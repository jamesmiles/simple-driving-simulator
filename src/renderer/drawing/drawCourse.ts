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
      // Knocked-over cone — dimmed red circle
      ctx.fillStyle = '#cc000044';
      ctx.beginPath();
      ctx.arc(x, y, cone.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standing cone — bright red triangle
      ctx.fillStyle = '#ff0000';
      ctx.strokeStyle = '#990000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - cone.radius * 1.4);
      ctx.lineTo(x - cone.radius, y + cone.radius * 0.5);
      ctx.lineTo(x + cone.radius, y + cone.radius * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
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
  ctx.fillStyle = '#000000';
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

