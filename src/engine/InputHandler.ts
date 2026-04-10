/**
 * Input handler for the driving simulator.
 *
 * Controls:
 * - Arrow Left/Right: Steering
 * - = / -: Throttle up/down
 * - A / Z: Brake up/down
 */
export class InputHandler {
  private keyState: Record<string, boolean> = {};
  private keyJustPressed: Record<string, boolean> = {};
  private headless: boolean;

  private handleKeyDown = (e: KeyboardEvent): void => {
    const code = e.code;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
         'Equal', 'Minus', 'KeyA', 'KeyZ', 'KeyR'].includes(code)) {
      e.preventDefault();
    }
    if (!this.keyState[code]) {
      this.keyJustPressed[code] = true;
    }
    this.keyState[code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keyState[e.code] = false;
  };

  constructor(headless: boolean = false) {
    this.headless = headless;
    if (!headless && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  isKeyDown(code: string): boolean {
    return !!this.keyState[code];
  }

  /** Returns true once per key press (consumed on read). */
  wasJustPressed(code: string): boolean {
    const pressed = !!this.keyJustPressed[code];
    if (pressed) this.keyJustPressed[code] = false;
    return pressed;
  }

  /** Get steering direction from held arrow keys. Returns -1, 0, or 1. */
  getSteeringInput(): number {
    const left = this.isKeyDown('ArrowLeft') ? -1 : 0;
    const right = this.isKeyDown('ArrowRight') ? 1 : 0;
    return left + right;
  }

  /** Inject a key press programmatically (for headless testing). */
  injectKeyPress(code: string): void {
    this.keyJustPressed[code] = true;
    this.keyState[code] = true;
  }

  /** Inject a held key state programmatically (for headless testing). */
  injectKeyDown(code: string): void {
    this.keyState[code] = true;
  }

  /** Release a key programmatically (for headless testing). */
  injectKeyUp(code: string): void {
    this.keyState[code] = false;
  }

  /** Clear all key state. */
  clearAll(): void {
    this.keyState = {};
    this.keyJustPressed = {};
  }

  destroy(): void {
    if (!this.headless && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
  }
}
