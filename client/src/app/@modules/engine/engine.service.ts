import { Injectable, ElementRef  } from '@angular/core';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Vector3 } from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;

  constructor() { }

  setupEngine(canvas: ElementRef<HTMLCanvasElement>) {

    this.engine = new Engine(canvas.nativeElement, true);
    this.scene = this.createScene(this.engine);

    this.runExamples();

  } 

  createScene(engine: Engine): any {
    return new Scene(engine);
  }

  resize() {
    this.engine.resize();
  }

  startRenderLoop() {
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
    
    // use universal camera + default light
    this.scene.createDefaultLight();
    const camera = new UniversalCamera('mycamera', new Vector3(0, 5, -10), this.scene);
    camera.attachControl();

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
