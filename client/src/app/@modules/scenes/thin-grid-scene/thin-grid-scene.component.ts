import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HemisphericLight, Vector3, ShaderMaterial, Mesh, MeshBuilder, Tools, Matrix, UniformBuffer, VertexData, StandardMaterial, Color3, Material, Vector2 } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Subject, Observable, takeUntil, filter, first } from 'rxjs';

import { EngineService } from '../../engine/engine.service';
import { 
  TerrainTextureAtlas, 
  TerrainTextureType, 
  TerrainTileType, 
  GrassTileType, 
  DirtTileType,
  TileBorderType
} from 'src/app/@shared/util/terrain-texture-atlas';
import { EditorSocketApiService } from '../../editor-api/editor-socket-api.service';
import { CardinalDirection, EngineUtil } from 'src/app/@shared/util/engine-util';
import { GridUtil } from 'src/app/@shared/util/grid-util';
import { Util } from 'src/app/@shared/util/util';

@Component({
  selector: 'app-thin-grid-scene',
  templateUrl: './thin-grid-scene.component.html',
  styleUrls: ['./thin-grid-scene.component.scss'],
  providers: [ EngineService ]
})
export class ThinGridSceneComponent {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  tileSize: number;
  gridWidth: number;
  gridHeight: number;

  private _destroy$ = new Subject<void>();

  constructor(
    private engineService: EngineService,
    private editorSocketApiService: EditorSocketApiService,
    private ngZone: NgZone
  ) { }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngAfterViewInit(): void {
    this.setup();
  }

  async setup() {

    this.editorSocketApiService.connect().pipe(
      takeUntil(this._destroy$),
      filter(isConnected => isConnected),
      first()
    ).subscribe(async () => {
      // setup + start engine
      this.engineService.setupEngine( this.canvas );
      await this.setupScene();
      this.startRenderLoop();
      // this.engineService.showInspector();
    });

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

    // this.createTerrain_Manual();
    this.createTerrain_Generated();
    // this.createTerrain_Test();
  }

  createTerrain_Test() {
    this.tileSize = 1;
    this.gridWidth = 3;
    this.gridHeight = 3;

    const terrainLayer_Dirt: TerrainGridLayerParams = {
      gridSize: new Vector2(this.gridWidth, this.gridHeight),
      tileSize: this.tileSize,
      origin: new Vector2(0, 0),
      order: 0,
      textureType: TerrainTextureType.Dirt,
      tiles: [
        [[DirtTileType.Dirt_0], [DirtTileType.Dirt_0], [DirtTileType.Dirt_0]],
        [[DirtTileType.Dirt_0], [DirtTileType.Dirt_0], [DirtTileType.Dirt_0]],
        [[DirtTileType.Dirt_0], [DirtTileType.Dirt_0], [DirtTileType.Dirt_0]],
      ]
    };

    const terrainLayer_Grass: TerrainGridLayerParams = {
      gridSize: new Vector2(this.gridWidth, this.gridHeight),
      tileSize: this.tileSize,
      origin: new Vector2(0, 0),
      order: 1,
      textureType: TerrainTextureType.Grass,
      tiles: [
        // [[GrassTileType.Grass_0], [GrassTileType.Grass_0], [GrassTileType.Grass_0]],
        // [null, null, null],
        // [[GrassTileType.Grass_0], [GrassTileType.Grass_0], [GrassTileType.Grass_0]]

        // [[GrassTileType.Grass_0], null, null],
        // [null, [GrassTileType.Grass_0], null],
        // [null, null, [GrassTileType.Grass_0]]

        [null, null, null],
        [null, [GrassTileType.Grass_0], null],
        [null, null, null]
      ]
    };

    this.generateLayerBorders(terrainLayer_Grass);

    const layerEntities: { [key: string]: TerrainTileEntity[] } = {};
    layerEntities[TerrainTextureType.Dirt] = this.createTerrainLayerEntities(terrainLayer_Dirt);
    layerEntities[TerrainTextureType.Grass] = this.createTerrainLayerEntities(terrainLayer_Grass);

    const sortedTileEntities: SortedTerrainTileEntities = this.sortEntities(layerEntities);
    this.createThinMeshes(sortedTileEntities);
  }

  createTerrain_Manual() {
    this.tileSize = 1;
    this.gridWidth = 3;
    this.gridHeight = 3;

    const terrainLayer_Dirt: TerrainGridLayerParams = {
      gridSize: new Vector2(this.gridWidth, this.gridHeight),
      tileSize: this.tileSize,
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
      gridSize: new Vector2(this.gridWidth, this.gridHeight),
      tileSize: this.tileSize,
      origin: new Vector2(0, 0),
      order: 1,
      textureType: TerrainTextureType.Grass,
      tiles: [
        // [[GrassTileType.Grass_Border_T], [GrassTileType.Grass_Border_CLT, GrassTileType.Grass_Border_R], [GrassTileType.Grass_0]],
        // [[GrassTileType.Grass_1], [GrassTileType.Grass_Border_LTR], [GrassTileType.Grass_0]],
        // [[GrassTileType.Grass_2], [GrassTileType.Grass_0], [GrassTileType.Grass_2]]
        [null, null, [GrassTileType.Grass_0]],
        [[GrassTileType.Grass_1], null, [GrassTileType.Grass_0]],
        [[GrassTileType.Grass_2], [GrassTileType.Grass_0], [GrassTileType.Grass_2]]
      ]
    };

    this.generateLayerBorders(terrainLayer_Grass);

    const layerEntities: { [key: string]: TerrainTileEntity[] } = {};
    layerEntities[TerrainTextureType.Dirt] = this.createTerrainLayerEntities(terrainLayer_Dirt);
    layerEntities[TerrainTextureType.Grass] = this.createTerrainLayerEntities(terrainLayer_Grass);

    const sortedTileEntities: SortedTerrainTileEntities = this.sortEntities(layerEntities);
    this.createThinMeshes(sortedTileEntities);
  }

  createTerrain_Generated() {
    this.tileSize = 1;
    this.gridWidth = 64;
    this.gridHeight = 64;
    // this.gridWidth = 3;
    // this.gridHeight = 3;

    const terrainLayer_Dirt: TerrainGridLayerParams = {
      gridSize: new Vector2(this.gridWidth, this.gridHeight),
      tileSize: this.tileSize,
      origin: new Vector2(0, 0),
      order: 0,
      textureType: TerrainTextureType.Dirt,
      tiles: []
    };

    const terrainLayer_Grass: TerrainGridLayerParams = {
      gridSize: new Vector2(this.gridWidth, this.gridHeight),
      tileSize: this.tileSize,
      origin: new Vector2(0, 0),
      order: 1,
      textureType: TerrainTextureType.Grass,
      tiles: []
    };

    // generate base tile maps
    terrainLayer_Dirt.tiles = Array(this.gridHeight).fill(null).map(() => Array(this.gridWidth).fill(null));
    terrainLayer_Grass.tiles = Array(this.gridHeight).fill(null).map(() => Array(this.gridWidth).fill(null));

    for (let y = 0; y < this.gridHeight; ++y) {
      for (let x = 0; x < this.gridWidth; ++x) {
        const textureType = Util.getRandomIntInRange(0, 9);
        
        if (textureType < 6) {        // dirt
          const tileType = Util.getRandomIntInRange(0, 1);
          terrainLayer_Dirt.tiles[y][x] = [tileType];
        }
        else if (textureType >= 6) {   // grass
          const tileType = Util.getRandomIntInRange(0, 2);
          terrainLayer_Grass.tiles[y][x] = [tileType];
        }
      }
    }

    // generate border tiles
    this.generateLayerBorders(terrainLayer_Grass);

    // create thin meshes
    const layerEntities: { [key: string]: TerrainTileEntity[] } = {};
    layerEntities[TerrainTextureType.Dirt] = this.createTerrainLayerEntities(terrainLayer_Dirt);
    layerEntities[TerrainTextureType.Grass] = this.createTerrainLayerEntities(terrainLayer_Grass);

    const sortedTileEntities: SortedTerrainTileEntities = this.sortEntities(layerEntities);
    this.createThinMeshes(sortedTileEntities);
  }

  generateLayerBorders(layer: TerrainGridLayerParams): void {
    for (let y = 0; y < layer.tiles.length; ++y) {
      for (let x = 0; x < layer.tiles[y].length; ++x) {
        const borders = this.generateTileBorderTypes(new Vector2(x, y), layer);
        if (borders.length === 0)
          continue;
        
        layer.tiles[y][x] = layer.tiles[y][x] === null ? borders as any[] : layer.tiles[y][x].concat(borders as any);
      }  
    }
  }

  generateTileBorderTypes(tileIndex: Vector2, layer: TerrainGridLayerParams): TileBorderType[] {
    let isBaseTile;
    if (layer.tiles[tileIndex.y][tileIndex.x] === null)
      isBaseTile = false;
    else
      isBaseTile = layer.tiles[tileIndex.y][tileIndex.x]
        .reduce((acc, cur) => acc && TerrainTextureAtlas.tileTypeIsBaseType(cur, layer.textureType), true);
    if (isBaseTile)
      return [];

    const neighborIndexMap: Vector2[][] = [
      [ GridUtil.getIndexByDirection(tileIndex, CardinalDirection.NW, layer.gridSize),  GridUtil.getIndexByDirection(tileIndex, CardinalDirection.N, layer.gridSize), GridUtil.getIndexByDirection(tileIndex, CardinalDirection.NE, layer.gridSize) ],
      [ GridUtil.getIndexByDirection(tileIndex, CardinalDirection.W, layer.gridSize),   tileIndex,                                                                    GridUtil.getIndexByDirection(tileIndex, CardinalDirection.E, layer.gridSize) ],
      [ GridUtil.getIndexByDirection(tileIndex, CardinalDirection.SW, layer.gridSize),  GridUtil.getIndexByDirection(tileIndex, CardinalDirection.S, layer.gridSize), GridUtil.getIndexByDirection(tileIndex, CardinalDirection.SE, layer.gridSize) ]
    ];

    const baseTileMap: boolean[][] = [];
    for (let y = 0; y < 3; ++y) {
      const row: boolean[] = [];
      for (let x = 0; x < 3; ++x) {
        if (y === 1 && x === 1) {
          row.push(null); // exclude origin tile
          continue;
        }
        if (neighborIndexMap[y][x] === null) {
          row.push(null); // exclude tiles out of bounds
          continue;
        }

        const tileIdx = new Vector2(tileIndex.x + x-1, tileIndex.y + y-1);
        let isBaseTile;
        if (layer.tiles[tileIdx.y][tileIdx.x] === null)
          isBaseTile = false;
        else {
          isBaseTile = layer.tiles[tileIdx.y][tileIdx.x]
            .reduce((acc, cur) => acc && TerrainTextureAtlas.tileTypeIsBaseType(cur, layer.textureType), true);
        }
        row.push(isBaseTile);
      }
      baseTileMap.push(row);
    }
    
    // generate borders
    const borders: TileBorderType[] = [];

    //  In these diagrams, the center is always the origin tile/the one being evaluated/whose borders are being generated.
    //  The other tiles represent the neighboring tiles in relation to the origin tile.
    //
    //  Each tile can have one of the following symbols, representing their tile type:
    //  
    //  A: Any tile type
    //  O: The origin tile (the one being evaluated/whose borders are currently being generated)
    //  T: Base tile (true)
    //  F: Non-base tile (false)

    /*
     *  A|T|A
     *  F|O|F
     *  A|A|A
     */
    if (baseTileMap[0][1] && !baseTileMap[1][0] && !baseTileMap[1][2])
      borders.push(TileBorderType.B);

    /*
     *  A|F|A
     *  A|O|T
     *  A|F|A
     */
    if (!baseTileMap[0][1] && baseTileMap[1][2] && !baseTileMap[2][1])
      borders.push(TileBorderType.R);
    
    /*
     *  A|A|A
     *  F|O|F
     *  A|T|A
     */
    if (!baseTileMap[1][0] && !baseTileMap[1][2] && baseTileMap[2][1])
      borders.push(TileBorderType.T);

    /*
     *  A|F|A
     *  T|O|A
     *  A|F|A
     */
    if (!baseTileMap[0][1] && baseTileMap[1][0] && !baseTileMap[2][1])
      borders.push(TileBorderType.L);

    /*
     *  A|F|T
     *  A|O|F
     *  A|A|A
     */
    if (!baseTileMap[0][1] && baseTileMap[0][2] && !baseTileMap[1][2])
      borders.push(TileBorderType.CRB);

    /*
     *  A|A|A
     *  A|O|F
     *  A|F|T
     */
    if (!baseTileMap[1][2] && !baseTileMap[2][1] && baseTileMap[2][2])
      borders.push(TileBorderType.CTR);

    /*
     *  A|A|A
     *  F|O|A
     *  T|F|A
     */
    if (!baseTileMap[1][0] && baseTileMap[2][0] && !baseTileMap[2][1])
      borders.push(TileBorderType.CLT);

    /*
     *  T|F|A
     *  F|O|A
     *  A|A|A
     */
    if (baseTileMap[0][0] && !baseTileMap[0][1] && !baseTileMap[1][0])
      borders.push(TileBorderType.CBL);

    /*
     *  A|T|A
     *  F|O|T
     *  A|F|A
     */
    if (baseTileMap[0][1] && !baseTileMap[1][0] && baseTileMap[1][2] && !baseTileMap[2][1])
      borders.push(TileBorderType.RB);

    /*
     *  A|F|A
     *  F|O|T
     *  A|T|A
     */
    if (!baseTileMap[0][1] && !baseTileMap[1][0] && baseTileMap[1][2] && baseTileMap[2][1])
      borders.push(TileBorderType.TR);

    /*
     *  A|F|A
     *  T|O|F
     *  A|T|A
     */
    if (!baseTileMap[0][1] && baseTileMap[1][0] && !baseTileMap[1][2] && baseTileMap[2][1])
      borders.push(TileBorderType.LT);

    /*
     *  A|T|A
     *  T|O|F
     *  A|F|A
     */
    if (baseTileMap[0][1] && baseTileMap[1][0] && !baseTileMap[1][2] && !baseTileMap[2][1])
      borders.push(TileBorderType.BL);
  
    /*
     *  A|T|A
     *  F|O|T
     *  A|T|A
     */
    if (baseTileMap[0][1] && !baseTileMap[1][0] && baseTileMap[1][2] && baseTileMap[2][1])
      borders.push(TileBorderType.TRB);

    /*
     *  A|F|A
     *  T|O|T
     *  A|T|A
     */
    if (!baseTileMap[0][1] && baseTileMap[1][0] && baseTileMap[1][2] && baseTileMap[2][1])
      borders.push(TileBorderType.LTR);

    /*
     *  A|T|A
     *  T|O|F
     *  A|T|A
     */
    if (baseTileMap[0][1] && baseTileMap[1][0] && !baseTileMap[1][2] && baseTileMap[2][1])
      borders.push(TileBorderType.BLT);

    /*
     *  A|T|A
     *  T|O|T
     *  A|F|A
     */
    if (baseTileMap[0][1] && baseTileMap[1][0] && baseTileMap[1][2] && !baseTileMap[2][1])
      borders.push(TileBorderType.RBL);

    /*
     *  A|T|A
     *  T|O|T
     *  A|T|A
     */
    if (baseTileMap[0][1] && baseTileMap[1][0] && baseTileMap[1][2] && baseTileMap[2][1])
      borders.push(TileBorderType.TRBL);

    return borders;
  }

  createTerrainLayerEntities(layer: TerrainGridLayerParams): TerrainTileEntity[] {
    return layer.tiles.map((row, idxy) => (
      row.map((tiles, idxx) => {
        if (tiles === null)
          return null;

        return tiles.map(tile => ({
          x: idxx, 
          y: idxy,
          order: layer.order,
          textureType: layer.textureType,
          tileType: tile
        }));
      }).flat()
    )).flat()
      .filter(def => def);
  }

  sortEntities(entitiesByLayer: { [key: string]: TerrainTileEntity[] }): SortedTerrainTileEntities {
    const sortedEntities = {};
    
    Object.keys(entitiesByLayer).forEach(textureType => {
      if ( !(textureType in sortedEntities) )
        (sortedEntities as any)[textureType] = {};        
      const tileTypes = (sortedEntities as any)[textureType];
      
      entitiesByLayer[textureType].forEach(tileEntity => {
        if ( !(tileEntity.tileType in tileTypes) ) {
          tileTypes[tileEntity.tileType] = {
            indexes: [],
            mesh: null
          } as TerrainTileEntityRef;
        }

        tileTypes[tileEntity.tileType].indexes.push(
          new Vector3(tileEntity.x, tileEntity.order, tileEntity.y)
        );
      });
    });

    return sortedEntities;
  }

  createThinMeshes(terrainTileEntities: SortedTerrainTileEntities) {
    for (const textureType of Object.keys(terrainTileEntities)) {
      for (const tileType of Object.keys(terrainTileEntities[textureType])) {
        const tileRef = terrainTileEntities[textureType][tileType as any];
        this.createThinMeshesForEntity(textureType as any, tileType as any, tileRef);
      }
    }    
  }

  async createThinMeshesForEntity(textureType: TerrainTextureType, tileType: TerrainTileType, tileEntity: TerrainTileEntityRef) {
    
    // console.log(textureType, tileType, tileEntity);

    // const mesh = MeshBuilder.CreatePlane('MeshGroundTile', { size: this.tileSize }, this.engineService.scene);
    // mesh.rotate(new Vector3(1, 0, 0), Math.PI / 2);  // rotate 90 deg on X axis to use as ground plane
    // const matId = `MatTerrain_${textureType}`;
    // mesh.material = await EngineUtil.LoadTerrainMaterialAsync(matId, TerrainTextureAtlas.getTextureUrl(textureType), this.engineService.scene);

    const tileUVs = TerrainTextureAtlas.getTileUVs(tileType);
    const uvs = [
      tileUVs.topLeft.x, tileUVs.bottomRight.y,
      tileUVs.bottomRight.x, tileUVs.bottomRight.y,
      tileUVs.bottomRight.x, tileUVs.topLeft.y,
      tileUVs.topLeft.x, tileUVs.topLeft.y
    ];

    const tileMesh = new Mesh('MeshGroundTile', this.engineService.scene);
    const vertPosOffset = this.tileSize / 2 + 0.001;
    // const vertPosOffset = this.tileSize / 2;
    const vertPosTopLeft = -vertPosOffset;
    const vertPosBottomRight = vertPosOffset;
    const vertPositions = [
      vertPosTopLeft, 0, vertPosBottomRight,
      vertPosBottomRight, 0, vertPosBottomRight,
      vertPosBottomRight, 0, vertPosTopLeft,
      vertPosTopLeft, 0, vertPosTopLeft
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

    const bufferMatrices = new Float32Array(16 * tileEntity.indexes.length);
    for (let i = 0; i < tileEntity.indexes.length; ++i) {
      const idx = tileEntity.indexes[i];
      const byteOffset = i * 16;
      Matrix.Translation(idx.x*this.tileSize, idx.y*this.tileSize/1000, -idx.z*this.tileSize).copyToArray(bufferMatrices, byteOffset);
      // Matrix.Translation(idx.x, idx.z, idx.y).copyToArray(bufferMatrices, byteOffset);
    }
    tileMesh.thinInstanceSetBuffer('matrix', bufferMatrices, 16, true);

    const position = new Vector3(
      -this.gridWidth * this.tileSize / 2 + this.tileSize / 2, 
      0, 
      this.gridHeight * this.tileSize / 2 - this.tileSize / 2
    );
    tileMesh.position = position;

    tileEntity.mesh = tileMesh;
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

interface TerrainTileEntity {
  x: number, 
  y: number,
  order: number,
  textureType: TerrainTextureType,
  tileType: TerrainTileType
}

interface SortedTerrainTileEntities {
  [textureType: string]: {
    [tileType: number]: TerrainTileEntityRef
  }
}

interface TerrainTileEntityRef {
  indexes: Vector3[],
  mesh: Mesh
}
