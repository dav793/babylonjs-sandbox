import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject, interval, map, takeUntil, takeWhile } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Color3, AnimationGroup, Animatable, ISceneLoaderAsyncResult } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Inspector } from '@babylonjs/inspector';

import { CharacterModelCollection, CharacterBodySlotModelType } from './character/character-model.model';
import { CharacterModelFactory } from './character/character-model.factory';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;
  
  fpsChanges$ = new BehaviorSubject<string>("");
  characterBodySlotModelTypeNames$ = new BehaviorSubject<string[]>([]);
  animationNames$ = new BehaviorSubject<string[]>([]);
  animationStatus$ = new BehaviorSubject<{ animation: string, inProgress: boolean }>({ animation: '', inProgress: false });

  characterModelFactory: CharacterModelFactory;
  characterModelCollection: CharacterModelCollection;

  private _canvas: ElementRef<HTMLCanvasElement>;
  private _currentFrame: number;
  private _currentFps: number;
  private _isRunningEngine = false;

  constructor() { }

  setupEngine(canvas: ElementRef<HTMLCanvasElement>) {

    this._canvas = canvas;
    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = this.createDefaultScene(this.engine);

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
    const modelIdentifier = 'MyCharacter';
    const equipped = [
      'Male_Skin',
      'Male_Shirt',
      'Male_ButtonShirt_Open',
      'Male_Shorts',
      'Male_Sneakers',
      'Male_BaseballCap'
    ];
    this.characterModelCollection = await this.characterModelFactory.createCharacterModel( modelIdentifier, equipped );
    
    this.animationNames$.next( this.characterModelCollection.animationNames );
    this.characterBodySlotModelTypeNames$.next(
      CharacterBodySlotModelType.getNames()
    );

    this.characterModelCollection.animationChanges$.pipe(
      takeUntil(this.characterModelCollection.onDestroy$)
    ).subscribe(
      animationChanges => this.animationStatus$.next(animationChanges)
    );
  }

  startAnimation(value: { name: string, loop: boolean }) {
    this.characterModelCollection.startAnimation(value.name, value.loop);
  }

  // startAnimation(value: { uniqueId: number, name: string, loop: boolean }) {

  //   let animationGroup: AnimationGroup;
  //   this.characterModel.animationGroups.forEach(elem => {
  //     if (elem !== this.animationGroup)
  //       elem.stop();    // stop all animations (other than current and last)

  //     if (elem.uniqueId === value.uniqueId)
  //       animationGroup = elem;    // find current animation
  //   });

  //   if (!animationGroup) {
  //     console.error(`Animation '${value.name}' not found.`);
  //     return;
  //   }

  //   // blend smoothly between last and current animations 
  //   const fromAnimation = this.animationGroup;
  //   const toAnimation = animationGroup;
  //   let fromWeight = 1.0;
  //   let toWeight = 0.0;
  //   animationGroup.play(value.loop);
  //   animationGroup.setWeightForAllAnimatables(0);

  //   interval(10).pipe(
  //     map(() => fromWeight),
  //     takeWhile(fw => fw > 0.0)
  //   ).subscribe(() => {
  //     if (!fromAnimation) {
  //       fromWeight = 0.0;
  //       toAnimation.setWeightForAllAnimatables(1);
  //       return;
  //     }

  //     fromWeight = fromWeight > 0.0 ? fromWeight - 0.03 : 0;
  //     toWeight = toWeight < 1.0 ? toWeight + 0.03 : 1;

  //     fromAnimation.setWeightForAllAnimatables(fromWeight);
  //     toAnimation.setWeightForAllAnimatables(toWeight);

  //     if (fromWeight === 0.0)
  //       fromAnimation.stop();
  //   })
    
  //   this.animationGroup = animationGroup;
  //   this.controlLabels$.next({ animation: value.name, inProgress: true });

  //   this.animationGroup.onAnimationGroupEndObservable.addOnce(() => {
  //     this.controlLabels$.next({ animation: value.name, inProgress: false });
  //   });
    
  // }

}
