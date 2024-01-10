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

import { GroundTileType } from './ground-tile-library';
import { GroundTileFactory } from './ground-tile-factory';

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

    // manual map
    // const terrainMap = [
    //   [ GroundTileType.Grass,         GroundTileType.Grass,           GroundTileType.Leaves,    GroundTileType.Dirt ],
    //   [ GroundTileType.Grass,         GroundTileType.Grass_Flowers,   GroundTileType.Leaves,    GroundTileType.Dirt_Cracked ],
    //   [ GroundTileType.Grass_Leaves,  GroundTileType.Grass_Clovers,   GroundTileType.Leaves,    GroundTileType.Dirt_Cracked_Pebbles ],
    //   [ GroundTileType.Mud_Debris,    GroundTileType.Mud,             GroundTileType.Mud,       GroundTileType.Footpath ]
    // ];

    // procedural map
    const terrainMap: GroundTileType[][] = [];
    const mapSize = 32;
    const randMin = 0;
    const randMax = 19;
    for (let i = 0; i < mapSize; ++i) {
      const row: GroundTileType[] = [];
      for (let j = 0; j < mapSize; ++j) {
        const rand = Math.floor(Math.random() * (randMax - randMin + 1) + randMin);
        row.push(rand as GroundTileType);
      }
      terrainMap.push(row);
    }

    // internal - do not modify
    const terrainRowLength = terrainMap[0].length;
    const terrainColLength = terrainMap.length;
    const tileSize = GroundTileFactory.getTileSize();
    const tileSizeHalved = tileSize / 2;
    const terrainSizeX = terrainRowLength * tileSize;
    const terrainSizeXHalved = terrainSizeX / 2;
    const offsetX = -terrainSizeXHalved + tileSizeHalved;
    const terrainSizeY = terrainColLength * tileSize;
    const terrainSizeYHalved = terrainSizeY / 2;
    const offsetY = terrainSizeYHalved - tileSizeHalved;

    for (let i = 0; i < terrainColLength; ++i) {
      for (let j = 0; j < terrainRowLength; ++j) {
        
        const tileType = terrainMap[i][j];
        const posx = offsetX + j * tileSize;
        const posy = offsetY - i * tileSize;

        const tileMesh = GroundTileFactory.createGroundTileMesh(tileType, this.scene);
        tileMesh.position = new Vector3(posx, 0, posy);
      }
    }
  }

}
