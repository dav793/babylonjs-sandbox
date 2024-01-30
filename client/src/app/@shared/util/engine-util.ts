import { Texture, Scene, Vector2, Material, StandardMaterial, Color3 } from '@babylonjs/core';

export class EngineUtil {

    static LoadTextureAsync(url: string, scene: Scene, options?: {hasAlpha?: boolean}): Promise<Texture> {
        return new Promise((resolve, reject) => {
            if (Cache.textures[url])
                resolve(Cache.textures[url]);
            else {
                const tex: Texture = new Texture(url, scene, true, false, Texture.NEAREST_SAMPLINGMODE, 
                    () => {
                        Cache.textures[url] = tex;
                        if (options && options.hasAlpha)
                            tex.hasAlpha = true;
                        resolve(tex);
                    },
                    (error) => reject(error)
                );
            }
        });
    }

    static LoadTerrainMaterialAsync(id: string, textureUrl: string, scene: Scene): Promise<Material> {
        return new Promise((resolve, reject) => {
            if (Cache.materials[id])
                resolve(Cache.materials[id]);
            else {
                EngineUtil.LoadTextureAsync(textureUrl, scene, { hasAlpha: true }).then(tex => {
                    const mat = new StandardMaterial(id, scene);
                    mat.diffuseTexture = tex;
                    mat.specularColor = new Color3(0.1, 0.1, 0.1);
                    mat.transparencyMode = Material.MATERIAL_ALPHATEST;
                    mat.alphaCutOff = 0.9;
                    mat.useAlphaFromDiffuseTexture = true;

                    Cache.materials[id] = mat;
                    resolve(mat);
                });
            }
        });        
    }

}

class Cache {
    static textures: { [key: string]: Texture } = {};
    static materials: { [key: string]: Material } = {};
}

export interface UV_Corner {
    topLeft: Vector2,
    bottomRight: Vector2
};

export enum CardinalDirection {
    N = 0,
    NE = 1,
    E = 2,
    SE = 3,
    S = 4,
    SW = 5,
    W = 6,
    NW = 7
}