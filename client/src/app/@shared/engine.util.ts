import { Texture, Scene } from '@babylonjs/core';

export class EngineUtil {

    static LoadTextureAsync(url: string, scene: Scene): Promise<Texture> {
        return new Promise((resolve, reject) => {
            const tex: Texture = new Texture(url, scene, true, false, Texture.BILINEAR_SAMPLINGMODE,
                () => resolve(tex),
                (error) => reject(error)
            );
        });
    }

}