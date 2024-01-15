import { Color3, Material } from '@babylonjs/core';
import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';

import { EngineUtil } from 'src/app/@shared/engine.util';

export class AssetLibrary {

    static isInitialized = false;
    static scene: Scene;
    static textureCache: { [key: string]: Texture } = {};
    static materialCache: { [key: string]: Material } = {};

    static async init(scene: Scene): Promise<void> {
        AssetLibrary.scene = scene;
        if (AssetLibrary.isInitialized)
            return;

        await AssetLibrary._setupMatAndTex(AssetIdentifier.TileDirt, '/assets/art/textures/dirt-tile.png');
        await AssetLibrary._setupMatAndTex(AssetIdentifier.TileGrass, '/assets/art/textures/grass-tile.png');
        AssetLibrary.isInitialized = true;
    }

    static getMaterial(identifier: AssetIdentifier): Material | null {
        if (!AssetLibrary.materialCache[identifier])
            return null;
        return AssetLibrary.materialCache[identifier];
    }

    static getTexture(identifier: AssetIdentifier): Texture | null {
        if (!AssetLibrary.textureCache[identifier])
            return null;
        return AssetLibrary.textureCache[identifier];
    }

    static async _setupMatAndTex(identifier: AssetIdentifier, texturePath: string): Promise<void> {
        const textureDiffuse = await EngineUtil.LoadTextureAsync(texturePath, AssetLibrary.scene);
        AssetLibrary.textureCache[identifier] = textureDiffuse;

        const material = new StandardMaterial(`Mat-${identifier}`, AssetLibrary.scene);
        material.diffuseTexture = textureDiffuse;
        material.specularColor = new Color3(0.3, 0.3, 0.3);
        AssetLibrary.materialCache[identifier] = material;
    }

}

export enum AssetIdentifier {
    TileGrass = 'tileGrass',
    TileDirt = 'tileDirt'
};