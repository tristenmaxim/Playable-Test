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
      // Загружаем все текстуры параллельно
      const [bgTexture, tree1, tree2, bush1, bush2, bush3, streetlamp] = await Promise.all([
        PIXI.Assets.load('assets/images/background.png'),
        PIXI.Assets.load('assets/images/tree_1.png'),
        PIXI.Assets.load('assets/images/tree_2.png'),
        PIXI.Assets.load('assets/images/bush_1.png'),
        PIXI.Assets.load('assets/images/bush_2.png'),
        PIXI.Assets.load('assets/images/bush_3.png'),
        PIXI.Assets.load('assets/images/streetlamp.png')
      ]);

      console.log('✅ Все текстуры загружены');

      // Сохраняем текстуры для использования
      this.textures = {
        bg: bgTexture,
        trees: [tree1, tree2],
        bushes: [bush1, bush2, bush3],
        streetlamp
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

    // Добавляем элементы на одной линии (одна высота Y)
    // Порядок по глубине: кусты (ближе), фонари, деревья (дальше)
    const elementOffsetX = isMirrored ? offsetX + this.sectionWidth : offsetX;
    const bgScale = scale;
    
    // Добавляем элементы в правильном порядке (сначала дальние, потом ближние)
    this.addTreesToSection(elementOffsetX, bgScale, isMirrored);
    this.addLampsToSection(elementOffsetX, bgScale, isMirrored);
    this.addBushesToSection(elementOffsetX, bgScale, isMirrored);

    console.log(`✅ Секция ${index} создана, offsetX: ${offsetX}, зеркальная: ${isMirrored}`);
  }

  addTreesToSection(offsetX, bgScale, mirrored = false) {
    // Деревья - дальше всего, на одной линии с остальными элементами
    const groundY = CONFIG.GAME_HEIGHT * 0.54;
    const treePositions = [100, 300, 500, 700, 900, 1100, 1300, 1500];
    const treeScale = 0.65;

    treePositions.forEach((x, i) => {
      const texture = this.textures.trees[i % this.textures.trees.length];
      const sprite = new PIXI.Sprite(texture);

      if (mirrored) {
        sprite.scale.set(-treeScale, treeScale);
        const mirroredX = this.sectionWidth - (x * bgScale);
        sprite.position.set(offsetX - mirroredX, groundY);
      } else {
        sprite.scale.set(treeScale, treeScale);
        sprite.position.set(offsetX + x * bgScale, groundY);
      }

      sprite.anchor.set(0.5, 1);
      this.container.addChild(sprite);
    });
  }

  addLampsToSection(offsetX, bgScale, mirrored = false) {
    // Фонари - средний план, на той же высоте что и деревья
    const lampY = CONFIG.GAME_HEIGHT * 0.54;
    const lampPositions = [200, 600, 1000, 1400];
    const lampScale = 0.55;

    lampPositions.forEach((x) => {
      const sprite = new PIXI.Sprite(this.textures.streetlamp);

      if (mirrored) {
        sprite.scale.set(-lampScale, lampScale);
        const mirroredX = this.sectionWidth - (x * bgScale);
        sprite.position.set(offsetX - mirroredX, lampY);
      } else {
        sprite.scale.set(lampScale, lampScale);
        sprite.position.set(offsetX + x * bgScale, lampY);
      }

      sprite.anchor.set(0.5, 1);
      this.container.addChild(sprite);
    });
  }

  addBushesToSection(offsetX, bgScale, mirrored = false) {
    // Кусты - ближе всего, на той же высоте что и остальные элементы
    const bushY = CONFIG.GAME_HEIGHT * 0.54;
    const bushPositions = [50, 200, 350, 500, 650, 800, 950, 1100, 1250, 1400];
    const bushScale = 0.45;

    bushPositions.forEach((x, i) => {
      const texture = this.textures.bushes[i % this.textures.bushes.length];
      const sprite = new PIXI.Sprite(texture);

      if (mirrored) {
        sprite.scale.set(-bushScale, bushScale);
        const mirroredX = this.sectionWidth - (x * bgScale);
        sprite.position.set(offsetX - mirroredX, bushY);
      } else {
        sprite.scale.set(bushScale, bushScale);
        sprite.position.set(offsetX + x * bgScale, bushY);
      }

      sprite.anchor.set(0.5, 1);
      this.container.addChild(sprite);
    });
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
