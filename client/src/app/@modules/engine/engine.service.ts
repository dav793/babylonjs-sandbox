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

import { GroundTileLibrary, GroundTileType, UV_Coordinates } from './ground-tile-library';

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

    // terrain examples
    // this.createSceneTileUvs();
    this.createSceneGridMesh();

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

  createSceneGridMesh(): void {
    
    // hand made grid
    // const cellSize = 1;
    // const gridSize = 3;

    // const tiles = [
    //   [GroundTileType.Grass, GroundTileType.Grass, GroundTileType.Grass],
    //   [GroundTileType.Grass, GroundTileType.Grass_Leaves, GroundTileType.Dirt_Cracked_Pebbles],
    //   [GroundTileType.Grass, GroundTileType.Dirt, GroundTileType.Dirt_Cracked]
    // ];
    // let tilesData: number[] = [];
    // for (let row of tiles) {
    //   tilesData = tilesData.concat(row);
    // }

    // procedural grid
    const cellSize = 1;
    const gridSize = 30;  // going over 30 causes error "FRAGMENT shader uniforms count exceeds MAX_FRAGMENT_UNIFORM_VECTORS(1024):
                          // @todo: look into using uniform buffers or storage buffers
                          // https://doc.babylonjs.com/typedoc/classes/BABYLON.ShaderMaterial#setUniformBuffer
                          // https://doc.babylonjs.com/typedoc/classes/BABYLON.ShaderMaterial#setStorageBuffer

    const tiles: GroundTileType[][] = [];
    const min = 0;
    const max = 19;
    for (let y = 0; y < gridSize; ++y) {
      const row: GroundTileType[] = [];
      for (let x = 0; x < gridSize; ++x) {
        row.push(
          Math.floor(Math.random() * (max - min + 1) + min)
        );
      }
      tiles.push(row);
    } 
    let tilesData: number[] = [];
    for (let row of tiles) {
      tilesData = tilesData.concat(row);
    }

    // prepare data for shader
    const uvCoordinates: UV_Coordinates[] = GroundTileLibrary.getTileUVsArray();
    const tileTypesLength = uvCoordinates.length;
    let uvStart: number[] = [];
    let uvEnd: number[] = [];
    for (let entry of uvCoordinates) {
      uvStart = uvStart.concat([entry.topLeft.x, entry.topLeft.y]);
      uvEnd = uvEnd.concat([entry.bottomRight.x, entry.bottomRight.y]);
    }

    // create mesh and setup shader
    const plane = MeshBuilder.CreatePlane('terrain', { size: gridSize*cellSize }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

    const terrainTex = new Texture('/assets/art/textures/terrain-atlas1.png', this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
    const terrainMat = new ShaderMaterial('MatTerrain', this.scene, '/assets/shaders/terraingridcell', {
      attributes: ['position', 'normal', 'uv'],
      uniforms: ['worldViewProjection']
    });
    terrainMat.setDefine('TILE_TYPES_LENGTH', tileTypesLength.toString());
    terrainMat.setDefine('GRID_SIZE', gridSize.toString());
    terrainMat.setDefine('CELL_SIZE', cellSize.toString());
    terrainMat.setTexture('textureSampler', terrainTex);
    terrainMat.setFloats('tiles', tilesData);
    terrainMat.setFloats('uvStart', uvStart);
    terrainMat.setFloats('uvEnd', uvEnd);

    plane.material = terrainMat;
  }

}
