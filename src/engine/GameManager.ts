import { GameLoop } from './GameLoop';
import { StateManager } from './StateManager';
import { InputHandler } from './InputHandler';
import { DrivingEngine } from './DrivingEngine';
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer';
import { SoundManager } from '../audio/SoundManager';
import type { GameState } from '../types';

export interface GameManagerOptions {
  renderer?: Canvas2DRenderer;
  headless?: boolean;
}

/**
 * Top-level game orchestrator.
 * Adapted from pb-galaga's GameManager — wires together engine, renderer, and input.
 */
export class GameManager {
  readonly gameLoop: GameLoop;
  readonly stateManager: StateManager;
  readonly inputHandler: InputHandler;
  private engine: DrivingEngine;
  private renderer: Canvas2DRenderer | null;
  private headless: boolean;
  private finishSoundPlayed: boolean = false;

  constructor(options: GameManagerOptions = {}) {
    this.headless = options.headless ?? false;
    this.renderer = options.renderer ?? null;
    this.stateManager = new StateManager();
    this.inputHandler = new InputHandler(this.headless);
    this.engine = new DrivingEngine(this.inputHandler);

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );
  }

  start(): void {
    this.gameLoop.start();
  }

  /** Get the current game state (for testing). */
  getState(): GameState {
    return this.stateManager.currentState;
  }

  /** Get the previous game state (for testing). */
  getPreviousState(): GameState {
    return this.stateManager.previousState;
  }

  /** Advance N fixed timesteps without rAF (for headless testing). */
  tickHeadless(steps: number): void {
    this.gameLoop.tickHeadless(steps);
  }

  destroy(): void {
    this.gameLoop.stop();
    this.inputHandler.destroy();
  }

  private update(dt: number): void {
    // Swap buffers BEFORE mutations (pb-galaga pattern)
    this.stateManager.swapBuffers();

    const state = this.stateManager.currentState;
    const dtSeconds = dt / 1000;

    // Check for restart
    if (this.inputHandler.wasJustPressed('KeyR')) {
      this.stateManager.reset();
      this.finishSoundPlayed = false;
      return;
    }

    // Run driving engine
    this.engine.update(state, dtSeconds);

    // Play finish sound once
    if (state.courseComplete && !this.finishSoundPlayed) {
      this.finishSoundPlayed = true;
      if (!this.headless) {
        SoundManager.playFinish();
      }
    }
  }

  private render(alpha: number): void {
    if (!this.renderer) return;
    this.renderer.setFpsCounters(
      this.gameLoop.engineFps,
      this.gameLoop.renderFps,
    );
    this.renderer.render(
      this.stateManager.currentState,
      this.stateManager.previousState,
      alpha,
    );
  }
}
