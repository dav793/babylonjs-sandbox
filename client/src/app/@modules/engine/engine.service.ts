import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Vector4, Color3, ShaderMaterial, Camera, MeshBuilder, Tools, Vector2 } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Inspector } from '@babylonjs/inspector';

import { GroundTileLibrary, GroundTileType, UV_Coordinates } from 'src/app/@shared/util/ground-tile-library';

@Injectable()
export class EngineService {

  engine: Engine;
  canvas: ElementRef<HTMLCanvasElement>;
  scene: Scene;
  camera: Camera;
  fpsChanges$ = new BehaviorSubject<string>("");

  private _currentTime: number;
  private _currentFrame: number;
  private _currentFps: number;
  private _isRunningEngine = false;

  constructor() { }

  async setupEngine(canvas: ElementRef<HTMLCanvasElement>) {
    this.canvas = canvas;
    this.engine = new Engine(canvas.nativeElement, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
    this.scene = new Scene(this.engine);
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  resize() {
    this.engine.resize();
  }

  startRenderLoop() {
    if (this._isRunningEngine)
      return; 
    this._isRunningEngine = true;
    this._currentFrame = 0;
    this._currentTime = 0;

    this.engine.runRenderLoop(() => {
      this.scene.render();
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
    this._currentTime += this.engine.getDeltaTime();
  }

}
