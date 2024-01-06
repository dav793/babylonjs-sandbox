import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Vector4, Color3, Color4, ShaderMaterial, Camera, MeshBuilder } from '@babylonjs/core';
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

    this.createTerrainAsync();
  }

  async createTerrainAsync(): Promise<void> {

    const plane = MeshBuilder.CreatePlane('terrain', { size: 10 }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);

    const terrainTex = new Texture('/assets/art/textures/SandTexture1.png', this.scene);
    const terrainMat = new ShaderMaterial('MatTerrain', this.scene, '/assets/shaders/terrain', {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection']
    });
    terrainMat.setTexture('textureSampler', terrainTex);

    // terrainMat.setFloat('cellSize', 1);
    terrainMat.setFloat('cellSize', 1);
    terrainMat.setFloat('lineWidth', 0.05);
    // terrainMat.setFloat('lineWidth', 0.3);
    // terrainMat.setColor4('gridColor', new Color4(0.25, 0.42, 0.66, 0.15));
    terrainMat.setColor4('gridColor', new Color4(0, 0.4, 1, 0.15));

    plane.material = terrainMat;

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

}
