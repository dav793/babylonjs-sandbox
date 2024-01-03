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

    return modelCollection;
  }

  destroyCollectionModel(modelTypeDef: CharacterBodySlotModelTypeDefinition, parent: CharacterModelCollection): void {

    const collection = parent.bodyParts[ modelTypeDef.bodySlot ];
    
    for (let mesh of collection.models.meshes) {
      this.scene.removeMesh(mesh);
    }
    this.scene.removeMaterial(collection.material);
    
    delete parent.bodyParts[ modelTypeDef.bodySlot ];
    parent.bodyParts[ modelTypeDef.bodySlot ] = { models: null, material: null };

    parent.modelChanges$.next({ modelName: modelTypeDef.name, operation: CharacterModelOperation.Removed });

  }

  async createCollectionModel(modelTypeDef: CharacterBodySlotModelTypeDefinition, parent: CharacterModelCollection): Promise<void> {

    const modelIdentifier = `${parent.identifier}.${modelTypeDef.bodySlot}`;
    const collection = parent.bodyParts[ modelTypeDef.bodySlot ];
    
    collection.models = await SceneLoader.ImportMeshAsync('', `/assets/art/models/${modelTypeDef.modelPath}/`, modelTypeDef.modelFilename, this.scene);
    collection.models.meshes[0].name = modelIdentifier;
    collection.models.meshes[1].rotation.y = Math.PI;   // rotate 180 deg
    collection.models.animationGroups[0].stop();        // stop default animation

    collection.material = new StandardMaterial(modelIdentifier, this.scene);
    
    if (Object.keys(modelTypeDef.alphaMaps).length > 0) {
      
      const diffuseTexture: Texture = await EngineUtil.LoadTextureAsync(`/assets/art/textures/${modelTypeDef.texturePath}/${modelTypeDef.textureFilename}`, this.scene);
      const textureSize = diffuseTexture.getSize();

      const bodyPart = Object.keys(modelTypeDef.alphaMaps)[0];
      const entry = modelTypeDef.alphaMaps[bodyPart][0];
      const alphaMap: Texture = await EngineUtil.LoadTextureAsync(`/assets/art/textures/${entry.texturePath}/${entry.textureFilename}`, this.scene);

      const diffuseView = await diffuseTexture.readPixels();
      const diffuseData = new Uint8Array(diffuseView.buffer);

      const alphaMapView = await alphaMap.readPixels();
      const alphaMapData = new Uint8Array(alphaMapView.buffer);

      for (let i = 3; i < diffuseData.length; i += 4) {
        if (alphaMapData[i] < 255)
          diffuseData[i] = alphaMapData[i];
      }
      // see example: https://playground.babylonjs.com/#5IWPL7

      // const composedTexture = RawTexture.CreateRGBATexture(diffuseData, textureSize.width, textureSize.height, this.scene, false, false, Texture.NEAREST_SAMPLINGMODE);
      const composedTexture = new RawTexture(diffuseData, textureSize.width, textureSize.height, Constants.TEXTUREFORMAT_RGBA, this.scene, false, false, Texture.NEAREST_SAMPLINGMODE);
      composedTexture.hasAlpha = true;

      collection.material.transparencyMode = Material.MATERIAL_ALPHATEST;
      collection.material.useAlphaFromDiffuseTexture = true;
      collection.material.diffuseTexture = composedTexture;
    }
    else
      collection.material.diffuseTexture = new Texture(`/assets/art/textures/${modelTypeDef.texturePath}/${modelTypeDef.textureFilename}`, this.scene, true, false);

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

}
