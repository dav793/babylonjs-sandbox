import { Vector2 } from '@babylonjs/core';

export class GroundTileLibrary {

    private static _tileSize = 128;
    private static _textureSizeX = 640;
    private static _textureSizeY = 640;
    private static _columnLength = GroundTileLibrary._textureSizeY / GroundTileLibrary._tileSize;

    static getTileUVs(type: GroundTileType): UV_Coordinates {

        const colIndex = Math.floor(type / GroundTileLibrary._columnLength);
        const rowIndex = type % GroundTileLibrary._columnLength;

        const topLeft = new Vector2(
            (colIndex * GroundTileLibrary._tileSize + 1) / GroundTileLibrary._textureSizeX,
            (rowIndex * GroundTileLibrary._tileSize + 1) / GroundTileLibrary._textureSizeY
        );

        const bottomRight = new Vector2(
            ((colIndex+1) * GroundTileLibrary._tileSize - 1) / GroundTileLibrary._textureSizeX,
            ((rowIndex+1) * GroundTileLibrary._tileSize - 1) / GroundTileLibrary._textureSizeY,
        );

        return { topLeft, bottomRight };
    }

}

export enum GroundTileType {
    Grass = 0,
    Grass_Clovers = 1,
    Grass_Flowers = 2,
    Grass_Leaves = 3,
    Grass_Pebbles = 4,
    Footpath = 5,
    Gravel = 6,
    Dirt = 7,
    Dirt_Cracked = 8,
    Dirt_Cracked_Pebbles = 9,
    Stone = 10,
    Cobblestone = 11,
    Ruin_Path = 12,
    Leaves = 13,
    Mud_Debris = 14,
    Moss = 15,
    Rock_Rough_Moss = 16,
    Moss_Rock = 17,
    Rock_Moss = 18,
    Mud = 19
};

export interface UV_Coordinates {
    topLeft: Vector2,
    bottomRight: Vector2
};
