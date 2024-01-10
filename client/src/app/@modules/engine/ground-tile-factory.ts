import { Mesh, Scene, VertexData, Texture, StandardMaterial, Color3 } from '@babylonjs/core';

import { GroundTileType, GroundTileLibrary } from './ground-tile-library';

export class GroundTileFactory {

    private static _tileSize = 1;
    private static _groundTexture: Texture;
    private static _groundMaterial: StandardMaterial;

    static getTileSize(): number {
        return this._tileSize;
    }

    static createGroundTileMesh(type: GroundTileType, scene: Scene): Mesh {

        const tileMesh = new Mesh('groundTile', scene);

        const positionOffset = GroundTileFactory._tileSize / 2;
        const positionTopLeft = 0 - positionOffset;
        const positionBottomRight = 0 + positionOffset;
        const positions = [
            positionTopLeft, 0, positionBottomRight,
            positionBottomRight, 0, positionBottomRight,
            positionBottomRight, 0, positionTopLeft,
            positionTopLeft, 0, positionTopLeft
        ];

        const indices = [   // face indices must be in counter-clockwise order for normals to be computed correctly
            0, 2, 1,
            0, 3, 2
        ];

        const UVCoords = GroundTileLibrary.getTileUVs(type);
        const uvs = [
            UVCoords.topLeft.x, UVCoords.bottomRight.y,
            UVCoords.bottomRight.x, UVCoords.bottomRight.y,
            UVCoords.bottomRight.x, UVCoords.topLeft.y,
            UVCoords.topLeft.x, UVCoords.topLeft.y
        ];

        const normals: any[] = [];
        VertexData.ComputeNormals(positions, indices, normals);

        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        vertexData.applyToMesh(tileMesh);
        // tileMesh.convertToFlatShadedMesh();

        if (!GroundTileFactory._groundTexture) {
            // GroundTileFactory._groundTexture = new Texture('/assets/art/textures/terrain-atlas1.png', scene, false, false, Texture.NEAREST_SAMPLINGMODE);
            GroundTileFactory._groundTexture = new Texture('/assets/art/textures/terrain-atlas1.png', scene, false, false, Texture.TRILINEAR_SAMPLINGMODE);
        }

        if (!GroundTileFactory._groundMaterial) {
            GroundTileFactory._groundMaterial = new StandardMaterial('MatTerrain', scene);
            GroundTileFactory._groundMaterial.diffuseTexture = GroundTileFactory._groundTexture;
            GroundTileFactory._groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
        }
        // GroundTileFactory._groundMaterial.wireframe = true;

        tileMesh.material = GroundTileFactory._groundMaterial;
        return tileMesh;
    }

}
