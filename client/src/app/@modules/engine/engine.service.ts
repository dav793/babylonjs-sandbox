import { Injectable, ElementRef  } from '@angular/core';

// import entire library (legacy)...
import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes';

@Injectable()
export class EngineService {

  engine: Engine;
  scene: Scene;

  constructor() { }

  setupEngine(canvas: ElementRef<HTMLCanvasElement>) {

    this.engine = new BABYLON.Engine(canvas.nativeElement, true);
    this.scene = this.createScene(this.engine);

    this.scene.createDefaultCameraOrLight(true, false, true);
    const box = MeshBuilder.CreateBox("mybox");

  } 

  createScene(engine: Engine): any {
    return new BABYLON.Scene(engine);
  }

  startRenderLoop() {
    var scene = this.scene;

    this.engine.runRenderLoop(function() {
      scene.render();
    });
  }

}
