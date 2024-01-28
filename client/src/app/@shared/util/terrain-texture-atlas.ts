import { Vector2 } from '@babylonjs/core';

import { UV_Corner } from './engine-util';

export class TerrainTextureAtlas {

    private static _tileSize = 128;
    private static _textureSizeX = 1024;
    private static _textureSizeY = 1024;
    private static _columnLength = Math.floor(TerrainTextureAtlas._textureSizeY / TerrainTextureAtlas._tileSize);
    private static _rowLength = Math.floor(TerrainTextureAtlas._textureSizeX / TerrainTextureAtlas._tileSize);

    static getTileUVs(type: TerrainTileType): UV_Corner {
        if (type === null)
            return null;

        const borderPadding = 1.8;
        const colIndex = Math.floor(type / TerrainTextureAtlas._columnLength);
        const rowIndex = type % TerrainTextureAtlas._columnLength;

        const topLeft = new Vector2(
            (colIndex * TerrainTextureAtlas._tileSize + borderPadding) / TerrainTextureAtlas._textureSizeX,
            (rowIndex * TerrainTextureAtlas._tileSize + borderPadding) / TerrainTextureAtlas._textureSizeY
        );

        const bottomRight = new Vector2(
            ((colIndex+1) * TerrainTextureAtlas._tileSize - borderPadding) / TerrainTextureAtlas._textureSizeX,
            ((rowIndex+1) * TerrainTextureAtlas._tileSize - borderPadding) / TerrainTextureAtlas._textureSizeY,
        );

        return { topLeft, bottomRight };
    }

    static getTileUVsArray(type: TerrainTextureType): UV_Corner[] {
        const typeMap: any = TerrainTextureAtlas.getTileType(type); 

        const arrLength = TerrainTextureAtlas._rowLength * TerrainTextureAtlas._columnLength;
        const arr: UV_Corner[] = Array(arrLength).fill(-1);
        Object.keys(typeMap)
            .forEach(key => {
                if ( !isNaN(typeMap[key]) )
                    arr[ typeMap[key] ] = TerrainTextureAtlas.getTileUVs( typeMap[key] );
            });        

        return arr;
    }

    static getTileType(textureType: TerrainTextureType): TerrainTileType{
        let typeMap: any;
        switch(textureType) {
            case TerrainTextureType.Grass:
                typeMap = GrassTileType;
                break;
            case TerrainTextureType.Dirt:
                typeMap = DirtTileType;
                break;
        }
        if (!typeMap)
            throw new Error(`Terrain texture type ${textureType} does not exist`);

        return typeMap;
    }

    static getTextureUrl(type: TerrainTextureType): string {
        switch(type) {
            case TerrainTextureType.Grass:
                return '/assets/art/textures/terrain/Texture_Tiles_Grass.png';
            case TerrainTextureType.Dirt:
                return '/assets/art/textures/terrain/Texture_Tiles_Dirt.png';
        }
        throw new Error(`Terrain texture type ${type} does not exist`);
    }

    static tileTypeIsBaseType(tileType: any, textureType: TerrainTextureType): boolean {
        if (tileType === null)
            return false;
        
        const typeMap: any = TerrainTextureAtlas.getTileType(textureType); 
        
        const borderTypeValues = Object.keys(TileBorderType)
            .filter(key => isNaN((TileBorderType as any)[key]))
            .map(val => parseInt(val));

        const baseTypeValues = Object.keys(typeMap)
            .filter(key => isNaN(typeMap[key]))
            .map(val => parseInt(val))
            .filter(val => !borderTypeValues.includes(val));    // exclude borders
              
        return baseTypeValues.includes(tileType);
    }

}

export enum TerrainTextureType {
    Grass = "Grass",
    Dirt = "Dirt"
}

export enum GrassTileType {
    Grass_0 = 0,
    Grass_1 = 1,
    Grass_2 = 2,
    Grass_Border_T = 8,
    Grass_Border_R = 9,
    Grass_Border_B = 10,
    Grass_Border_L = 11,
    Grass_Border_CTR = 12,
    Grass_Border_CRB = 13,
    Grass_Border_CBL = 14,
    Grass_Border_CLT = 15,
    Grass_Border_TR = 16,
    Grass_Border_RB = 17,
    Grass_Border_BL = 18,
    Grass_Border_LT = 19,
    Grass_Border_TRB = 20,
    Grass_Border_RBL = 21,
    Grass_Border_BLT = 22,
    Grass_Border_LTR = 23,
    Grass_Border_TRBL = 24
}

export enum DirtTileType {
    Dirt_0 = 0,
    Dirt_1 = 1,
    Dirt_Border_T = 8,
    Dirt_Border_R = 9,
    Dirt_Border_B = 10,
    Dirt_Border_L = 11,
    Dirt_Border_CTR = 12,
    Dirt_Border_CRB = 13,
    Dirt_Border_CBL = 14,
    Dirt_Border_CLT = 15,
    Dirt_Border_TR = 16,
    Dirt_Border_RB = 17,
    Dirt_Border_BL = 18,
    Dirt_Border_LT = 19,
    Dirt_Border_TRB = 20,
    Dirt_Border_RBL = 21,
    Dirt_Border_BLT = 22,
    Dirt_Border_LTR = 23,
    Dirt_Border_TRBL = 24
}

export type TerrainTileType = GrassTileType | DirtTileType | null;

export enum TileBorderType {
    T = 8,
    R = 9,
    B = 10,
    L = 11,
    CTR = 12,
    CRB = 13,
    CBL = 14,
    CLT = 15,
    TR = 16,
    RB = 17,
    BL = 18,
    LT = 19,
    TRB = 20,
    RBL = 21,
    BLT = 22,
    LTR = 23,
    TRBL = 24
}