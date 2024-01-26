import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HemisphericLight, Vector3, ShaderMaterial, Mesh, MeshBuilder, Tools, Matrix, UniformBuffer, VertexData, StandardMaterial, Color3, Material, Vector2 } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
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
  selector: 'app-thin-grid-scene',
  templateUrl: './thin-grid-scene.component.html',
  styleUrls: ['./thin-grid-scene.component.scss'],
  providers: [ EngineService ]
})
export class ThinGridSceneComponent {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;
  tileSize = 1;
  gridWidth = 3;
  gridHeight = 3;

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

    const terrainLayer_Dirt: TerrainGridLayerParams = {
      gridSize: new Vector2(3, 3),
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
      gridSize: new Vector2(3, 3),
      tileSize: this.tileSize,
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

    const layerEntities: { [key: string]: TerrainTileEntity[] } = {};
    layerEntities[TerrainTextureType.Dirt] = this.createTerrainLayerEntities(terrainLayer_Dirt);
    layerEntities[TerrainTextureType.Grass] = this.createTerrainLayerEntities(terrainLayer_Grass);

    const sortedTileEntities: SortedTerrainTileEntities = this.sortEntities(layerEntities);
    this.createThinMeshes(sortedTileEntities);

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
    const vertPosOffset = this.tileSize / 2;
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
      Matrix.Translation(idx.x, idx.y/1000, idx.z).copyToArray(bufferMatrices, byteOffset);
      // Matrix.Translation(idx.x, idx.z, idx.y).copyToArray(bufferMatrices, byteOffset);
    }
    tileMesh.thinInstanceSetBuffer('matrix', bufferMatrices, 16, true);
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
