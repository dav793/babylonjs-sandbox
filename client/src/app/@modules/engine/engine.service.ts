import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

import { ControlsLabels } from '../game/controls/controls.interface';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;
  fpsChanges$ = new BehaviorSubject<string>("");
  animationGroups$ = new BehaviorSubject<AnimationGroup[]>([]);
  controlLabels$ = new BehaviorSubject<ControlsLabels>({ animation: '', inProgress: false });

  characterModel: ISceneLoaderAsyncResult;
  animationGroup: AnimationGroup;

  private _canvas: ElementRef<HTMLCanvasElement>;
  private _currentFrame: number;
  private _currentFps: number;
  private _isRunningEngine = false;

  constructor() { }

  setupEngine(canvas: ElementRef<HTMLCanvasElement>) {

    this._canvas = canvas;
    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = this.createDefaultScene(this.engine);

    this.runExampleScene();

  } 

  createDefaultScene(engine: Engine): any {
    return new Scene(engine);
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

  runExampleScene() {

    // set light
    const light = new HemisphericLight("myLight", new Vector3(1, 2, -1), this.scene);
    light.intensity = 0.85;

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, new Vector3(0, 1, 0), this.scene);
    camera.radius = 3;
    camera.wheelPrecision = 20;
    camera.attachControl(this._canvas.nativeElement, true);

    // create model
    this.createCharacterModelAsync();
  }

  async createCharacterModelAsync(): Promise<void> {
    this.characterModel = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Male.glb', this.scene);

    const myMaterial = new StandardMaterial('MatMale.main', this.scene);
    myMaterial.diffuseTexture = new Texture('/assets/art/textures/UV_MaleBody_Skin.png', this.scene, true, false);
    myMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    this.characterModel.meshes[1].material = myMaterial;

    this.characterModel.meshes[1].rotation.y = Math.PI;  // rotate 180 deg

    this.animationGroups$.next(this.characterModel.animationGroups);
    this.characterModel.animationGroups[0].stop();  // stop default animation

    // console.log('models: ', this.characterModel);
  }

  startAnimation(value: { uniqueId: number, name: string, loop: boolean }) {

    let animationGroup: AnimationGroup;
    this.characterModel.animationGroups.forEach(elem => {
      elem.stop();
      if (elem.uniqueId === value.uniqueId)
        animationGroup = elem;
    });

    if (!animationGroup) {
      console.error(`Animation '${value.name}' not found.`);
      return;
    }

    animationGroup.play(value.loop);
    this.animationGroup = animationGroup;
    this.controlLabels$.next({ animation: value.name, inProgress: true });

    animationGroup.onAnimationGroupEndObservable.addOnce(() => {
      this.animationGroup = null;
      this.controlLabels$.next({ animation: value.name, inProgress: false });
    });
    
  }

}
