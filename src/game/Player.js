import { CONFIG } from '../config.js';

/**
 * Класс игрока
 */
export class Player {
  constructor(app) {
    this.app = app;
    this.sprite = null;
    this.velocityY = 0;
    this.isOnGround = true;
    
    this.init();
  }
  
  init() {
    // Создаем placeholder спрайт (прямоугольник)
    // Позже заменим на реальную текстуру
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x00ff00);
    this.sprite.drawRect(0, 0, 50, 80);
    this.sprite.endFill();
    
    // Позиция игрока
    this.sprite.x = 100;
    this.sprite.y = CONFIG.GROUND_Y;
    
    this.app.stage.addChild(this.sprite);
  }
  
  /**
   * Устанавливает текстуру игрока
   */
  setTexture(texture) {
    const oldX = this.sprite.x;
    const oldY = this.sprite.y;
    
    // Удаляем старый спрайт
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    
    // Создаем новый спрайт с текстурой
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = oldX;
    this.sprite.y = oldY;
    this.sprite.anchor.set(0.5, 1); // Якорь снизу по центру
    
    this.app.stage.addChild(this.sprite);
  }
  
  jump() {
    if (this.isOnGround) {
      this.velocityY = CONFIG.JUMP_POWER;
      this.isOnGround = false;
    }
  }
  
  update(delta) {
    // Применяем гравитацию
    this.velocityY += CONFIG.GRAVITY * delta;
    
    // Обновляем позицию
    this.sprite.y += this.velocityY * delta;
    
    // Проверка земли
    if (this.sprite.y >= CONFIG.GROUND_Y) {
      this.sprite.y = CONFIG.GROUND_Y;
      this.velocityY = 0;
      this.isOnGround = true;
    }
  }
  
  getBounds() {
    return this.sprite.getBounds();
  }
}
