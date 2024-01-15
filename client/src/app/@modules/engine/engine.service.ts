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

import { GroundTileLibrary, GroundTileType } from './ground-tile-library';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;
  camera: Camera;
  fpsChanges$ = new BehaviorSubject<string>("");

  private _canvas: ElementRef<HTMLCanvasElement>;
  private _currentTime: number;
  private _currentFrame: number;
  private _currentFps: number;
  private _isRunningEngine = false;

  private _renderer: any;
  private _customShaderMaterial: ShaderMaterial;

  // private pixelAlignedPanning = true;
  // private normalEdgeStrength = 0.3;
  // private depthEdgeStrength = 0.4;
  // // private pixelSize = 1;
  // private pixelSize = 6;
  // private width = window.innerWidth;
  // private height = window.innerHeight;

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
    this._currentTime = 0;

    const scene = this.scene;

    this.engine.runRenderLoop(() => {
      scene.render();
      this.updateMetrics();
      this.updateShaderMaterial();
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

  updateShaderMaterial() {
    if (!this._customShaderMaterial)
      return;
    
    this._customShaderMaterial.setFloat("time", this._currentTime/500);
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

    this._renderer = this.scene.enableDepthRenderer();

    // create custom model with custom material
    // resources:
    // - https://www.smashingmagazine.com/2016/11/building-shaders-with-babylon-js/

    this.createDioramaModelAsync();
  }

  async createDioramaModelAsync(): Promise<void> {
    
    // diorama examples
    // const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Prop_Diorama_01.glb', this.scene);
    // const myMaterial_base = new StandardMaterial('MatDiorama.base', this.scene);
    // myMaterial_base.diffuseColor = new Color3(0.5, 0.5, 0.5);  
    // models.meshes[2].material = myMaterial_base;

    // this._customShaderMaterial = this.createShaderMaterial_Basic();
    // this._customShaderMaterial = this.createShaderMaterial_BlackAndWhite();
    // this._customShaderMaterial = this.createShaderMaterial_Cell();
    // this._customShaderMaterial = this.createShaderMaterial_Phong();
    // this._customShaderMaterial = this.createShaderMaterial_Discard();
    // this._customShaderMaterial = this.createShaderMaterial_Wave();
    // this._customShaderMaterial = this.createShaderMaterial_Fresnel();
    // models.meshes[1].material = this._customShaderMaterial;

    // ground tile examples
    this.createSceneTileUvs();

  }

  createShaderMaterial_Basic(): ShaderMaterial {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/basic', {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection"]
    });
  
    const texture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    customShaderMaterial.setTexture("textureSampler", texture);

    return customShaderMaterial;
  }

  createShaderMaterial_BlackAndWhite(): ShaderMaterial {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/blackandwhite', {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection"]
    });
  
    const texture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    customShaderMaterial.setTexture("textureSampler", texture);

    return customShaderMaterial;
  }

  createShaderMaterial_Cell(): ShaderMaterial {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/cell', {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldViewProjection"]
    });
  
    const texture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    customShaderMaterial.setTexture("textureSampler", texture);

    return customShaderMaterial;
  }

  createShaderMaterial_Phong(): ShaderMaterial {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/phong', {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldViewProjection"]
    });
  
    const texture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    customShaderMaterial.setTexture("textureSampler", texture);

    customShaderMaterial.setVector3("cameraPosition", this.camera.position);

    return customShaderMaterial;
  }

  createShaderMaterial_Discard(): ShaderMaterial {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/discard', {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection"]
    });
  
    const texture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    customShaderMaterial.setTexture("textureSampler", texture);

    return customShaderMaterial;
  }

  createShaderMaterial_Wave(): ShaderMaterial {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/wave', {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldViewProjection"]
    });
  
    const texture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    customShaderMaterial.setTexture("textureSampler", texture);

    customShaderMaterial.setVector3("cameraPosition", this.camera.position);

    customShaderMaterial.setFloat("time", this._currentTime/500);

    return customShaderMaterial;
  }

  createShaderMaterial_Fresnel(): ShaderMaterial {
    const customShaderMaterial = new ShaderMaterial('MatCustomShader', this.scene, '/assets/shaders/fresnel', {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldViewProjection"]
    });
  
    const texture = new Texture('/assets/art/textures/Texture_01.png', this.scene, true, false);
    customShaderMaterial.setTexture("textureSampler", texture);

    customShaderMaterial.setVector3("cameraPosition", this.camera.position);

    return customShaderMaterial;
  }

  createSceneTileUvs(): void {
    const cellSize = 1;
    const plane = MeshBuilder.CreatePlane('terrain', { size: cellSize }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

    const terrainTex = new Texture('/assets/art/textures/terrain-atlas1.png', this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
    const terrainMat = new ShaderMaterial('MatTerrain', this.scene, '/assets/shaders/terraincell', {
      attributes: ['position', 'normal', 'uv'],
      uniforms: ['worldViewProjection']
    });
    terrainMat.setTexture('textureSampler', terrainTex);
    
    const uvCoordinates = GroundTileLibrary.getTileUVs(GroundTileType.Mud_Debris);
    terrainMat.setVector2('uvStart', uvCoordinates.topLeft);
    terrainMat.setVector2('uvEnd', uvCoordinates.bottomRight);
    terrainMat.setFloat('cellSize', cellSize);

    plane.material = terrainMat;
  }

}
