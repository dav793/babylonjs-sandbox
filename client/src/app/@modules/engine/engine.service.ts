import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { 
  SceneLoader, 
  HemisphericLight, 
  Matrix, 
  Vector3, 
  Vector4, 
  Color3, 
  Color4, 
  ShaderMaterial, 
  Camera, 
  MeshBuilder, 
  Tools, 
  Ray, 
  PickingInfo, 
  Vector2, 
  Mesh, 
  VertexData 
} from '@babylonjs/core';
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
    const camera = new ArcRotateCamera("myCamera", -Tools.ToRadians(90), Tools.ToRadians(60), 3, Vector3.Zero(), this.scene);
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

    const customMesh = new Mesh('customTile', this.scene);

    const positions = [ // vertices can be defined in any order
      -0.5, 0, 0.5,
      0.5, 0, 0.5,
      0.5, 0, -0.5,
      -0.5, 0, -0.5
    ];
    const indices = [   // face indices must be in counter-clockwise order for normals to be computed correctly
      0, 2, 1,
      0, 3, 2
    ];

    const uvs: any[] = [];
    for(var p = 0; p < positions.length / 3; p++) {
      uvs.push((positions[3 * p] - (-0.5)) / 1, (positions[3 * p + 2] - (-0.5)) / 1);
    }
    // const uvs = [
    //   0, 1,
    //   1, 1,
    //   1, 0,
    //   0, 0
    // ];

    const normals: any[] = [];

    VertexData.ComputeNormals(positions, indices, normals);
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;

    vertexData.applyToMesh(customMesh);
    // customMesh.convertToFlatShadedMesh();

    const tex = new Texture('/assets/art/textures/terrain-atlas1.png', this.scene);
    const mat = new StandardMaterial('MatTerrain', this.scene);
    // mat.wireframe = true;
    mat.diffuseTexture = tex;
    customMesh.material = mat;

  }

}
