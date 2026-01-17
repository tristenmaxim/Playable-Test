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
      // В PixiJS v8 используем Assets API для загрузки
      const loadedAsset = await PIXI.Assets.load(imagePath);
      console.log('Загруженный ассет:', loadedAsset);
      console.log('Тип ассета:', loadedAsset?.constructor?.name);
      
      // Assets.load может вернуть Texture или ImageResource
      let texture;
      if (loadedAsset instanceof PIXI.Texture) {
        texture = loadedAsset;
      } else if (loadedAsset?.texture) {
        texture = loadedAsset.texture;
      } else if (loadedAsset?.baseTexture) {
        texture = new PIXI.Texture(loadedAsset.baseTexture);
      } else {
        // Пробуем создать текстуру из загруженного ресурса
        texture = PIXI.Texture.from(imagePath);
        console.log('Используем Texture.from() как fallback');
      }
      
      if (texture) {
        console.log('✅ Текстура получена! Размер:', texture.width, 'x', texture.height);
        console.log('Текстура валидна:', texture.valid);
        console.log('BaseTexture валиден:', texture.baseTexture?.valid);
        
        // Ждем, пока текстура точно загрузится
        if (!texture.baseTexture?.valid) {
          console.log('Ожидание загрузки baseTexture...');
          await new Promise((resolve) => {
            texture.baseTexture.on('loaded', resolve);
            texture.baseTexture.on('error', resolve);
            // Таймаут на случай, если событие уже произошло
            setTimeout(resolve, 100);
          });
        }
        
        this.setTexture(texture);
      } else {
        console.warn('⚠️ Не удалось получить текстуру из загруженного ассета');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки текстуры фона:', error);
      console.error('Путь:', imagePath);
      console.warn('Пробуем Texture.from()...');
      
      // Fallback: используем Texture.from()
      try {
        const texture = PIXI.Texture.from(imagePath);
        console.log('Texture.from() создан, валиден:', texture.baseTexture?.valid);
        
        if (texture.baseTexture?.valid) {
          this.setTexture(texture);
        } else {
          texture.baseTexture.on('loaded', () => {
            console.log('✅ Текстура загружена через Texture.from()!');
            this.setTexture(texture);
          });
          
          texture.baseTexture.on('error', (err) => {
            console.error('Ошибка загрузки через Texture.from():', err);
          });
        }
      } catch (fallbackError) {
        console.error('Fallback тоже не сработал:', fallbackError);
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
    
    // Создаем новые слои с текстурой
    const bg1 = new PIXI.Sprite(texture);
    bg1.scale.set(scaleX, scaleY);
    bg1.x = 0;
    bg1.y = 0;
    
    console.log('bg1 создан, размер после масштабирования:', bg1.width, 'x', bg1.height);
    console.log('bg1 позиция:', bg1.x, bg1.y);
    
    const bg2 = new PIXI.Sprite(texture);
    bg2.scale.set(scaleX, scaleY);
    bg2.x = bg1.width; // Размещаем второй фон сразу после первого
    bg2.y = 0;
    
    console.log('bg2 создан, позиция:', bg2.x, bg2.y);
    console.log('Количество детей на сцене до добавления:', this.app.stage.children.length);
    
    // НЕ очищаем всю сцену - там может быть Player!
    // Удаляем только старые слои фона
    this.layers.forEach(layer => {
      if (layer.sprite && layer.sprite.parent) {
        layer.sprite.parent.removeChild(layer.sprite);
      }
    });
    
    // Добавляем новые спрайты в начало (фон должен быть сзади)
    this.app.stage.addChildAt(bg1, 0);
    
    // Находим индекс для второго спрайта (после первого, но перед Player)
    const bg1Index = this.app.stage.getChildIndex(bg1);
    this.app.stage.addChildAt(bg2, bg1Index + 1);
    
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
