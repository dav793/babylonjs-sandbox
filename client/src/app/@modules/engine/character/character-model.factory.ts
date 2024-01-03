import { Engine, Material, SceneLoader, Color3, RawTexture, Constants } from '@babylonjs/core';
import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';

import { EngineUtil } from 'src/app/@shared/helpers/engine.util';

import { 
  CharacterModelCollection, 
  CharacterModelOperation,
  CharacterBodySlot,
  CharacterBodySlotModelType,
  CharacterBodySlotModelTypeDefinition
} from './character-model.model';

export class CharacterModelFactory {

  constructor(
    private scene: Scene
  ) { }

  async createCharacterModel(identifier: string, equipped: string[]): Promise<CharacterModelCollection> {
    const modelCollection = new CharacterModelCollection(identifier);
    
    for (let elem of equipped) {
      const modelTypeDef: CharacterBodySlotModelTypeDefinition = CharacterBodySlotModelType.findByName(elem);
      if (!modelTypeDef)
        throw new Error(`Model type definition '${elem}' does not exist.`);

      await this.createCollectionModel(modelTypeDef, modelCollection);
    }
    await this.updateTextures(modelCollection);

    return modelCollection;
  }

  async createCollectionModel(modelTypeDef: CharacterBodySlotModelTypeDefinition, parent: CharacterModelCollection): Promise<void> {

    const modelIdentifier = `${parent.identifier}.${modelTypeDef.bodySlot}`;
    const collection = parent.bodyParts[ modelTypeDef.bodySlot ];

    collection.modelName = modelTypeDef.name;
    
    collection.models = await SceneLoader.ImportMeshAsync('', `/assets/art/models/${modelTypeDef.modelPath}/`, modelTypeDef.modelFilename, this.scene);
    collection.models.meshes[0].name = modelIdentifier;
    collection.models.meshes[1].rotation.y = Math.PI;   // rotate 180 deg
    collection.models.animationGroups[0].stop();        // stop default animation

    collection.material = new StandardMaterial(modelIdentifier, this.scene);
    collection.material.diffuseTexture = await EngineUtil.LoadTextureAsync(`/assets/art/textures/${modelTypeDef.texturePath}/${modelTypeDef.textureFilename}`, this.scene);
    collection.material.specularColor = new Color3(0.02, 0.02, 0.02);
    collection.models.meshes[1].material = collection.material;

    parent.modelChanges$.next({ modelName: modelTypeDef.name, operation: CharacterModelOperation.Added });

    const activeAnimationName = parent.activeAnimation;
    if (activeAnimationName) {
      // resume active animation

      const baseAnimation = parent.bodyParts[ CharacterBodySlot.Skin ].models.animationGroups.find(anim => anim.name === activeAnimationName);
      const targetAnimation = parent.bodyParts[ modelTypeDef.bodySlot ].models.animationGroups.find(anim => anim.name === activeAnimationName);

      targetAnimation.play(parent.animationChanges$.value.looping);
      targetAnimation.syncAllAnimationsWith(baseAnimation.animatables[0]);
      // const currentFrame = baseAnimation.animatables[0].masterFrame;
      // targetAnimation.goToFrame(currentFrame);
    }
  
  }

  destroyCollectionModel(modelTypeDef: CharacterBodySlotModelTypeDefinition, parent: CharacterModelCollection): void {

    const collection = parent.bodyParts[ modelTypeDef.bodySlot ];
    
    for (let mesh of collection.models.meshes) {
      this.scene.removeMesh(mesh);
    }
    this.scene.removeMaterial(collection.material);
    
    delete parent.bodyParts[ modelTypeDef.bodySlot ];
    parent.bodyParts[ modelTypeDef.bodySlot ] = CharacterModelCollection.CreateEmptyCharacterBodySlotModels();

    parent.modelChanges$.next({ modelName: modelTypeDef.name, operation: CharacterModelOperation.Removed });

  }

  async updateTextures(modelCollection: CharacterModelCollection): Promise<void> {
    
    for (let modelName of modelCollection.modelNames) {
      const modelTypeDef = CharacterBodySlotModelType.findByName(modelName);

      const texturePath = `/assets/art/textures/${modelTypeDef.texturePath}/${modelTypeDef.textureFilename}`;
      const texture = await EngineUtil.LoadTextureAsync(texturePath, this.scene);
      const textureSize = texture.getSize();
      const textureData = new Uint8Array( (await texture.readPixels()).buffer );

      await this.updateTextureData(textureData, modelTypeDef, modelCollection);
      const composedTexture = new RawTexture(textureData, textureSize.width, textureSize.height, Constants.TEXTUREFORMAT_RGBA, this.scene, false, false, Texture.NEAREST_SAMPLINGMODE);
      composedTexture.hasAlpha = true;

      const collection = modelCollection.bodyParts[ modelTypeDef.bodySlot ];
      collection.material.transparencyMode = Material.MATERIAL_ALPHATEST;
      collection.material.useAlphaFromDiffuseTexture = true;
      collection.material.diffuseTexture = composedTexture;
    }

  }

  private async updateTextureData(textureData: Uint8Array, modelTypeDef: CharacterBodySlotModelTypeDefinition, parent: CharacterModelCollection): Promise<void> {

    const alphaMaps = parent.modelNames
      .map(comparingModelName => {
        if (comparingModelName === modelTypeDef.name)
          return [];

        const comparingDef = CharacterBodySlotModelType.findByName(comparingModelName);
        if ( !(comparingDef.bodySlot in modelTypeDef.alphaMaps) )
          return [];
        
        return modelTypeDef.alphaMaps[ comparingDef.bodySlot ]
          .filter(alphaMap => alphaMap.applyWith.includes(comparingModelName))
      })
      .flat();

    if (alphaMaps.length === 0)
      return;

    for (let alphaMap of alphaMaps) {
      const alphaMapTexPath = `/assets/art/textures/${alphaMap.texturePath}/${alphaMap.textureFilename}`;
      const alphaMapTex = await EngineUtil.LoadTextureAsync(alphaMapTexPath, this.scene);
      const alphaMapData = new Uint8Array( (await alphaMapTex.readPixels()).buffer );

      this.composePixelDataWithAlphaMap(textureData, alphaMapData);
    }

  }

  private composePixelDataWithAlphaMap(sourcePixels: Uint8Array, alphaMapPixels: Uint8Array): void {
    for (let i = 3; i < sourcePixels.length; i += 4) {
      if (alphaMapPixels[i] < 255)
        sourcePixels[i] = alphaMapPixels[i];
    }
    // see example: https://playground.babylonjs.com/#5IWPL7
  }

}
