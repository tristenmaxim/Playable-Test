import { CONFIG } from '../config.js';

/**
 * Класс игрока с анимациями idle, run, jump
 */
export class Player {
  // Координаты кадров анимаций из референса (atlas-упаковка)
  static IDLE_FRAMES = [
    { x: 301, y: 245, w: 128, h: 254 },
    { x: 283, y: 746, w: 128, h: 254 },
    { x: 413, y: 746, w: 128, h: 254 },
    { x: 671, y: 469, w: 128, h: 254 },
    { x: 673, y: 725, w: 128, h: 254 },
    { x: 1, y: 1244, w: 129, h: 255 },
    { x: 691, y: 208, w: 129, h: 255 },
    { x: 535, y: 1002, w: 128, h: 255 },
    { x: 431, y: 214, w: 128, h: 256 },
    { x: 561, y: 211, w: 128, h: 256 },
    { x: 132, y: 1244, w: 128, h: 256 },
    { x: 541, y: 472, w: 128, h: 255 },
    { x: 404, y: 1002, w: 129, h: 255 },
    { x: 543, y: 729, w: 128, h: 255 },
    { x: 803, y: 465, w: 128, h: 254 },
    { x: 803, y: 721, w: 128, h: 254 },
    { x: 803, y: 977, w: 128, h: 254 },
    { x: 673, y: 981, w: 128, h: 254 }
  ];

  static RUN_FRAMES = [
    { x: 1, y: 491, w: 149, h: 246 },
    { x: 412, y: 501, w: 127, h: 243 },
    { x: 524, y: 1259, w: 128, h: 246 },
    { x: 1, y: 991, w: 135, h: 251 },
    { x: 171, y: 1, w: 160, h: 242 },
    { x: 138, y: 998, w: 132, h: 243 },
    { x: 665, y: 1237, w: 128, h: 249 },
    { x: 146, y: 748, w: 135, h: 248 }
  ];

  static JUMP_FRAMES = [
    { x: 803, y: 1233, w: 128, h: 252 },
    { x: 394, y: 1259, w: 128, h: 242 },
    { x: 170, y: 246, w: 129, h: 243 },
    { x: 272, y: 1002, w: 130, h: 251 },
    { x: 333, y: 1, w: 169, h: 211 },
    { x: 504, y: 1, w: 169, h: 208 },
    { x: 675, y: 1, w: 167, h: 205 },
    { x: 262, y: 1255, w: 130, h: 246 },
    { x: 394, y: 1259, w: 128, h: 242 },
    { x: 282, y: 501, w: 128, h: 243 }
  ];

  constructor(app) {
    this.app = app;
    this.sprite = null;
    this.velocityY = 0;
    this.isOnGround = true;

    // Состояние игрока: 'idle', 'running', 'jumping'
    this.state = 'idle';
    this.gameStarted = false;

    // Анимации
    this.animations = {
      idle: null,
      run: null,
      jump: null
    };

    // init теперь асинхронный
    this.init().catch(error => {
      console.error('Ошибка инициализации игрока:', error);
    });
  }

  async init() {
    // Позиция игрока
    this.initialX = 100;
    this.initialY = CONFIG.GROUND_Y;

    // Загружаем текстуру и создаём анимации
    await this.loadTexture();
  }

  async loadTexture() {
    try {
      const texture = await PIXI.Assets.load('assets/images/hero.png');
      console.log('✅ Текстура героя загружена, размер:', texture.width, 'x', texture.height);

      // Создаём все анимации
      await this.createAnimations(texture);
    } catch (error) {
      console.error('❌ Ошибка загрузки текстуры героя:', error);
    }
  }

  /**
   * Создаёт все анимации из спрайт-листа
   */
  async createAnimations(texture) {
    console.log('=== Создание анимаций (idle: 18, run: 8, jump: 10 кадров) ===');

    // Собираем все кадры в один spritesheet
    const spritesheetData = {
      frames: {},
      meta: {
        image: 'assets/images/hero.png',
        size: { w: 932, h: 1506 },
        scale: 1
      }
    };

    // Добавляем idle кадры
    Player.IDLE_FRAMES.forEach((f, i) => {
      spritesheetData.frames[`idle_${i}`] = {
        frame: { x: f.x, y: f.y, w: f.w, h: f.h },
        sourceSize: { w: f.w, h: f.h },
        spriteSourceSize: { x: 0, y: 0, w: f.w, h: f.h }
      };
    });

    // Добавляем run кадры
    Player.RUN_FRAMES.forEach((f, i) => {
      spritesheetData.frames[`run_${i}`] = {
        frame: { x: f.x, y: f.y, w: f.w, h: f.h },
        sourceSize: { w: f.w, h: f.h },
        spriteSourceSize: { x: 0, y: 0, w: f.w, h: f.h }
      };
    });

    // Добавляем jump кадры
    Player.JUMP_FRAMES.forEach((f, i) => {
      spritesheetData.frames[`jump_${i}`] = {
        frame: { x: f.x, y: f.y, w: f.w, h: f.h },
        sourceSize: { w: f.w, h: f.h },
        spriteSourceSize: { x: 0, y: 0, w: f.w, h: f.h }
      };
    });

    try {
      // Создаем Spritesheet
      const spritesheet = new PIXI.Spritesheet(texture, spritesheetData);
      await spritesheet.parse();

      console.log('✅ Spritesheet создан, текстуры:', Object.keys(spritesheet.textures).length);

      // Собираем текстуры для каждой анимации
      this.animations.idle = this.getFrameTextures(spritesheet, 'idle', Player.IDLE_FRAMES.length);
      this.animations.run = this.getFrameTextures(spritesheet, 'run', Player.RUN_FRAMES.length);
      this.animations.jump = this.getFrameTextures(spritesheet, 'jump', Player.JUMP_FRAMES.length);

      console.log(`✅ Анимации: idle=${this.animations.idle.length}, run=${this.animations.run.length}, jump=${this.animations.jump.length}`);

      // Создаём AnimatedSprite с idle анимацией
      this.sprite = new PIXI.AnimatedSprite(this.animations.idle);
      this.sprite.animationSpeed = 0.12;
      this.sprite.loop = true;
      this.sprite.play();

      console.log('✅ Игрок создан в состоянии idle');

    } catch (error) {
      console.error('❌ Ошибка создания Spritesheet:', error);
      this.sprite = new PIXI.Sprite(texture);
    }

    this.setupSprite();
  }

  /**
   * Получает текстуры кадров для анимации
   */
  getFrameTextures(spritesheet, prefix, count) {
    const frames = [];
    for (let i = 0; i < count; i++) {
      const frameTexture = spritesheet.textures[`${prefix}_${i}`];
      if (frameTexture) {
        frames.push(frameTexture);
      }
    }
    return frames;
  }

  setupSprite() {
    if (!this.sprite) return;

    // Настраиваем размер (примерно 80 пикселей в высоту)
    const targetHeight = 80;
    const scale = targetHeight / (this.sprite.height || 80);
    this.sprite.scale.set(scale, scale);

    // Позиция и якорь
    this.sprite.x = this.initialX || 100;
    this.sprite.y = this.initialY || CONFIG.GROUND_Y;
    this.sprite.anchor.set(0.5, 1);

    // Добавляем на сцену
    this.app.stage.addChild(this.sprite);

    console.log('✅ Спрайт героя настроен, размер:', this.sprite.width, 'x', this.sprite.height);
  }

  /**
   * Переключение анимации
   */
  setAnimation(name) {
    if (!this.sprite || !this.animations[name]) return;
    if (this.state === name) return;

    const oldState = this.state;
    this.state = name;

    // Сохраняем текущий масштаб и позицию
    const scaleX = this.sprite.scale.x;
    const scaleY = this.sprite.scale.y;
    const x = this.sprite.x;
    const y = this.sprite.y;

    // Меняем текстуры
    this.sprite.textures = this.animations[name];

    // Настройки анимации в зависимости от состояния
    if (name === 'idle') {
      this.sprite.animationSpeed = 0.12;
      this.sprite.loop = true;
    } else if (name === 'run') {
      this.sprite.animationSpeed = 0.2;
      this.sprite.loop = true;
    } else if (name === 'jump') {
      this.sprite.animationSpeed = 0.25;
      this.sprite.loop = false;
    }

    // Восстанавливаем масштаб и позицию
    this.sprite.scale.set(scaleX, scaleY);
    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.gotoAndPlay(0);
    console.log(`Анимация: ${oldState} → ${name}`);
  }

  /**
   * Запуск игры (первое нажатие)
   */
  startRunning() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.setAnimation('run');
    console.log('🏃 Игрок начал бежать!');
  }

  jump() {
    if (!this.sprite) return;

    // Первое нажатие запускает бег
    if (!this.gameStarted) {
      this.startRunning();
    }

    if (this.isOnGround) {
      this.velocityY = CONFIG.JUMP_POWER;
      this.isOnGround = false;
      this.setAnimation('jump');
    }
  }

  update(delta) {
    if (!this.sprite) return;

    // Если игра ещё не началась, ничего не делаем с физикой
    if (!this.gameStarted) return;

    // Применяем гравитацию
    this.velocityY += CONFIG.GRAVITY * delta;

    // Обновляем позицию
    this.sprite.y += this.velocityY * delta;

    // Проверка земли
    if (this.sprite.y >= CONFIG.GROUND_Y) {
      this.sprite.y = CONFIG.GROUND_Y;
      this.velocityY = 0;

      // Если приземлились после прыжка, переключаемся на бег
      if (!this.isOnGround) {
        this.isOnGround = true;
        this.setAnimation('run');
      }
    }
  }

  getBounds() {
    if (!this.sprite) return null;
    return this.sprite.getBounds();
  }
}
