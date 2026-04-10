import { describe, it, expect } from 'vitest';
import { InputHandler } from './InputHandler';

describe('InputHandler', () => {
  describe('headless mode', () => {
    it('constructs without DOM in headless mode', () => {
      const input = new InputHandler(true);
      expect(input.isKeyDown('ArrowLeft')).toBe(false);
      input.destroy();
    });
  });

  describe('injectKeyPress', () => {
    it('registers as both held and just pressed', () => {
      const input = new InputHandler(true);
      input.injectKeyPress('Equal');

      expect(input.isKeyDown('Equal')).toBe(true);
      expect(input.wasJustPressed('Equal')).toBe(true);
      input.destroy();
    });

    it('wasJustPressed is consumed on read', () => {
      const input = new InputHandler(true);
      input.injectKeyPress('Equal');

      expect(input.wasJustPressed('Equal')).toBe(true);
      expect(input.wasJustPressed('Equal')).toBe(false);
      input.destroy();
    });
  });

  describe('injectKeyDown / injectKeyUp', () => {
    it('holds key down until released', () => {
      const input = new InputHandler(true);
      input.injectKeyDown('ArrowLeft');
      expect(input.isKeyDown('ArrowLeft')).toBe(true);

      input.injectKeyUp('ArrowLeft');
      expect(input.isKeyDown('ArrowLeft')).toBe(false);
      input.destroy();
    });
  });

  describe('getSteeringInput', () => {
    it('returns -1 when left is held', () => {
      const input = new InputHandler(true);
      input.injectKeyDown('ArrowLeft');
      expect(input.getSteeringInput()).toBe(-1);
      input.destroy();
    });

    it('returns 1 when right is held', () => {
      const input = new InputHandler(true);
      input.injectKeyDown('ArrowRight');
      expect(input.getSteeringInput()).toBe(1);
      input.destroy();
    });

    it('returns 0 when both or neither held', () => {
      const input = new InputHandler(true);
      expect(input.getSteeringInput()).toBe(0);

      input.injectKeyDown('ArrowLeft');
      input.injectKeyDown('ArrowRight');
      expect(input.getSteeringInput()).toBe(0);
      input.destroy();
    });
  });

  describe('clearAll', () => {
    it('clears all key state', () => {
      const input = new InputHandler(true);
      input.injectKeyDown('ArrowLeft');
      input.injectKeyPress('Equal');

      input.clearAll();

      expect(input.isKeyDown('ArrowLeft')).toBe(false);
      expect(input.wasJustPressed('Equal')).toBe(false);
      input.destroy();
    });
  });
});
