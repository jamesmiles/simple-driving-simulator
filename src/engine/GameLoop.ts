import { FIXED_TIMESTEP, MAX_ACCUMULATED } from './constants';

export type UpdateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void;

/**
 * Fixed timestep game loop with accumulator pattern.
 * Adapted from pb-galaga.
 */
export class GameLoop {
  private updateFn: UpdateFn;
  private renderFn: RenderFn;
  private animationFrameId: number = 0;
  private lastTimestamp: number = 0;
  private accumulator: number = 0;
  private running: boolean = false;

  private tickCount: number = 0;
  private frameCount: number = 0;
  private fpsTimer: number = 0;
  engineFps: number = 0;
  renderFps: number = 0;

  constructor(updateFn: UpdateFn, renderFn: RenderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = 0;
    this.accumulator = 0;
    this.tickCount = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.animationFrameId = requestAnimationFrame((ts) => this.tick(ts));
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  private tick(timestamp: number): void {
    if (!this.running) return;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.fpsTimer = timestamp;
      this.animationFrameId = requestAnimationFrame((ts) => this.tick(ts));
      return;
    }

    let elapsed = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (elapsed > MAX_ACCUMULATED) {
      elapsed = MAX_ACCUMULATED;
    }

    this.accumulator += elapsed;

    while (this.accumulator >= FIXED_TIMESTEP) {
      this.updateFn(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
      this.tickCount++;
    }

    const alpha = this.accumulator / FIXED_TIMESTEP;
    this.renderFn(alpha);
    this.frameCount++;

    this.fpsTimer = this.fpsTimer || timestamp;
    if (timestamp - this.fpsTimer >= 1000) {
      this.engineFps = this.tickCount;
      this.renderFps = this.frameCount;
      this.tickCount = 0;
      this.frameCount = 0;
      this.fpsTimer = timestamp;
    }

    this.animationFrameId = requestAnimationFrame((ts) => this.tick(ts));
  }

  /**
   * Advance the game loop by N fixed timesteps without rAF.
   * Used for headless testing.
   */
  tickHeadless(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.updateFn(FIXED_TIMESTEP);
      this.tickCount++;
    }
  }
}
