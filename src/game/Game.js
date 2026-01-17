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
    
    this.init();
  }
  
  init() {
    // Инициализация PixiJS
    this.app = new PIXI.Application({
      width: CONFIG.GAME_WIDTH,
      height: CONFIG.GAME_HEIGHT,
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true
    });
    
    // Добавляем canvas в DOM
    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.app.view);
    }
    
    // Создаем игровые объекты
    this.background = new Background(this.app);
    this.player = new Player(this.app);
    
    // Обработка клика/тапа для прыжка
    this.app.view.addEventListener('click', () => this.handleJump());
    this.app.view.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleJump();
    });
    
    // Запускаем игровой цикл
    this.start();
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
  
  update(delta) {
    if (!this.isRunning) return;
    
    // Обновляем фон
    if (this.background) {
      this.background.update(delta);
    }
    
    // Обновляем игрока
    if (this.player) {
      this.player.update(delta);
    }
    
    // Увеличиваем счет
    this.score += CONFIG.SCORE_INCREMENT * (delta / 60);
  }
}
