import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Matrix, Vector3, Vector4, Color3, Color4, ShaderMaterial, Camera, MeshBuilder, Tools, Ray, PickingInfo, Vector2 } from '@babylonjs/core';
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
    const camera = new ArcRotateCamera("myCamera", -Tools.ToRadians(90), Tools.ToRadians(60), 16, Vector3.Zero(), this.scene);
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(this._canvas.nativeElement, true);
    
    // zoom constraints
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 60;
    
    // latitudinal rotation constraints (up/down)
    camera.upperBetaLimit = Tools.ToRadians(80);

    this.camera = camera;

    this._renderer = this.scene.enableDepthRenderer();

    this.createTerrainAsync();
  }

  async createTerrainAsync(): Promise<void> {

    // set up ground plane
    const groundSize = 10;
    const cellSize = 1;
    const gridWidth = 0.02;
    const gridColor = new Color4(0, 0.4, 1, 0.15);

    const plane = MeshBuilder.CreatePlane('terrain', { size: groundSize }, this.scene);
    plane.metadata = 'ground';
    plane.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

    const terrainTex = new Texture('/assets/art/textures/SandTexture1.png', this.scene);
    const terrainMat = new ShaderMaterial('MatTerrain', this.scene, '/assets/shaders/terrain', {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection']
    });
    terrainMat.setTexture('textureSampler', terrainTex);
    terrainMat.setFloat('groundSize', groundSize);
    terrainMat.setFloat('cellSize', cellSize);
    terrainMat.setFloat('lineWidth', gridWidth);
    terrainMat.setColor4('gridColor', gridColor);
    terrainMat.setInt('pointerOnMesh', 0);
    terrainMat.setVector2('pointerCoords', new Vector2(null, null));

    plane.material = terrainMat;

    // set up mouse listener
    this.scene.onPointerMove = () => {
      // resources on raycasting:
      // - https://www.youtube.com/watch?v=dgsWKpa7RcY
      // - https://playground.babylonjs.com/#AC8XPN

      const ray: Ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.camera);
      const hit: PickingInfo = this.scene.pickWithRay(ray);

      if (hit.pickedMesh && hit.pickedMesh.metadata === 'ground') {
        
        const cellIndex = this.parseGroundCoords(
          new Vector2( hit.pickedPoint.x, hit.pickedPoint.z ),
          cellSize,
          Math.floor(groundSize / cellSize)
        );
        
        terrainMat.setInt('pointerOnMesh', 1);
        terrainMat.setVector2('pointerCoords', cellIndex);
      }
      else
        terrainMat.setInt('pointerOnMesh', 0);
    };

  }

  parseGroundCoords(position: Vector2, cellSize: number, gridSize: number): Vector2 {
    const cellIndex = new Vector2(
      Math.floor(position.x / cellSize) + gridSize/2,
      Math.floor(position.y / cellSize) + gridSize/2
    );
    return cellIndex;
  }

}
