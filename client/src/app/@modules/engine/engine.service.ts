import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Vector4, Color3, ShaderMaterial } from '@babylonjs/core';
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

  private _renderer: any;

  private pixelAlignedPanning = true;
  private normalEdgeStrength = 0.3;
  private depthEdgeStrength = 0.4;
  // private pixelSize = 1;
  private pixelSize = 6;
  private width = window.innerWidth;
  private height = window.innerHeight;

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

    this._renderer = this.scene.enableDepthRenderer();

    // create custom model with custom material
    this.createDioramaModelAsync();
  }

  async createDioramaModelAsync(): Promise<void> {
    const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Prop_Diorama_01.glb', this.scene);
    
    // const myMaterial_main = new StandardMaterial('MatDiorama.main', this.scene);
    // myMaterial_main.diffuseTexture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    // myMaterial_main.specularColor = new Color3(0.1, 0.1, 0.1);
    // models.meshes[1].material = myMaterial_main;

    const myMaterial_base = new StandardMaterial('MatDiorama.base', this.scene);
    myMaterial_base.diffuseColor = new Color3(0.5, 0.5, 0.5);  
    models.meshes[2].material = myMaterial_base;

    // const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/default', {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/pixellated', {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection"]
    });

    const resX = this.width / this.pixelSize;
    const resY = this.height / this.pixelSize;
    customShaderMaterial.setVector4("resolution", new Vector4(
      resX,
      resY,
      1 / resX,
      1 / resY
    ));

    customShaderMaterial.setFloat("normalEdgeStrength", this.normalEdgeStrength);
    customShaderMaterial.setFloat("depthEdgeStrength", this.depthEdgeStrength);

    const myDiffuseTex = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    const myDepthTex = this._renderer.getDepthMap();
    const myNormalTex = new Texture('/assets/art/textures/Texture_01_normal.png', this.scene, true, false);
    customShaderMaterial.setTexture("tDiffuse", myDiffuseTex);
    customShaderMaterial.setTexture("tDepth", myDepthTex);
    customShaderMaterial.setTexture("tNormal", myNormalTex);

    // customShaderMaterial.setTexture("textureSampler", new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false));
    models.meshes[1].material = customShaderMaterial;

    // console.log('models: ', models);
  }

}
