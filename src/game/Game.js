import { CONFIG } from '../config.js';
import { Background } from './Background.js';
import { Player } from './Player.js';

/**
 * Главный класс игры
 */
export class Game {
  constructor() {
    this.app = null;
    this.background = null;
    this.player = null;
    this.isRunning = false;
    this.score = 0;
    
    // init теперь асинхронный
    this.init().catch(error => {
      console.error('Критическая ошибка инициализации:', error);
    });
  }
  
  async init() {
    console.log('Инициализация игры...');
    
    try {
      // Инициализация PixiJS v8
      // В v8 нужно использовать new Application() и дождаться готовности через init()
      this.app = new PIXI.Application();
      
      await this.app.init({
        width: CONFIG.GAME_WIDTH,
        height: CONFIG.GAME_HEIGHT,
        backgroundColor: 0x1a1a2e,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true
      });
      
      console.log('PixiJS Application создан');
      
      // Добавляем canvas в DOM
      const container = document.getElementById('game-container');
      if (container) {
        // В PixiJS v8 используется app.canvas
        container.appendChild(this.app.canvas);
        console.log('Canvas добавлен в DOM');
      } else {
        console.error('Контейнер game-container не найден!');
        return;
      }
      
      // Создаем игровые объекты
      // ВРЕМЕННО: только фон для отладки
      this.background = new Background(this.app);
      // this.player = new Player(this.app); // Временно отключен
      
      // Обработка клика/тапа для прыжка
      // this.app.canvas.addEventListener('click', () => this.handleJump()); // Временно отключен
      // this.app.canvas.addEventListener('touchstart', (e) => {
      //   e.preventDefault();
      //   this.handleJump();
      // });
      
      // Запускаем игровой цикл
      this.start();
      console.log('Игра запущена');
    } catch (error) {
      console.error('Ошибка инициализации игры:', error);
    }
  }
  
  handleJump() {
    if (this.player) {
      this.player.jump();
    }
  }
  
  start() {
    this.isRunning = true;
    this.app.ticker.add(this.update, this);
  }
  
  stop() {
    this.isRunning = false;
    this.app.ticker.remove(this.update, this);
  }
  
  update(ticker) {
    if (!this.isRunning) return;

    // В PixiJS v8 ticker передает объект Ticker, а не delta напрямую
    const delta = ticker.deltaTime;

    // Обновляем фон
    if (this.background) {
      this.background.update(delta);
    }

    // Обновляем игрока (временно отключен)
    // if (this.player) {
    //   this.player.update(delta);
    // }

    // Увеличиваем счет
    this.score += CONFIG.SCORE_INCREMENT * (delta / 60);
  }
}
