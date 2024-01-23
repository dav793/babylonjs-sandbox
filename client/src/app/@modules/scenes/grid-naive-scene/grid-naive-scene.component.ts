import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HemisphericLight, Vector3, ShaderMaterial, Mesh, MeshBuilder, Tools } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Subject, Observable } from 'rxjs';

import { EngineService } from '../../engine/engine.service';
import { GroundTileLibrary, GroundTileType, UV_Coordinates } from 'src/app/@shared/util/ground-tile-library';

@Component({
  selector: 'app-grid-naive-scene',
  templateUrl: './grid-naive-scene.component.html',
  styleUrls: ['./grid-naive-scene.component.scss'],
  providers: [ EngineService ]
})
export class GridNaiveSceneComponent {

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

    // create tiles
    const cellSize = 1;
    const gridSize = 30;

    const terrainTex = new Texture('/assets/art/textures/terrain-atlas1.png', this.engineService.scene, false, false, Texture.BILINEAR_SAMPLINGMODE);

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

    const cellMeshes: Mesh[][] = [];
    for (let y = 0; y < gridSize; ++y) {
      const row: Mesh[] = [];
      for (let x = 0; x < gridSize; ++x) {

        const plane = MeshBuilder.CreatePlane('terraincell', { size: cellSize }, this.engineService.scene);
        plane.rotate(new Vector3(1, 0, 0), Tools.ToRadians(90));
        plane.position = new Vector3(
          x * cellSize - cellSize*gridSize/2, 
          0, 
          y * cellSize - cellSize*gridSize/2
        );
        
        const terrainMat = new ShaderMaterial('MatTerrain', this.engineService.scene, '/assets/shaders/terraincell', {
          attributes: ['position', 'normal', 'uv'],
          uniforms: ['worldViewProjection']
        });
        terrainMat.setTexture('textureSampler', terrainTex);

        const uvCoordinates = GroundTileLibrary.getTileUVs(tiles[y][x]);
        terrainMat.setVector2('uvStart', uvCoordinates.topLeft);
        terrainMat.setVector2('uvEnd', uvCoordinates.bottomRight);
        terrainMat.setFloat('cellSize', cellSize);

        plane.material = terrainMat;
        row.push(plane);

      }
      cellMeshes.push(row);
    }

  }

}
