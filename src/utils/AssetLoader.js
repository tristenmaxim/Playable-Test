/**
 * Утилита для загрузки ассетов
 */
export class AssetLoader {
  static async loadTexture(url) {
    return new Promise((resolve, reject) => {
      const texture = PIXI.Texture.from(url);
      
      if (texture.baseTexture.valid) {
        resolve(texture);
      } else {
        texture.baseTexture.on('loaded', () => resolve(texture));
        texture.baseTexture.on('error', (error) => reject(error));
      }
    });
  }
  
  static async loadImage(url) {
    return this.loadTexture(url);
  }
}
