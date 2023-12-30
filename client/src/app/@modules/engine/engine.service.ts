import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { ShadowGenerator, MeshBuilder, Mesh, DirectionalLight, HemisphericLight, Vector3, Color3, Animation, Animatable, CubeTexture } from '@babylonjs/core';
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

  target: Mesh;
  animationFps = 60;
  rotationAnimation: Animatable = null;
  translationAnimation: Animatable = null;

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
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.1, 16, new Vector3(0, 1, 0), this.scene);
    camera.radius = 10;           // initial zoom
    camera.wheelPrecision = 20;   // scroll (zoom) sensitivity
    camera.maxZ = 10000;          // render distance
    camera.attachControl(this._canvas.nativeElement, true);

    // create skybox
    const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
    skyboxMaterial.reflectionTexture = new CubeTexture("/assets/art/skyboxes/TropicalSunnyDay", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;

    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
    skybox.infiniteDistance = true;
    skybox.material = skyboxMaterial;

    // create beach ball
    this.target = MeshBuilder.CreateSphere("sphere", 
      {diameter: 2, segments: 32}, 
      this.scene
    );

    const materialBeachBall = new StandardMaterial('MatBeachBall', this.scene);
    materialBeachBall.diffuseTexture = new Texture('/assets/art/textures/BeachBallTexture1.jpg', this.scene, true, false);
    materialBeachBall.specularColor = new Color3(0.7, 0.7, 0.7);
    this.target.material = materialBeachBall;
    this.target.position.y = 1;
    shadowGenerator.addShadowCaster(this.target, true);  // set mesh that will cast shadows

    // create ground
    const ground = MeshBuilder.CreateGround("ground", 
      {width: 100, height: 100}, 
      this.scene
    );

    const materialSand = new StandardMaterial('MatSand', this.scene);
    materialSand.diffuseTexture = new Texture('/assets/art/textures/SandTexture1.png', this.scene, true, false);
    (materialSand.diffuseTexture as Texture).uScale = 8.0;
    (materialSand.diffuseTexture as Texture).vScale = 8.0;
    materialSand.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = materialSand;
    ground.receiveShadows = true  // set mesh that will have shadows casted on

  }

  animateRotation(): void {

    if (this.rotationAnimation) {
      if (this.rotationAnimation.paused)
        this.rotationAnimation.restart();
      else 
        this.rotationAnimation.pause();
      return;
    }

    const rotateFrames = [
      { frame: 0, value: 0 },
      { frame: 45, value: Math.PI / 2 },              // 90 deg
      { frame: 90, value: Math.PI },                  // 180 deg
      { frame: 135, value: 3 * Math.PI / 2 },         // 270 deg
      { frame: 180, value: 2 * Math.PI }              // 360 deg
    ];
    const rotateAnim = new Animation('rotateAnim', 'rotation.z', this.animationFps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    rotateAnim.setKeys(rotateFrames);
    this.target.animations.push(rotateAnim);

    this.rotationAnimation = this.scene.beginDirectAnimation(this.target, [rotateAnim], 0, 180, true);

  }

  animateTranslation(): void {

    if (this.translationAnimation) {
      if (this.translationAnimation.paused)
        this.translationAnimation.restart();
      else 
        this.translationAnimation.pause();
      return;
    }

    const translateFrames = [
      { frame: 0, value: new Vector3(20, 6, 0) },
      { frame: 90, value: new Vector3(0, 1, 0) },
      { frame: 180, value: new Vector3(-20, 6, 0) }
    ];
    const translateAnim = new Animation('translateAnim', 'position', this.animationFps, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
    translateAnim.setKeys(translateFrames);
    this.target.animations.push(translateAnim);

    this.translationAnimation = this.scene.beginDirectAnimation(this.target, [translateAnim], 0, 180, true);

  }

}
