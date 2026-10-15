import Phaser from 'phaser';
import { createTextures } from '../art';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createTextures(this);
    this.scene.start('World1', { demo: true });
  }
}
