precision highp float;
precision lowp int;

varying vec3 vPosition;
varying vec2 vUV;

uniform sampler2D textureSampler;
uniform float[GRID_SIZE * GRID_SIZE] tiles;     // index of tile type for every tile
uniform float[TILE_TYPES_LENGTH * 2] uvStart;   // uv coordinates of where each tile type starts in the texture
uniform float[TILE_TYPES_LENGTH * 2] uvEnd;     // uv coordinates of where each tile type ends in the texture

// @todo: optimization (precompute uvRange)
vec2 getUVOffset(vec2 normalizedPosition, vec2 uvStart, vec2 uvEnd) {
    vec2 uvRange = vec2(uvEnd.x - uvStart.x, uvEnd.y - uvStart.y);
    return vec2(
        uvStart.x + uvRange.x * normalizedPosition.x,
        uvStart.y + uvRange.y * normalizedPosition.y
    );
}

void main(void) {
    
    float cellSize = float(CELL_SIZE);
    float gridSize = float(GRID_SIZE);

    vec2 offsetPosition = vec2(
        vPosition.x + (gridSize * cellSize)/2.f,
        vPosition.y + (gridSize * cellSize)/2.f
    );
    float cellx = floor( offsetPosition.x / cellSize );
    float celly = floor( offsetPosition.y / cellSize );
    
    vec2 normalizedPosition = vec2(
        (offsetPosition.x - cellx * cellSize) / cellSize,
        (offsetPosition.y - celly * cellSize) / cellSize
    );

    int tileIndex = int(tiles[ int(celly * gridSize + cellx) ]);
    vec2 uvStartTile = vec2(
        uvStart[tileIndex*2],
        uvStart[tileIndex*2 + 1]
    );
    vec2 uvEndTile = vec2(
        uvEnd[tileIndex*2],
        uvEnd[tileIndex*2 + 1]
    );

    vec2 UVOffset = getUVOffset(normalizedPosition, uvStartTile, uvEndTile);
    gl_FragColor = texture2D(textureSampler, UVOffset);

    // vec4 color = vec4(1.f, 0.f, 0.f, 1.f);
    // if (tileIndex == 0)
    //     color = vec4(0.f, 1.f, 0.f, 1.f);
    // gl_FragColor = color;

    // vec4 color = vec4(normalizedPosition.x, normalizedPosition.y, 0.f, 1.f);
    // gl_FragColor = color;

    // vec4 color = vec4(1.f, 0.f, 0.f, 1.f);
    // if (celly == 1.f)
    // // if (offsetPosition.y >= 1.f)
        // color = vec4(0.f, 1.f, 0.f, 1.f);
    // gl_FragColor = color;

    // vec4 color = vec4(1.f, 0.f, 0.f, 1.f);
    // if (TILE_TYPES_LENGTH == 20)
    // if (uvStart[39] == 0.8015625)
    // if (true == true)
    //     color = vec4(0.f, 1.f, 0.f, 1.f);
    // gl_FragColor = color;

    // vec2 normalizedPosition = normalizePosition();
    // vec2 UVOffset = getUVOffset(normalizedPosition, uvStart, uvEnd);
    // gl_FragColor = texture2D(textureSampler, UVOffset); 

    // gl_FragColor = texture2D(textureSampler, vUV);

}