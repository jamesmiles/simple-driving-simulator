import { VEHICLE_LENGTH, VEHICLE_WIDTH } from '../../engine/constants';

/**
 * Draw the vehicle as a top-down car shape.
 * Position is in world coordinates (ctx already translated).
 */
export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  // Canvas rotation: heading PI/2 (north) should point up (-Y)
  // Canvas 0 = right, so rotate by -(heading - PI/2) = PI/2 - heading
  ctx.rotate(-(heading - Math.PI / 2));

  const halfL = VEHICLE_LENGTH / 2;
  const halfW = VEHICLE_WIDTH / 2;

  // Car body
  ctx.fillStyle = '#2266cc';
  ctx.beginPath();
  // Rounded rectangle body
  const r = 4;
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

  // Windshield
  ctx.fillStyle = '#88bbff';
  ctx.fillRect(-halfW + 3, -halfL + 4, VEHICLE_WIDTH - 6, 10);

  // Rear window
  ctx.fillStyle = '#6699cc';
  ctx.fillRect(-halfW + 4, halfL - 12, VEHICLE_WIDTH - 8, 8);

  // Direction indicator (front arrow)
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.moveTo(0, -halfL - 6);
  ctx.lineTo(-4, -halfL);
  ctx.lineTo(4, -halfL);
  ctx.closePath();
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#222';
  // Front wheels
  ctx.fillRect(-halfW - 2, -halfL + 5, 4, 8);
  ctx.fillRect(halfW - 2, -halfL + 5, 4, 8);
  // Rear wheels
  ctx.fillRect(-halfW - 2, halfL - 13, 4, 8);
  ctx.fillRect(halfW - 2, halfL - 13, 4, 8);

  ctx.restore();
}
