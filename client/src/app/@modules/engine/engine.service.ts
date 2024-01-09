import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Vector4, Color3, Camera, MeshBuilder } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Inspector } from '@babylonjs/inspector';

import { AssetLibrary } from './asset-library';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;
  camera: Camera;
  fpsChanges$ = new BehaviorSubject<string>("");

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
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, Vector3.Zero(), this.scene);
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(this._canvas.nativeElement, true);
    this.camera = camera;

    this.createSceneObjectsAsync();
  }

  async createSceneObjectsAsync(): Promise<void> {

    await AssetLibrary.init(this.scene);

    const plane = MeshBuilder.CreatePlane("plane", { size: 1 }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane
    plane.material = AssetLibrary.getMaterial('Footpath-Tile');

    // @todo: create thin instances

  }

}
