import { CONFIG } from '../config.js';

/**
 * Класс для управления фоном с параллакс-скроллом
 */
export class Background {
  constructor(app) {
    this.app = app;
    this.layers = [];
    this.speed = CONFIG.BACKGROUND_SCROLL_SPEED;
    
    this.init();
  }
  
  init() {
    // Создаем placeholder для фона (пока без текстуры)
    // Позже заменим на реальную текстуру
    const bg1 = new PIXI.Graphics();
    bg1.beginFill(0x2a2a3e);
    bg1.drawRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    bg1.endFill();
    bg1.x = 0;
    bg1.y = 0;
    
    const bg2 = new PIXI.Graphics();
    bg2.beginFill(0x2a2a3e);
    bg2.drawRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    bg2.endFill();
    bg2.x = CONFIG.GAME_WIDTH;
    bg2.y = 0;
    
    this.app.stage.addChild(bg1);
    this.app.stage.addChild(bg2);
    
    this.layers.push({ sprite: bg1, speed: this.speed });
    this.layers.push({ sprite: bg2, speed: this.speed });
    
    // Пытаемся загрузить текстуру фона
    this.loadTexture();
  }
  
  async loadTexture() {
    try {
      const texture = await PIXI.Assets.load('assets/images/background.png');
      this.setTexture(texture);
    } catch (error) {
      console.warn('Не удалось загрузить текстуру фона, используется placeholder:', error);
    }
  }
  
  /**
   * Устанавливает текстуру фона
   */
  setTexture(texture) {
    // Удаляем старые слои
    this.layers.forEach(layer => {
      if (layer.sprite && layer.sprite.parent) {
        layer.sprite.parent.removeChild(layer.sprite);
      }
    });
    this.layers = [];
    
    // Создаем новые слои с текстурой
    const bg1 = new PIXI.Sprite(texture);
    bg1.width = CONFIG.GAME_WIDTH;
    bg1.height = CONFIG.GAME_HEIGHT;
    bg1.x = 0;
    bg1.y = 0;
    
    const bg2 = new PIXI.Sprite(texture);
    bg2.width = CONFIG.GAME_WIDTH;
    bg2.height = CONFIG.GAME_HEIGHT;
    bg2.x = CONFIG.GAME_WIDTH;
    bg2.y = 0;
    
    this.app.stage.addChildAt(bg1, 0);
    this.app.stage.addChildAt(bg2, 1);
    
    this.layers.push({ sprite: bg1, speed: this.speed });
    this.layers.push({ sprite: bg2, speed: this.speed });
  }
  
  update(delta) {
    this.layers.forEach(layer => {
      layer.sprite.x -= layer.speed * delta;
      
      // Бесшовное зацикливание
      if (layer.sprite.x <= -CONFIG.GAME_WIDTH) {
        layer.sprite.x = CONFIG.GAME_WIDTH;
      }
    });
  }
}
