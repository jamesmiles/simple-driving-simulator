import { VEHICLE_LENGTH, VEHICLE_WIDTH } from '../../engine/constants';

/**
 * Draw the vehicle as a simple bright green shape with "CAR" label.
 * High-contrast for machine vision. Position is in world coordinates.
 */
export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-(heading - Math.PI / 2));

  const halfL = VEHICLE_LENGTH / 2;
  const halfW = VEHICLE_WIDTH / 2;
  const r = 4;

  // Bright green filled body
  ctx.fillStyle = '#00ff00';
  ctx.strokeStyle = '#008800';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-halfW + r, -halfL);
  ctx.lineTo(halfW - r, -halfL);
  ctx.arcTo(halfW, -halfL, halfW, -halfL + r, r);
  ctx.lineTo(halfW, halfL - r);
  ctx.arcTo(halfW, halfL, halfW - r, halfL, r);
  ctx.lineTo(-halfW + r, halfL);
  ctx.arcTo(-halfW, halfL, -halfW, halfL - r, r);
  ctx.lineTo(-halfW, -halfL + r);
  ctx.arcTo(-halfW, -halfL, -halfW + r, -halfL, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // "CAR" label
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CAR', 0, 0);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // Direction indicator (front arrow)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(0, -halfL - 6);
  ctx.lineTo(-4, -halfL);
  ctx.lineTo(4, -halfL);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
