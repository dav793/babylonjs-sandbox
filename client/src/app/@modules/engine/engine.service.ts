import { Injectable, ElementRef  } from '@angular/core';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { SceneLoader, HemisphericLight, Vector3, Color3, VertexBuffer, Constants } from '@babylonjs/core';
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
    this.scene = this.createDefaultScene(this.engine);
    this._canvas = canvas;

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

    const scene = this.scene;

    this.engine.runRenderLoop(function() {
      scene.render();
    });
  }

  showInspector() {
    Inspector.Show(this.scene, {});
  }

  runExampleScene() {

    // set scene ambient color
    // this.scene.ambientColor = new Color3(1, 1, 1);

    // set light
    const light = new HemisphericLight("myLight", new Vector3(1, 1, 1), this.scene);
    light.intensity = 0.85;

    // set camera
    // const camera = new UniversalCamera('myCamera', new Vector3(0, 5, -10), this.scene);
    // camera.rotation.x = 0.25;
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.5, 8, Vector3.Zero(), this.scene);
    camera.attachControl(this._canvas.nativeElement, true);

    // create custom model with included material
    // this.createDioramaModel();           // sync
    // this.createDioramaModelAsync();      // async

    // create custom model with custom material
    this.createDioramaModelCustomMatAsync();

  }

  createDioramaModel(): void {
    SceneLoader.ImportMesh('', '/assets/art/models/', 'Prop_Diorama_01.glb', this.scene, (meshes) => {
      console.log('meshes: ', meshes);
    });
  }

  async createDioramaModelAsync(): Promise<void> {
    const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Prop_Diorama_01.glb');
    console.log('models: ', models);
  }

  async createDioramaModelCustomMatAsync(): Promise<void> {
    // const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Prop_Diorama_04.glb', this.scene);
    // const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Meshes_02.glb', this.scene);
    const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Meshes_07.glb', this.scene);
    // const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'Meshes_03.glb', this.scene);
    // const models = await SceneLoader.ImportMeshAsync('', 'https://raw.githubusercontent.com/dav793/babylonjs-playground-uploads/main/', 'Meshes_01.glb', this.scene);
    // const models = await SceneLoader.ImportMeshAsync('', 'https://raw.githubusercontent.com/dav793/babylonjs-playground-uploads/main/', 'Meshes_01.fbx', this.scene);
    // const models = await SceneLoader.ImportMeshAsync('', '/assets/art/models/', 'low-poly-sandbox.babylon', this.scene);

    // const myMaterial_base = new StandardMaterial('MatDiorama.base', this.scene);
    // myMaterial_base.diffuseColor = new Color3(0.5, 0.5, 0.5);  
    // models.meshes[2].material = myMaterial_base;

    const myMaterial_main = new StandardMaterial('MatDiorama.main', this.scene);
    // myMaterial_main.diffuseTexture = new Texture('/assets/art/textures/Texture_01_old.png', this.scene, true, false);
    myMaterial_main.diffuseTexture = new Texture('/assets/art/textures/Texture_02.png', this.scene, true, false);
    // myMaterial_main.diffuseTexture.wrapU = Constants.TEXTURE_CLAMP_ADDRESSMODE;
    // myMaterial_main.diffuseTexture.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
    myMaterial_main.specularColor = new Color3(0.1, 0.1, 0.1);
    models.meshes[1].material = myMaterial_main;
    models.meshes[2].material = myMaterial_main;

    // console.log(models.meshes[2].id);
    // console.log(
    //   models.meshes[2].getVerticesData(VertexBuffer.UVKind).filter(coord => !coord)
    // );

    // console.log('models: ', models);
  }

}
