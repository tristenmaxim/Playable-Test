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
    
    // Сразу пытаемся загрузить текстуру фона (асинхронно)
    this.loadTexture().catch(error => {
      console.error('Ошибка загрузки текстуры фона:', error);
    });
  }
  
  async loadTexture() {
    console.log('Background.loadTexture() вызван');
    
    // Сначала создаем placeholder, чтобы что-то было видно
    this.createPlaceholder();
    
    // Загружаем текстуру фона
    const imagePath = 'assets/images/background.png';
    console.log('Загрузка текстуры фона из:', imagePath);
    
    try {
      // В PixiJS v8 используем Assets.load() - это правильный способ
      console.log('Используем PIXI.Assets.load()...');
      const texture = await PIXI.Assets.load(imagePath);
      
      console.log('Загруженный ресурс:', texture);
      console.log('Тип:', texture?.constructor?.name);
      
      // Assets.load может вернуть Texture напрямую или ImageResource
      let finalTexture;
      
      if (texture instanceof PIXI.Texture) {
        finalTexture = texture;
        console.log('✅ Получена Texture напрямую');
      } else if (texture && typeof texture === 'object') {
        // Может быть ImageResource или другой тип
        console.log('Проверяем свойства объекта...');
        console.log('texture.texture:', texture.texture);
        console.log('texture.baseTexture:', texture.baseTexture);
        console.log('texture.source:', texture.source);
        
        // Пробуем разные варианты
        if (texture.texture) {
          finalTexture = texture.texture;
        } else if (texture.baseTexture) {
          finalTexture = new PIXI.Texture(texture.baseTexture);
        } else {
          // Создаем текстуру из URL напрямую
          console.log('Создаем текстуру через Texture.fromURL()...');
          finalTexture = await PIXI.Texture.fromURL(imagePath);
        }
      } else {
        throw new Error('Неожиданный тип загруженного ресурса');
      }
      
      if (finalTexture) {
        console.log('✅ Финальная текстура получена!');
        console.log('Размер:', finalTexture.width, 'x', finalTexture.height);
        console.log('Валидна:', finalTexture.valid);
        this.setTexture(finalTexture);
      } else {
        throw new Error('Не удалось получить текстуру из загруженного ресурса');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки через Assets.load():', error);
      console.log('Пробуем альтернативный способ...');
      
      // Альтернативный способ: Texture.fromURL()
      try {
        const texture = await PIXI.Texture.fromURL(imagePath);
        console.log('✅ Текстура загружена через Texture.fromURL()!');
        this.setTexture(texture);
      } catch (fallbackError) {
        console.error('❌ Ошибка загрузки через Texture.fromURL():', fallbackError);
      }
    }
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
    console.log('setTexture вызван, texture:', texture);
    console.log('Размер текстуры:', texture.width, 'x', texture.height);
    
    // Удаляем старые слои (включая placeholder)
    this.layers.forEach(layer => {
      if (layer.sprite && layer.sprite.parent) {
        console.log('Удаляем старый слой:', layer.sprite);
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
    
    console.log('Масштаб:', scaleX, 'x', scaleY);
    
    // Проверяем текстуру перед созданием спрайта
    console.log('Проверка текстуры перед созданием спрайта:');
    console.log('texture.valid:', texture.valid);
    console.log('texture.width:', texture.width);
    console.log('texture.height:', texture.height);
    console.log('texture.baseTexture:', texture.baseTexture);
    console.log('texture.baseTexture.valid:', texture.baseTexture?.valid);
    console.log('texture.source:', texture.source);
    
    // Создаем новые слои с текстурой
    const bg1 = new PIXI.Sprite(texture);
    bg1.scale.set(scaleX, scaleY);
    bg1.x = 0;
    bg1.y = 0;
    bg1.visible = true;
    bg1.alpha = 1;
    
    console.log('bg1 создан, размер после масштабирования:', bg1.width, 'x', bg1.height);
    console.log('bg1 позиция:', bg1.x, bg1.y);
    console.log('bg1 текстура:', bg1.texture);
    console.log('bg1 текстура валидна:', bg1.texture?.valid);
    
    const bg2 = new PIXI.Sprite(texture);
    bg2.scale.set(scaleX, scaleY);
    bg2.x = bg1.width; // Размещаем второй фон сразу после первого
    bg2.y = 0;
    bg2.visible = true;
    bg2.alpha = 1;
    
    console.log('bg2 создан, позиция:', bg2.x, bg2.y);
    console.log('bg2 текстура валидна:', bg2.texture?.valid);
    console.log('Количество детей на сцене до добавления:', this.app.stage.children.length);
    
    // Старые слои уже удалены выше (строки 107-112)
    // Просто добавляем новые спрайты на сцену
    this.app.stage.addChild(bg1);
    this.app.stage.addChild(bg2);
    
    console.log('Спрайты добавлены на сцену');
    console.log('Количество детей на сцене после добавления:', this.app.stage.children.length);
    console.log('bg1 видимый:', bg1.visible, 'alpha:', bg1.alpha, 'zIndex:', this.app.stage.getChildIndex(bg1));
    console.log('bg2 видимый:', bg2.visible, 'alpha:', bg2.alpha, 'zIndex:', this.app.stage.getChildIndex(bg2));
    console.log('Все дети на сцене:', this.app.stage.children.map(c => c.constructor.name));
    
    this.layers.push({ sprite: bg1, speed: this.speed });
    this.layers.push({ sprite: bg2, speed: this.speed });
    
    // Принудительно обновляем рендер
    this.app.render();
    console.log('Рендер обновлен');
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
