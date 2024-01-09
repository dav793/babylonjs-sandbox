import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { SceneLoader, HemisphericLight, Vector3, Vector4, Color3, Color4, Camera, MeshBuilder, Matrix, Tools, StandardMaterial, Material } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Inspector } from '@babylonjs/inspector';

import { AssetLibrary } from './asset-library';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;
  camera: Camera;
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
    const camera = new ArcRotateCamera("myCamera", -Tools.ToRadians(90), Tools.ToRadians(45), 16, Vector3.Zero(), this.scene);
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(this._canvas.nativeElement, true);
    this.camera = camera;

    AssetLibrary.init(this.scene)
      .then(() => this.createSceneObjects());
  }

  createSceneObjects() {

    // see docs:
    // - https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/thinInstances

    // this.createThinInstancesWithAttributes();
    this.createThinInstancesWithPrebuiltBuffers();

  }

  createThinInstancesWithAttributes() {
    const plane = MeshBuilder.CreatePlane("plane", { size: 1 }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane
    plane.material = AssetLibrary.getMaterial('Footpath-Tile');

    const positions: Matrix[] = [
      Matrix.Translation(0, 0, 0),
      Matrix.Translation(1, 0, 0),
      Matrix.Translation(1, 1, 0),
      Matrix.Translation(0, 1, 0),
      Matrix.Translation(-1, 1, 0),
      Matrix.Translation(-1, 0, 0),
      Matrix.Translation(-1, -1, 0),
      Matrix.Translation(0, -1, 0),
      Matrix.Translation(1, -1, 0)
    ];
    const idx = plane.thinInstanceAdd(positions);
    // console.log(idx);
    // console.log(plane.thinInstanceCount);
    
    plane.thinInstanceRegisterAttribute('color', 4);
    plane.thinInstanceSetAttributeAt('color', 0, [
      1, 0, 0, 1, 
      0, 1, 0, 1, 
      0, 0, 1, 1, 
      0, 0, 0, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1
    ]);
  }

  createThinInstancesWithPrebuiltBuffers() {
    const cellSize = 1;
    // const gridSize = 24;
    const gridSize = 8;

    const plane = MeshBuilder.CreatePlane("plane", { size: cellSize }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane
    plane.material = AssetLibrary.getMaterial('Footpath-Tile');

    // set positions
    const bufferMatrices = new Float32Array(16 * gridSize * gridSize);  // 16: 4 floats (4 bytes each)
    for (let i = 0; i < gridSize; ++i) {
      for (let j = 0; j < gridSize; ++j) {
        const byteOffset = i * 16 * gridSize + j * 16;
        Matrix.Translation(i - Math.floor(gridSize/2), j - Math.floor(gridSize/2), 0).copyToArray(bufferMatrices, byteOffset);
      }
    }
    plane.thinInstanceSetBuffer('matrix', bufferMatrices, 16, true);  // staticBuffer set to true, is faster but it means we will never update this buffer

    // set colors
    const bufferColors = new Float32Array(4 * gridSize * gridSize);   // 4: 4 floats (1 byte each)
    let colorsArr: number[] = [];
    for (let i = 0; i < gridSize; ++i) {
      for (let j = 0; j < gridSize; ++j) {
        colorsArr = colorsArr.concat([0.8, 0.2, 0.9, 1]);
      }
    }
    bufferColors.set(colorsArr);
    plane.thinInstanceSetBuffer('color', bufferColors, 4, true);
    // if we update the buffers we passed, we must call thinInstanceBufferUpdated for the changes to take effect.

    // picking instances with raycasting
    plane.isPickable = true;
    plane.thinInstanceEnablePicking = true;

    const selectionPlane = MeshBuilder.CreatePlane("selectionPlane", { size: 1 }, this.scene);
    selectionPlane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis
    selectionPlane.material = new StandardMaterial('MatSelectionPlane', this.scene);
    (selectionPlane.material as StandardMaterial).diffuseColor = new Color3(0.5, 0.5, 1);
    (selectionPlane.material as StandardMaterial).alpha = 0.3;
    selectionPlane.setEnabled(false);

    this.scene.onPointerDown = (evt, pickInfo) => {
      if (pickInfo.hit) {
        // const worldMat = plane.thinInstanceGetWorldMatrices();
        // const thinInstanceMatrix = worldMat[pickInfo.thinInstanceIndex];

        // selectionPlane.setEnabled(true);
        // thinInstanceMatrix.getTranslationToRef(
        //   selectionPlane.position
        // );

        selectionPlane.setEnabled(true);

        const gridOffset = gridSize * cellSize / 2;
        const posx = Math.floor(pickInfo.thinInstanceIndex / gridSize) * cellSize - gridOffset;
        const posz = (pickInfo.thinInstanceIndex % gridSize) * cellSize - gridOffset;

        selectionPlane.position = new Vector3(posx, 0, posz);

        // console.log(pickInfo.pickedPoint, pickInfo.thinInstanceIndex);
      }
      else
        selectionPlane.setEnabled(false);
    };
  }

  createThinInstancesWithCustomShader() {
    const cellSize = 1;
    const gridSize = 8;

    // @todo: write this
  }

}
