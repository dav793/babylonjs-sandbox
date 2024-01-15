import { Injectable, ElementRef  } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import entire library (legacy)...
// import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// ...or import tree-shakeable modules individually
import { 
  SceneLoader, 
  HemisphericLight, 
  Vector3, 
  Vector4, 
  Color3, 
  ShaderMaterial, 
  Camera, 
  MeshBuilder, 
  RegisterMaterialPlugin, 
  RawTexture2DArray 
} from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Inspector } from '@babylonjs/inspector';

import { EngineUtil } from 'src/app/@shared/engine.util';
import { BlackAndWhitePluginMaterial } from './material-plugins/black-and-white-material.plugin';
import { ColorifyPluginMaterial } from './material-plugins/colorify-material.plugin';
import { TextureSamplerPluginMaterial } from './material-plugins/texture-sampler-material.plugin';
import { AttributePluginMaterial } from './material-plugins/attribute-material.plugin';

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

  private _renderer: any;
  private _customShaderMaterial: ShaderMaterial;

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
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, Vector3.Zero(), this.scene);
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(this._canvas.nativeElement, true);
    this.camera = camera;

    this._renderer = this.scene.enableDepthRenderer();

    // see docs:
    // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/materialPlugins

    // this.createSceneObjectBlackAndWhitePluginAsync();
    // this.createSceneObjectColorifyPluginAsync();
    // this.createSceneTextureSamplerPluginAsync();
    this.createSceneAttributesPluginAsync();
  }

  async createSceneObjectBlackAndWhitePluginAsync(): Promise<void> {

    const plane = MeshBuilder.CreatePlane("plane", {
      size: 10
    }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane

    const material = new StandardMaterial('myMat', this.scene);
    const texture = await EngineUtil.LoadTextureAsync('/assets/art/textures/Texture_01.png', this.scene);
    material.diffuseTexture = texture;
    
    // apply plugin to all materials (not working)
    // RegisterMaterialPlugin("BlackAndWhite", (material) => {
    //   (material as any)['blackandwhite'] = new BlackAndWhitePluginMaterial(material);
    //   return (material as any)['blackandwhite'];
    // });

    // apply plugin to a single material
    const myPlugin = new BlackAndWhitePluginMaterial(material);

    plane.material = material;

  }

  async createSceneObjectColorifyPluginAsync(): Promise<void> {

    const plane = MeshBuilder.CreatePlane("plane", {
      size: 10
    }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane

    const material = new StandardMaterial('myMat', this.scene);
    const texture = await EngineUtil.LoadTextureAsync('/assets/art/textures/Texture_01.png', this.scene);
    material.diffuseTexture = texture;

    // apply plugin to a single material
    const myPlugin = new ColorifyPluginMaterial(material);

    plane.material = material;
    myPlugin.isEnabled = true;
    // (plane.material.pluginManager.getPlugin('Colorify') as ColorifyPluginMaterial).isEnabled = true;

  }

  async createSceneTextureSamplerPluginAsync(): Promise<void> {

    const plane = MeshBuilder.CreatePlane("plane", {
      size: 10
    }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane

    const material = new StandardMaterial('myMat', this.scene);
    const texture = await EngineUtil.LoadTextureAsync('/assets/art/textures/grass-tile.png', this.scene);
    material.diffuseTexture = texture;

    // apply plugin to a single material
    const myPlugin = new TextureSamplerPluginMaterial(material);

    plane.material = material;
    myPlugin.isEnabled = true;

  }

  async createSceneAttributesPluginAsync(): Promise<void> {

    const plane = MeshBuilder.CreatePlane("plane", {
      size: 10
    }, this.scene);
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane

    const material = new StandardMaterial('myMat', this.scene);
    const texture = await EngineUtil.LoadTextureAsync('/assets/art/textures/grass-tile.png', this.scene);
    material.diffuseTexture = texture;

    // see example:
    //  - https://playground.babylonjs.com/#HBWKYN#9

    // TEXTURE 2D ARRAY
    let N_LAYERS = 3;   // what is this for? can change to any number
    let WH = 4;   // width / height
    let data = new Uint8Array(WH * WH * N_LAYERS * 3)
    let rand = (a: number, b: number) => a + Math.random() * (b - a);
    for (let layer = 0; layer < N_LAYERS; layer++) {
        for (let i = 0; i < WH * WH * 3; i++) {
          let value = (i % 3 === layer) ? 0 : Math.round(rand(0.7, 0.9) * 255)
          data[layer * WH * WH * 3 + i] = value
        }
    }
    let texArray: RawTexture2DArray = new RawTexture2DArray(
        data, WH, WH, N_LAYERS,
        Engine.TEXTUREFORMAT_RGB,
        this.scene, false, false,
        Texture.NEAREST_SAMPLINGMODE,
    );

    // apply plugin to a single material
    const myPlugin = new AttributePluginMaterial(material, texArray);

    // add vertex data to mesh
    // what does this part do? does not seem to be necessary...
    let texIndices = Array.from(Array(24)).map((n, i) => {
      return Math.floor(i / 6) % N_LAYERS
    });
    // let texIndices: any[] = [];
    plane.setVerticesData("texIndices", texIndices, false, 1);

    plane.material = material;
    myPlugin.isEnabled = true;
    // plane.material.wireframe = true;

  }

}
