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
    console.log('Background.init() вызван');
    
    // Сразу пытаемся загрузить текстуру фона
    this.loadTexture();
  }
  
  loadTexture() {
    console.log('Background.loadTexture() вызван');
    
    // Сначала создаем placeholder, чтобы что-то было видно
    this.createPlaceholder();
    
    // Загружаем текстуру фона
    const imagePath = 'assets/images/background.png';
    console.log('Загрузка текстуры фона из:', imagePath);
    
    // Используем PIXI.Texture.from() - он автоматически загружает изображение
    const texture = PIXI.Texture.from(imagePath);
    
    // Проверяем, загружена ли текстура
    const checkTexture = () => {
      if (texture.baseTexture.valid) {
        console.log('✅ Текстура загружена! Размер:', texture.width, 'x', texture.height);
        this.setTexture(texture);
        return true;
      }
      return false;
    };
    
    // Если текстура уже загружена
    if (checkTexture()) {
      return;
    }
    
    // Ждем загрузки текстуры
    console.log('⏳ Ожидание загрузки текстуры...');
    
    texture.baseTexture.on('loaded', () => {
      console.log('✅ Текстура загружена успешно! Размер:', texture.width, 'x', texture.height);
      this.setTexture(texture);
    });
    
    texture.baseTexture.on('error', (error) => {
      console.error('❌ Ошибка загрузки текстуры фона:', error);
      console.error('Путь:', imagePath);
      console.warn('Используется placeholder');
    });
    
    // Также проверяем через небольшую задержку
    setTimeout(() => {
      if (!texture.baseTexture.valid) {
        console.warn('⚠️ Текстура не загрузилась за 2 секунды');
        console.warn('Проверьте:');
        console.warn('1. Файл существует: assets/images/background.png');
        console.warn('2. Локальный сервер запущен (Live Server, Python http.server и т.д.)');
        console.warn('3. Путь правильный относительно index.html');
      }
    }, 2000);
  }
  
  createPlaceholder() {
    // Создаем placeholder для фона (пока без текстуры)
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
