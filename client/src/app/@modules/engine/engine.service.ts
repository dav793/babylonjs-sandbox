import { Injectable, ElementRef  } from '@angular/core';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core';
import { Vector3, Texture, MultiMaterial, SubMesh } from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;

  private _canvas: ElementRef<HTMLCanvasElement>;
  private _isRunningEngine = false;

  constructor() { }

  setupEngine(canvas: ElementRef<HTMLCanvasElement>) {

    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = this.createScene(this.engine);
    this._canvas = canvas;

    this.runExamples();

  } 

  createScene(engine: Engine): any {
    return new Scene(engine);
  }

  resize() {
    this.engine.resize();
  }

  startRenderLoop() {
    if (this._isRunningEngine)
      return; 
    this._isRunningEngine = true;

    var scene = this.scene;

    this.engine.runRenderLoop(function() {
      scene.render();
    });
  }

  showInspector() {
    Inspector.Show(this.scene, {});
  }

  runExamples() {

    // use default camera + light
    // this.scene.createDefaultCameraOrLight(true, false, true);
    
    // use default light
    // this.scene.createDefaultLight();

    // use hemispheric light
    const light = new HemisphericLight("mylight", new Vector3(1, 1, 1), this.scene);
    light.intensity = 0.85;

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, new Vector3(0, 1, 0), this.scene);
    camera.radius = 3;
    camera.wheelPrecision = 100;
    camera.attachControl(this._canvas.nativeElement, true);

    // see tiled ground example: https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/tiled_ground
    // https://playground.babylonjs.com/#8VDULN#1

    const grid = {
      'h' : 8,
      'w' : 8
    };
    const tiledGround = MeshBuilder.CreateTiledGround("tiled ground", {xmin: -3, zmin: -3, xmax: 3, zmax: 3, subdivisions: grid}, this.scene);

    const grassMaterial = new StandardMaterial("grass");
    grassMaterial.diffuseTexture = new Texture("/assets/art/textures/grass.png");

    const rockMaterial = new StandardMaterial("rock");
    rockMaterial.diffuseTexture = new Texture("/assets/art/textures/rock.png");

    const multimat = new MultiMaterial("multi", this.scene);
    multimat.subMaterials.push(grassMaterial);
    multimat.subMaterials.push(rockMaterial);

    tiledGround.material = multimat;

    const verticesCount = tiledGround.getTotalVertices();
    const tileIndicesLength = tiledGround.getIndices().length / (grid.w * grid.h);
    tiledGround.subMeshes = [];

    let base = 0;
    for (let row = 0; row < grid.h; row++) {
        for (let col = 0; col < grid.w; col++) {
            tiledGround.subMeshes.push( new SubMesh(row%2 ^ col%2, 0, verticesCount, base , tileIndicesLength, tiledGround) );
            base += tileIndicesLength;
        }
    }

  }

}
