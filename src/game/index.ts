import Phaser from 'phaser';
import { SudokuScene } from './scenes/SudokuScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 600,
  height: 650,
  backgroundColor: '#f5f5f5',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [SudokuScene]
};

export const createGame = (): Phaser.Game => {
  return new Phaser.Game(gameConfig);
};