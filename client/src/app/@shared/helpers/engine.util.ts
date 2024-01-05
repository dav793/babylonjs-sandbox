import { Texture, Scene, GroundMesh, MeshBuilder } from '@babylonjs/core';

export class EngineUtil {

    static LoadTextureAsync(url: string, scene: Scene): Promise<Texture> {
        return new Promise((resolve, reject) => {
            const tex: Texture = new Texture(url, scene, true, false, Texture.NEAREST_SAMPLINGMODE, 
                () => resolve(tex),
                (error) => reject(error)
            );
        });
    }

    static CreateTextureFromBase64Async(name: string, base64: string, scene: Scene): Promise<Texture> {
        return new Promise((resolve, reject) => {
            const tex: Texture = Texture.CreateFromBase64String(base64, name, scene, false, false, Texture.NEAREST_SAMPLINGMODE,
                () => resolve(tex),
                () => reject()
            );
        });
    }

    static CreateGroundMeshFromHeightmap(name: string, heightmapPath: string, scene: Scene): Promise<GroundMesh> {
        return new Promise(resolve => {
            const ground = MeshBuilder.CreateGroundFromHeightMap(name, heightmapPath, {
                width: 10,
                height: 10,
                minHeight: 0,
                maxHeight: 0.5,
                subdivisions: 200,
                onReady: () => resolve(ground)
            }, scene);
        });
    }

}