import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Color3 } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Inspector } from '@babylonjs/inspector';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;
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
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, new Vector3(0, 1, 0), this.scene);
    camera.radius = 3;
    camera.wheelPrecision = 20;
    camera.attachControl(this._canvas.nativeElement, true);

    // create model
    this.createCharacterModelAsync();
  }

  async createCharacterModelAsync(): Promise<void> {
    const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Male.glb', this.scene);

    const myMaterial = new StandardMaterial('MatMale.main', this.scene);
    myMaterial.diffuseTexture = new Texture('/assets/art/textures/UV_MaleBody_Skin.png', this.scene, true, false);
    myMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    models.meshes[1].material = myMaterial;

    models.meshes[1].rotation.y = Math.PI;  // rotate 180 deg

    console.log('models: ', models);
  }

}
