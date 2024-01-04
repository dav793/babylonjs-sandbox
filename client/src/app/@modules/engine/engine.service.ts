import { Injectable, ElementRef  } from '@angular/core';
import { Subject, BehaviorSubject, interval, map, takeUntil, takeWhile } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Color3, Animation, AnimationGroup, Animatable, ISceneLoaderAsyncResult } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Inspector } from '@babylonjs/inspector';

import { 
  CharacterModelCollection,
  CharacterModelOperation, 
  CharacterBodySlot,  
  CharacterBodySlotModels,
  CharacterBodySlotModelType,
  CharacterBodySlotModelTypeDefinition
} from './character/character-model.model';
import { CharacterModelFactory } from './character/character-model.factory';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;
  
  fpsChanges$ = new BehaviorSubject<string>("");
  characterBodySlotModelTypeNames$ = new BehaviorSubject<string[]>([]);
  characterModelStatus$ = new Subject<{ modelName: string, operation: CharacterModelOperation }>();
  animationNames$ = new BehaviorSubject<string[]>([]);
  animationStatus$ = new BehaviorSubject<{ animation: string, inProgress: boolean }>({ animation: '', inProgress: false });

  characterModelFactory: CharacterModelFactory;
  characterModelCollection: CharacterModelCollection;
  characterModelIdentifier = 'MyCharacter';

  private _canvas: ElementRef<HTMLCanvasElement>;
  private _currentFrame: number;
  private _currentFps: number;
  private _isRunningEngine = false;

  constructor() { }

  setupEngine(canvas: ElementRef<HTMLCanvasElement>) {

    this._canvas = canvas;
    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = this.createDefaultScene(this.engine);
    // Animation.AllowMatrixDecomposeForInterpolation = false;
    // Animation.AllowMatricesInterpolation = false;

    this.runDefaultScene();

  } 

  createDefaultScene(engine: Engine): any {
    const scene = new Scene(engine);
    this.characterModelFactory = new CharacterModelFactory(scene);
    return scene;
  }

  resize() {
    this.engine.resize();
  }

  startRenderLoop() {
    if (this._isRunningEngine)
      return; 
    this._isRunningEngine = true;
    this._currentFrame = 0;

    const scene = this.scene;

    this.engine.runRenderLoop(() => {
      scene.render();
      this.updateMetrics();
    });
  }

  showInspector() {
    Inspector.Show(this.scene, {});
  }

  updateMetrics() {
    if (this._currentFrame % 50 === 0) {   // throttle updates to save resources
      this._currentFps = this.engine.getFps();
      if (this._currentFps === Infinity)
        return;

      this.fpsChanges$.next(`FPS: ${this._currentFps.toFixed()}`);
      // this.fpsChanges$.next(`FR: ${this._currentFrame}`);
    }

    this._currentFrame = this._currentFrame > 1000000 ? 0 : this._currentFrame + 1;
  }

  async runDefaultScene() {

    // set light
    const light = new HemisphericLight("myLight", new Vector3(1, 2, -1), this.scene);
    light.intensity = 0.85;

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, new Vector3(0, 1, 0), this.scene);
    camera.radius = 3;
    camera.wheelPrecision = 100;
    camera.attachControl(this._canvas.nativeElement, true);

    // create character model
    const equipped = [
      'Male_Skin',
      'Male_Shirt',
      // 'Male_ButtonShirt_Open',
      'Male_Shorts',
      'Male_Sneakers',
      'Male_BaseballCap'
    ];
    this.characterModelCollection = await this.characterModelFactory.createCharacterModel( this.characterModelIdentifier, equipped );
    
    // emit events
    this.animationNames$.next( this.characterModelCollection.animationNames );
    this.characterBodySlotModelTypeNames$.next(
      CharacterBodySlotModelType.getNames()
    );

    // setup listeners
    this.characterModelCollection.modelChanges$.pipe(
      takeUntil(this.characterModelCollection.onDestroy$),
    ).subscribe(
      modelChanges => this.characterModelStatus$.next(modelChanges)
    );

    this.characterModelCollection.animationChanges$.pipe(
      takeUntil(this.characterModelCollection.onDestroy$)
    ).subscribe(
      animationChanges => this.animationStatus$.next(animationChanges)
    );
  }

  startAnimation(value: { 
    name: string, 
    loop: boolean, 
    blend: boolean 
  }) {
    this.characterModelCollection.startAnimation(this.scene, value.name, value.loop, value.blend);
  }

  async toggleEquippable(modelName: string) {
  
    const modelTypeDef: CharacterBodySlotModelTypeDefinition = CharacterBodySlotModelType.findByName(modelName);
    const bodySlotModels: CharacterBodySlotModels = this.characterModelCollection.bodyParts[modelTypeDef.bodySlot];
    
    if (bodySlotModels.models && bodySlotModels.modelName !== modelName) {
      // slot has a different model; destroy old model and create new one
      const prevModelTypeDef: CharacterBodySlotModelTypeDefinition = CharacterBodySlotModelType.findByName(bodySlotModels.modelName);
      this.characterModelFactory.destroyCollectionModel(prevModelTypeDef, this.characterModelCollection);
      await this.characterModelFactory.createCollectionModel(modelTypeDef, this.characterModelCollection);
    }
    else if (bodySlotModels.models && bodySlotModels.modelName === modelName) 
      this.characterModelFactory.destroyCollectionModel(modelTypeDef, this.characterModelCollection); // slot has same model; destroy model
    else  
      await this.characterModelFactory.createCollectionModel(modelTypeDef, this.characterModelCollection);  // slot is empty; create model
    
    this.characterModelFactory.updateTextures(this.characterModelCollection);
  }

}
