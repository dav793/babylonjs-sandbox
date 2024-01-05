import { Injectable, ElementRef  } from '@angular/core';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { GroundMesh, MeshBuilder } from '@babylonjs/core/Meshes';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3, Color3, HemisphericLight, Texture, MultiMaterial, SubMesh, VertexBuffer } from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';

import { EngineUtil } from 'src/app/@shared/helpers/engine.util';

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

  async runExamples() {

    // use hemispheric light
    const light = new HemisphericLight("mylight", new Vector3(1, 1, 1), this.scene);
    light.intensity = 0.85;

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.8, 16, new Vector3(0, 1, 0), this.scene);
    camera.radius = 15;
    camera.wheelPrecision = 100;
    camera.attachControl(this._canvas.nativeElement, true);

    // see multi-material docs: 
    // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/multiMaterials

    const material0 = new StandardMaterial("mat0", this.scene);
    material0.diffuseColor = new Color3(1, 0, 0);

    const material1 = new StandardMaterial("mat1", this.scene);
    material1.diffuseColor = new Color3(0, 0, 1);

    const material2 = new StandardMaterial("mat2", this.scene);
    material2.emissiveColor = new Color3(0.4, 0, 0.4);

    const multimat = new MultiMaterial("multiMat", this.scene);
    multimat.subMaterials.push(material0);
    multimat.subMaterials.push(material1);
    multimat.subMaterials.push(material2);

    const plane = MeshBuilder.CreatePlane("plane", { size: 10 }, this.scene);
    plane.material = multimat;
    plane.subMeshes = [];
    const verticesCount = plane.getTotalVertices();   // 4
    const indexCount = plane.getTotalIndices();       // 6
    
    const submesh1 = new SubMesh(0, 0, indexCount, 0, 3, plane);
    const submesh2 = new SubMesh(1, 0, indexCount, 3, 3, plane);

    console.log(plane.getVerticesData(VertexBuffer.PositionKind));
    console.log(plane.getVertexBuffer(VertexBuffer.UV2Kind));
    // console.log(plane.getPositionData());
    // console.log(plane.getIndices());
    
    // create ground plane from heightmap
    // const ground: GroundMesh = await EngineUtil.CreateGroundMeshFromHeightmap('myGround', '/assets/img/iceland_heightmap.png', this.scene);
    
    // ground.material = multimat;
    // ground.subMeshes = [];
    // const verticesCount = ground.getTotalVertices();  // 40401
    // const actualVerticesCount = verticesCount*6 - 2406;
    // // console.log(ground.getTotalIndices(), actualVerticesCount);
    
    // const submesh1 = new SubMesh(0, 0, actualVerticesCount, 0, actualVerticesCount, ground);
    // const submesh1 = new SubMesh(0, 0, actualVerticesCount, 0, 3, ground);

    // console.log(ground);

  }

}
