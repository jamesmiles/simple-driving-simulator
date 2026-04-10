import { GameManager } from './engine/GameManager';
import { Canvas2DRenderer } from './renderer/Canvas2DRenderer';

function init(): void {
  const renderer = new Canvas2DRenderer('game-container');
  const gameManager = new GameManager({ renderer });
  gameManager.start();

  // Expose for debugging
  (window as any).__game = gameManager;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
