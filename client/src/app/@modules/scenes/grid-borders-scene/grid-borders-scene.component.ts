import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HemisphericLight, Vector3, Mesh, VertexData, Vector2 } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Subject, Observable } from 'rxjs';

import { EngineService } from '../../engine/engine.service';
import { 
  TerrainTextureAtlas, 
  TerrainTextureType, 
  TerrainTileType, 
  GrassTileType, 
  DirtTileType 
} from 'src/app/@shared/util/terrain-texture-atlas';
import { EngineUtil } from 'src/app/@shared/util/engine-util';

@Component({
  selector: 'app-grid-borders-scene',
  templateUrl: './grid-borders-scene.component.html',
  styleUrls: ['./grid-borders-scene.component.scss'],
  providers: [ EngineService ]
})
export class GridBordersSceneComponent {

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

  async setup() {
    // setup + start engine
    this.engineService.setupEngine( this.canvas );
    await this.setupScene();
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

  async setupScene() {
  
    // set light
    const light = new HemisphericLight("myLight", new Vector3(1, 2, -1), this.engineService.scene);
    light.intensity = 0.85;

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, Vector3.Zero(), this.engineService.scene);
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(this.canvas.nativeElement, true);
    this.engineService.setCamera(camera);

    // console.log(GrassTileType);
    // console.log( TerrainTextureAtlas.getTileUVsArray( TerrainTextureType.Dirt ) );

    const tileSize = 1;

    const terrainLayer_Dirt: TerrainGridLayerParams = {
      gridSize: new Vector2(3, 3),
      tileSize,
      origin: new Vector2(0, 0),
      order: 0,
      textureType: TerrainTextureType.Dirt,
      tiles: [
        [[DirtTileType.Dirt_0], [DirtTileType.Dirt_1], null],
        [null, [DirtTileType.Dirt_0], null],
        [null, null, null]
      ]
    };

    const terrainLayer_Grass: TerrainGridLayerParams = {
      gridSize: new Vector2(3, 3),
      tileSize,
      origin: new Vector2(0, 0),
      order: 1,
      textureType: TerrainTextureType.Grass,
      tiles: [
        [[GrassTileType.Grass_Border_B], [GrassTileType.Grass_Border_CBL, GrassTileType.Grass_Border_R], [GrassTileType.Grass_0]],
        [[GrassTileType.Grass_1], [GrassTileType.Grass_Border_RBL], [GrassTileType.Grass_0]],
        [[GrassTileType.Grass_2], [GrassTileType.Grass_0], [GrassTileType.Grass_2]]
      ]
    };

    // @todo: generate borders automatically

    // const textureType = TerrainTextureType.Grass;
    // const tileType = GrassTileType.Grass_Border_BLT;
    // const tile = await this.createTileMesh(textureType, tileType);

    const layerMeshes: { [key: string]: TerrainTileMeshRef[] } = {};
    layerMeshes[TerrainTextureType.Dirt] = await this.createTerrainLayer(terrainLayer_Dirt);
    layerMeshes[TerrainTextureType.Grass] = await this.createTerrainLayer(terrainLayer_Grass);
    console.log(layerMeshes);
  }

  async createTerrainLayer(layer: TerrainGridLayerParams): Promise<TerrainTileMeshRef[]> {
    const gridDimensions = new Vector2(layer.gridSize.x * layer.tileSize, layer.gridSize.y * layer.tileSize);

     const tasks: Promise<{x: number, y: number, mesh: Mesh}>[] = layer.tiles.map( (row, idxy) => {
      return row.map( (tiles, idxx) => {
        if (tiles === null)
          return null;
        
        const tileOrigin = new Vector3(idxx - gridDimensions.x/2 + layer.tileSize/2, layer.order/1000, idxy - gridDimensions.y/2 + layer.tileSize/2);
        return tiles.map(tile => {

          return new Promise<{x: number, y: number, mesh: Mesh}>( (resolve, reject) => {
            this.createTileMesh(layer.textureType, tile, layer.tileSize, tileOrigin).then(mesh => {

              resolve({
                x: idxx, 
                y: idxy,
                textureType: layer.textureType,
                tileType: tile,
                mesh
              } as TerrainTileMeshRef);

            }).catch(err => reject(err));
          });

        });

      }).flat();
    }).flat()
      .filter(task => task);

    return Promise.all(tasks) as Promise<TerrainTileMeshRef[]>;
  }

  async createTileMesh(textureType: TerrainTextureType, tileType: TerrainTileType, tileSize: number, position: Vector3): Promise<Mesh> {
    
    const tileUVs = TerrainTextureAtlas.getTileUVs(tileType);
    const uvs = [
      tileUVs.topLeft.x, tileUVs.bottomRight.y,
      tileUVs.bottomRight.x, tileUVs.bottomRight.y,
      tileUVs.bottomRight.x, tileUVs.topLeft.y,
      tileUVs.topLeft.x, tileUVs.topLeft.y
    ];

    const tileMesh = new Mesh('MeshGroundTile', this.engineService.scene);
    const vertPosOffset = tileSize / 2;
    const vertPosTopLeft = -vertPosOffset;
    const vertPosBottomRight = vertPosOffset;
    const vertPositions = [
      position.x + vertPosTopLeft, position.y, position.z + vertPosBottomRight,
      position.x + vertPosBottomRight, position.y, position.z + vertPosBottomRight,
      position.x + vertPosBottomRight, position.y, position.z + vertPosTopLeft,
      position.x + vertPosTopLeft, position.y, position.z + vertPosTopLeft
    ];
    
    const faceIndices = [   // face indices must be in counter-clockwise order for normals to be computed correctly
      0, 2, 1,
      0, 3, 2
    ];

    const vertNormals: any[] = [];
    VertexData.ComputeNormals(vertPositions, faceIndices, vertNormals);

    const vertData = new VertexData();
    vertData.positions = vertPositions;
    vertData.indices = faceIndices;
    vertData.normals = vertNormals;
    vertData.uvs = uvs;
    vertData.applyToMesh(tileMesh);

    const matId = `MatTerrain_${textureType}`;
    const mat = await EngineUtil.LoadTerrainMaterialAsync(matId, TerrainTextureAtlas.getTextureUrl(textureType), this.engineService.scene);
    tileMesh.material = mat;
    
    return tileMesh;
  }

}

interface TerrainGridLayerParams {
  gridSize: Vector2;
  tileSize: number;
  origin: Vector2;
  order: number;
  textureType: TerrainTextureType;
  tiles: TerrainTileType[][][];
}

interface TerrainTileMeshRef {
  x: number, 
  y: number,
  textureType: TerrainTextureType,
  tileType: TerrainTileType,
  mesh: Mesh
}
