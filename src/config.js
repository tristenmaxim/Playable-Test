// Конфигурация игры
export const CONFIG = {
  // Размеры экрана
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  
  // Скорости
  BACKGROUND_SCROLL_SPEED: 0.5,
  ENEMY_SPEED: 2,
  COLLECTIBLE_SPEED: 2,
  
  // Физика игрока
  GRAVITY: 0.8,
  JUMP_POWER: -15,
  GROUND_Y: 450, // Y координата земли (поднято выше)
  
  // Игровые параметры
  ENEMY_SPAWN_INTERVAL: 2000, // миллисекунды
  COLLECTIBLE_SPAWN_INTERVAL: 1500,
  
  // UI
  SCORE_INCREMENT: 1, // очки за секунду
  COLLECTIBLE_SCORE: 10, // очки за предмет
  
  // Здоровье
  MAX_HEALTH: 100,
  DAMAGE_ON_COLLISION: 20
};
