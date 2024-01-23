import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HemisphericLight, Vector3, ShaderMaterial, MeshBuilder, Tools, UniformBuffer } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Subject, Observable } from 'rxjs';

import { EngineService } from '../../engine/engine.service';
import { GroundTileLibrary, GroundTileType, UV_Coordinates } from 'src/app/@shared/util/ground-tile-library';
import { buffer } from 'node_modules.bk/get-stream';

@Component({
  selector: 'app-grid-single-scene',
  templateUrl: './grid-single-scene.component.html',
  styleUrls: ['./grid-single-scene.component.scss'],
  providers: [ EngineService ]
})
export class GridSingleSceneComponent {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  private _destroy$ = new Subject<void>();

  constructor(
    private engineService: EngineService,
    private ngZone: NgZone
  ) { }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngAfterViewInit(): void {
    this.setup();
  }

  setup() {
    // setup + start engine
    this.engineService.setupEngine( this.canvas );
    this.setupScene();
    this.startRenderLoop();
    // this.engineService.showInspector();
  }

  startRenderLoop(): void {
    this.ngZone.runOutsideAngular(() => {

      if (document.readyState !== 'loading')
        this.engineService.startRenderLoop();
      else
        window.addEventListener('DOMContentLoaded', () => this.engineService.startRenderLoop());

      window.addEventListener('resize', () => this.engineService.resize());
      
    });
  }

  get fpsChanges$(): Observable<string> {
    return this.engineService.fpsChanges$;
  }

  setupScene() {

    // set light
    const light = new HemisphericLight("myLight", new Vector3(1, 2, -1), this.engineService.scene);
    light.intensity = 0.85;

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, Vector3.Zero(), this.engineService.scene);
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(this.canvas.nativeElement, true);
    this.engineService.setCamera(camera);

    // create hand made grid
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

    // create procedural grid
    const cellSize = 1;
    const gridSize = 128;  // going over 30 causes error "FRAGMENT shader uniforms count exceeds MAX_FRAGMENT_UNIFORM_VECTORS(1024):
                          // @todo: look into using uniform buffers or storage buffers
                          // https://doc.babylonjs.com/typedoc/classes/BABYLON.ShaderMaterial#setUniformBuffer
                          // https://doc.babylonjs.com/typedoc/classes/BABYLON.ShaderMaterial#setStorageBuffer
                          // https://playground.babylonjs.com/#1OH09K#2472

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
    
    // convert to uniform buffer
    const tilesDataBuffer = new UniformBuffer(this.engineService.engine);
    tilesDataBuffer.addUniform('tiles', 1, tilesData.length);
    const tilesDataBufferContent = new Float32Array(tilesData.length);
    for (let i = 0; i < tilesData.length; ++i) {
      tilesDataBufferContent[i] = tilesData[i];
    }
    tilesDataBuffer.updateUniformArray('tiles', tilesDataBufferContent, tilesDataBufferContent.length);
    tilesDataBuffer.update();

    // prepare data for shader
    const uvCoordinates: UV_Coordinates[] = GroundTileLibrary.getTileUVsArray();
    const tileTypesLength = uvCoordinates.length;
    let uvStart: number[] = [];
    let uvEnd: number[] = [];
    for (let entry of uvCoordinates) {
      uvStart = uvStart.concat([entry.topLeft.x, entry.topLeft.y]);
      uvEnd = uvEnd.concat([entry.bottomRight.x, entry.bottomRight.y]);
    }

    // convert to uniform buffers
    const uvStartBuffer = new UniformBuffer(this.engineService.engine);
    const uvEndBuffer = new UniformBuffer(this.engineService.engine);
    uvStartBuffer.addUniform('uvStart', 1, uvStart.length);
    uvEndBuffer.addUniform('uvEnd', 1, uvEnd.length);
    const uvStartBufferContent = new Float32Array(uvStart.length);
    const uvEndBufferContent = new Float32Array(uvEnd.length);
    for (let i = 0; i < uvCoordinates.length*2; ++i) {
      uvStartBufferContent[i] = uvStart[i];
      uvEndBufferContent[i] = uvEnd[i];
    }
    uvStartBuffer.updateUniformArray('uvStart', uvStartBufferContent, uvStartBufferContent.length);
    uvStartBuffer.update();
    uvEndBuffer.updateUniformArray('uvEnd', uvEndBufferContent, uvEndBufferContent.length);
    uvEndBuffer.update();

    // create mesh and setup shader
    const plane = MeshBuilder.CreatePlane('terrain', { size: gridSize*cellSize }, this.engineService.scene);
    plane.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));

    const terrainTex = new Texture('/assets/art/textures/terrain-atlas1.png', this.engineService.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
    const terrainMat = new ShaderMaterial('MatTerrain', this.engineService.scene, '/assets/shaders/terraingridcell', {
      attributes: ['position', 'normal', 'uv'],
      uniforms: ['worldViewProjection'],
      uniformBuffers: ['tilesBuffer', 'uvStartBuffer', 'uvEndBuffer']
    });
    terrainMat.setDefine('TILE_TYPES_LENGTH', tileTypesLength.toString());
    terrainMat.setDefine('GRID_SIZE', gridSize.toString());
    terrainMat.setDefine('CELL_SIZE', cellSize.toString());
    terrainMat.setTexture('textureSampler', terrainTex);
    // terrainMat.setFloats('tiles', tilesData);
    // terrainMat.setFloats('uvStart', uvStart);
    // terrainMat.setFloats('uvEnd', uvEnd);

    terrainMat.setUniformBuffer('tilesBuffer', tilesDataBuffer);
    terrainMat.setUniformBuffer('uvStartBuffer', uvStartBuffer);
    terrainMat.setUniformBuffer('uvEndBuffer', uvEndBuffer);

    plane.material = terrainMat;

  }

}
