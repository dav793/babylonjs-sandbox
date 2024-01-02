import { SceneLoader, Color3 } from '@babylonjs/core';
import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';

import { CharacterModelCollection, CharacterBodySlot } from './character-model.model';

export class CharacterModelFactory {

  constructor(
    private scene: Scene
  ) { }

  async createCharacterModel(identifier: string): Promise<CharacterModelCollection> {
    const modelCollection = new CharacterModelCollection(identifier);
    
    const identifierSkin = `${modelCollection.identifier}.${CharacterBodySlot.Skin}`;
    await this.createCollection_Skin(identifierSkin, modelCollection);

    const identifierLegs = `${modelCollection.identifier}.${CharacterBodySlot.Legs}`;
    await this.createCollection_Legs(identifierLegs, modelCollection);

    const identifierTorsoUnder = `${modelCollection.identifier}.${CharacterBodySlot.Torso_Under}`;
    await this.createCollection_TorsoUnder(identifierTorsoUnder, modelCollection);

    const identifierFeet = `${modelCollection.identifier}.${CharacterBodySlot.Feet}`;
    await this.createCollection_Feet(identifierFeet, modelCollection);

    return modelCollection;
  }

  private async createCollection_Skin(identifier: string, parent: CharacterModelCollection): Promise<void> {
    const skinCollection = parent.bodyParts[ CharacterBodySlot.Skin ];

    skinCollection.models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/characters/Male/', 'MaleBody.glb', this.scene);
    skinCollection.models.meshes[1].rotation.y = Math.PI;   // rotate 180 deg
    skinCollection.models.animationGroups[0].stop();        // stop default animation

    skinCollection.material = new StandardMaterial(identifier, this.scene);
    skinCollection.material.diffuseTexture = new Texture('/assets/art/textures/characters/Male/UV_MaleBody_Skin_256.jpg', this.scene, true, false);
    skinCollection.material.specularColor = new Color3(0.02, 0.02, 0.02);
    skinCollection.models.meshes[1].material = skinCollection.material;
  }

  private async createCollection_Legs(identifier: string, parent: CharacterModelCollection): Promise<void> {
    const legsCollection = parent.bodyParts[ CharacterBodySlot.Legs ];

    legsCollection.models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/characters/Male/', 'MaleBody_Pants.glb', this.scene);
    legsCollection.models.meshes[1].rotation.y = Math.PI;   // rotate 180 deg
    legsCollection.models.animationGroups[0].stop();        // stop default animation

    legsCollection.material = new StandardMaterial(identifier, this.scene);
    legsCollection.material.diffuseTexture = new Texture('/assets/art/textures/characters/Male/UV_MaleBody_Pants_256.jpg', this.scene, true, false);
    legsCollection.material.specularColor = new Color3(0.02, 0.02, 0.02);
    legsCollection.models.meshes[1].material = legsCollection.material;
  }

  private async createCollection_TorsoUnder(identifier: string, parent: CharacterModelCollection): Promise<void> {
    const torsoUnderCollection = parent.bodyParts[ CharacterBodySlot.Torso_Under ];
    
    torsoUnderCollection.models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/characters/Male/', 'MaleBody_Shirt.glb', this.scene);
    torsoUnderCollection.models.meshes[1].rotation.y = Math.PI;   // rotate 180 deg
    torsoUnderCollection.models.animationGroups[0].stop();        // stop default animation

    torsoUnderCollection.material = new StandardMaterial(identifier, this.scene);
    torsoUnderCollection.material.diffuseTexture = new Texture('/assets/art/textures/characters/Male/UV_MaleBody_Shirt_256.jpg', this.scene, true, false);
    torsoUnderCollection.material.specularColor = new Color3(0.02, 0.02, 0.02);
    torsoUnderCollection.models.meshes[1].material = torsoUnderCollection.material;
  }

  private async createCollection_Feet(identifier: string, parent: CharacterModelCollection): Promise<void> {
    const feetCollection = parent.bodyParts[ CharacterBodySlot.Feet ];
    
    feetCollection.models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/characters/Male/', 'MaleBody_Sneakers.glb', this.scene);
    feetCollection.models.meshes[1].rotation.y = Math.PI;   // rotate 180 deg
    feetCollection.models.animationGroups[0].stop();        // stop default animation

    feetCollection.material = new StandardMaterial(identifier, this.scene);
    feetCollection.material.diffuseTexture = new Texture('/assets/art/textures/characters/Male/UV_MaleBody_Sneakers_256.jpg', this.scene, true, false);
    feetCollection.material.specularColor = new Color3(0.02, 0.02, 0.02);
    feetCollection.models.meshes[1].material = feetCollection.material;
  }

}
