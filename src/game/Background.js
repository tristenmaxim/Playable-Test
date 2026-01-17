import { CONFIG } from '../config.js';

/**
 * Класс для управления фоном со скроллом
 */
export class Background {
  constructor(app) {
    this.app = app;
    this.speed = CONFIG.BACKGROUND_SCROLL_SPEED;

    // Один контейнер для всего фона (всё движется вместе)
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    // Ширина одного "экрана" фона для зацикливания
    this.sectionWidth = 0;

    // Флаг готовности
    this.isReady = false;

    this.init();
  }

  init() {
    console.log('Background.init() вызван');
    this.loadAllTextures().catch(error => {
      console.error('Ошибка загрузки текстур:', error);
    });
  }

  async loadAllTextures() {
    console.log('Загрузка всех текстур фона...');

    try {
      // Загружаем только текстуру фона
      const bgTexture = await PIXI.Assets.load('assets/images/background.png');

      console.log('✅ Текстура фона загружена');

      // Сохраняем текстуру для использования
      this.textures = {
        bg: bgTexture
      };

      // Создаем фон (2 секции: оригинал - зеркально)
      this.createBackgroundSection(0); // оригинал
      this.createBackgroundSection(1); // зеркально

      this.isReady = true;
      console.log('✅ Фон готов');

    } catch (error) {
      console.error('❌ Ошибка загрузки текстур:', error);
    }
  }

  createBackgroundSection(index) {
    // Масштаб для заполнения экрана по высоте
    const scale = CONFIG.GAME_HEIGHT / this.textures.bg.height;
    this.sectionWidth = this.textures.bg.width * scale;

    const offsetX = index * this.sectionWidth;
    // Паттерн: 0-оригинал, 1-зеркально
    const isMirrored = index === 1;

    // Создаем фон - чётные секции обычные, нечётные зеркальные
    const bgSprite = new PIXI.Sprite(this.textures.bg);

    if (isMirrored) {
      // Зеркальный фон (отражение по X)
      bgSprite.scale.set(-scale, scale);
      // При отрицательном scale.x нужно сместить позицию на ширину спрайта
      bgSprite.position.set(offsetX + this.sectionWidth, 0);
    } else {
      // Обычный фон
      bgSprite.scale.set(scale, scale);
      bgSprite.position.set(offsetX, 0);
    }

    this.container.addChild(bgSprite);

    console.log(`✅ Секция ${index} создана, offsetX: ${offsetX}, зеркальная: ${isMirrored}`);
  }

  update(delta) {
    if (!this.isReady) return;

    // Двигаем весь контейнер
    this.container.position.x -= this.speed * delta;

    // Когда первая секция полностью ушла влево, сбрасываем позицию на одну секцию
    // Это создает бесшовное зацикливание
    if (this.container.position.x <= -this.sectionWidth) {
      this.container.position.x += this.sectionWidth;
    }
  }
}
