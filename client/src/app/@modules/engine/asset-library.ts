import { Vector3, Vector4, Color3, ShaderMaterial, MeshBuilder, Material } from '@babylonjs/core';
import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';

import { EngineUtil } from 'src/app/@shared/engine.util';

export class AssetLibrary {

    static isInitialized = false;
    static scene: Scene;
    static textureCache: { [key: string]: TextureArtifacts } = {};
    static materialCache: { [key: string]: Material } = {};

    static async init(scene: Scene): Promise<void> {
        AssetLibrary.scene = scene;
        if (AssetLibrary.isInitialized)
            return;

        await AssetLibrary._setup_Footpath_Tile();
        AssetLibrary.isInitialized = true;
    }

    static getMaterial(identifier: string): Material | null {
        if (!AssetLibrary.materialCache[identifier])
            return null;
        return AssetLibrary.materialCache[identifier];
    }

    static getTexture(identifier: string): TextureArtifacts | null {
        if (!AssetLibrary.textureCache[identifier])
            return null;
        return AssetLibrary.textureCache[identifier];
    }

    static async _setup_Footpath_Tile(): Promise<void> {
        const identifier = 'Footpath-Tile';

        const textureDiffuse = await EngineUtil.LoadTextureAsync('/assets/art/textures/Footpath_Tiles_Texture_01.png', AssetLibrary.scene);
        const textureNormals = await EngineUtil.LoadTextureAsync('/assets/art/textures/Footpath_Tiles_Normals_01.png', AssetLibrary.scene);
        AssetLibrary.textureCache[identifier] = { diffuse: textureDiffuse, normals: textureNormals };

        const material = new StandardMaterial(`Mat-${identifier}`, AssetLibrary.scene);
        material.diffuseTexture = textureDiffuse;
        // material.bumpTexture = textureNormals;
        material.specularColor = new Color3(0.3, 0.3, 0.3);
        AssetLibrary.materialCache[identifier] = material;
    }

}

export interface TextureArtifacts {
    diffuse?: Texture,
    normals?: Texture
}
