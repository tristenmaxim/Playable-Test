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
    
    // init теперь асинхронный
    this.init().catch(error => {
      console.error('Ошибка инициализации игрока:', error);
    });
  }
  
  async init() {
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
    
    // Загружаем текстуру героя
    await this.loadTexture();
  }
  
  async loadTexture() {
    try {
      const texture = await PIXI.Assets.load('assets/images/hero.png');
      console.log('✅ Текстура героя загружена, размер:', texture.width, 'x', texture.height);
      this.setTexture(texture);
    } catch (error) {
      console.error('❌ Ошибка загрузки текстуры героя:', error);
    }
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
    
    // Настраиваем размер (примерно 80 пикселей в высоту)
    const targetHeight = 80;
    const scale = targetHeight / texture.height;
    this.sprite.scale.set(scale, scale);
    
    // Позиция и якорь
    this.sprite.x = oldX;
    this.sprite.y = oldY;
    this.sprite.anchor.set(0.5, 1); // Якорь снизу по центру
    
    // Добавляем на сцену поверх фона (но перед UI элементами)
    this.app.stage.addChild(this.sprite);
    
    console.log('✅ Спрайт героя создан, размер:', this.sprite.width, 'x', this.sprite.height);
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
