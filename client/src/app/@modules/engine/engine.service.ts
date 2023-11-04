import { Injectable, ElementRef  } from '@angular/core';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { HemisphericLight } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core';
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
    light.intensity = 0.7;

    // use universal camera
    const camera = new UniversalCamera('mycamera', new Vector3(0, 5, -10), this.scene);
    // camera.rotation.x = 0.5;         // set rotation manually...
    camera.setTarget(Vector3.Zero());   // or set rotation using a target (here, the scene origin)
    camera.attachControl(this._canvas.nativeElement, true);

    // create a box
    // const box = MeshBuilder.CreateBox("mybox", {}, this.scene);

    // create a ground plane
    // const ground = MeshBuilder.CreateGround('myground', {
    //   width: 10,
    //   height: 10,
    //   subdivisions: 30
    // });

    // create ground plane from heightmap
    const ground = MeshBuilder.CreateGroundFromHeightMap('myground', '/assets/img/iceland_heightmap.png', {
      width: 10,
      height: 10,
      minHeight: 0,
      maxHeight: 0.5,
      subdivisions: 200
    });

    // ground.material = new StandardMaterial('mygroundmat');
    // ground.material.wireframe = true;                       // show wireframe

  }

}
