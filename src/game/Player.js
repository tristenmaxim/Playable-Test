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
    // Позиция игрока (будет установлена после загрузки текстуры)
    this.initialX = 100;
    this.initialY = CONFIG.GROUND_Y;
    
    // Загружаем текстуру героя сразу
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
    // Удаляем старый спрайт, если есть
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    
    // Создаем новый спрайт с текстурой
    this.sprite = new PIXI.Sprite(texture);
    
    // Настраиваем размер (примерно 80 пикселей в высоту)
    const targetHeight = 80;
    const scale = targetHeight / texture.height;
    this.sprite.scale.set(scale, scale);
    
    // Позиция и якорь
    this.sprite.x = this.initialX || 100;
    this.sprite.y = this.initialY || CONFIG.GROUND_Y;
    this.sprite.anchor.set(0.5, 1); // Якорь снизу по центру
    
    // Добавляем на сцену поверх фона (но перед UI элементами)
    this.app.stage.addChild(this.sprite);
    
    console.log('✅ Спрайт героя создан, размер:', this.sprite.width, 'x', this.sprite.height);
    console.log('Позиция героя:', this.sprite.x, this.sprite.y);
  }
  
  jump() {
    // Проверяем, что спрайт создан
    if (!this.sprite) return;
    
    if (this.isOnGround) {
      this.velocityY = CONFIG.JUMP_POWER;
      this.isOnGround = false;
    }
  }
  
  update(delta) {
    // Проверяем, что спрайт создан
    if (!this.sprite) return;
    
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
    if (!this.sprite) return null;
    return this.sprite.getBounds();
  }
}
