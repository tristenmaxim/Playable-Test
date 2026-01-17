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
  
  loadTexture() {
    // Загружаем текстуру фона
    const texture = PIXI.Texture.from('assets/images/background.png');
    
    // Если текстура уже загружена, сразу устанавливаем
    if (texture.baseTexture.valid) {
      this.setTexture(texture);
    } else {
      // Ждем загрузки текстуры
      texture.baseTexture.on('loaded', () => {
        this.setTexture(texture);
      });
      
      texture.baseTexture.on('error', (error) => {
        console.warn('Не удалось загрузить текстуру фона, используется placeholder:', error);
      });
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
    
    // Вычисляем масштаб для заполнения экрана с сохранением пропорций
    const textureAspect = texture.width / texture.height;
    const gameAspect = CONFIG.GAME_WIDTH / CONFIG.GAME_HEIGHT;
    
    let scaleX, scaleY;
    if (textureAspect > gameAspect) {
      // Текстура шире - масштабируем по высоте
      scaleY = CONFIG.GAME_HEIGHT / texture.height;
      scaleX = scaleY;
    } else {
      // Текстура выше - масштабируем по ширине
      scaleX = CONFIG.GAME_WIDTH / texture.width;
      scaleY = scaleX;
    }
    
    // Создаем новые слои с текстурой
    const bg1 = new PIXI.Sprite(texture);
    bg1.scale.set(scaleX, scaleY);
    bg1.x = 0;
    bg1.y = 0;
    
    const bg2 = new PIXI.Sprite(texture);
    bg2.scale.set(scaleX, scaleY);
    bg2.x = bg1.width; // Размещаем второй фон сразу после первого
    bg2.y = 0;
    
    // Добавляем на сцену в самом начале (фон должен быть сзади)
    this.app.stage.addChildAt(bg1, 0);
    this.app.stage.addChildAt(bg2, 1);
    
    this.layers.push({ sprite: bg1, speed: this.speed });
    this.layers.push({ sprite: bg2, speed: this.speed });
  }
  
  update(delta) {
    this.layers.forEach(layer => {
      layer.sprite.x -= layer.speed * delta;
      
      // Бесшовное зацикливание
      // Когда первый фон уходит за левый край, перемещаем его вправо от второго
      if (layer.sprite.x <= -layer.sprite.width) {
        // Находим другой слой для правильного позиционирования
        const otherLayer = this.layers.find(l => l !== layer);
        if (otherLayer) {
          layer.sprite.x = otherLayer.sprite.x + otherLayer.sprite.width;
        } else {
          layer.sprite.x = CONFIG.GAME_WIDTH;
        }
      }
    });
  }
}
