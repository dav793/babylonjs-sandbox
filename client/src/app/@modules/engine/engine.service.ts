import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, ShadowGenerator, MeshBuilder, DirectionalLight, HemisphericLight, Vector3, Color3 } from '@babylonjs/core';
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

    // set hemispheric light
    const hLight = new HemisphericLight("hemisphericLight", new Vector3(-2, 2, -2), this.scene);
    hLight.intensity = 0.8;

    // set directional light
    const dLightDirection = new Vector3(20, -20, 20);
    const dLight = new DirectionalLight("directionalLight", dLightDirection, this.scene);
    dLight.position = new Vector3(0, 15, -30);
    dLight.intensity = 0.4;

    // create shadow generator
    const shadowGenerator = new ShadowGenerator(1024, dLight);

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, new Vector3(0, 1, 0), this.scene);
    camera.radius = 10;
    camera.wheelPrecision = 20;
    camera.attachControl(this._canvas.nativeElement, true);

    // create beach ball
    const sphere = MeshBuilder.CreateSphere("sphere", 
      {diameter: 2, segments: 32}, 
      this.scene
    );

    const materialBeachBall = new StandardMaterial('MatBeachBall', this.scene);
    materialBeachBall.diffuseTexture = new Texture('/assets/art/textures/BeachBallTexture1.jpg', this.scene, true, false);
    materialBeachBall.specularColor = new Color3(0.7, 0.7, 0.7);
    sphere.material = materialBeachBall;
    sphere.position.y = 1;
    shadowGenerator.addShadowCaster(sphere, true);  // set mesh that will cast shadows

    // create ground
    const ground = MeshBuilder.CreateGround("ground", 
      {width: 20, height: 20}, 
      this.scene
    );

    const materialSand = new StandardMaterial('MatSand', this.scene);
    materialSand.diffuseTexture = new Texture('/assets/art/textures/SandTexture1.png', this.scene, true, false);
    materialSand.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = materialSand;
    ground.receiveShadows = true  // set mesh that will have shadows casted on

    // set animations

  }

}
