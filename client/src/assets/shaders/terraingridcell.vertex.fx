precision highp float;
precision highp int;

// Attributes
attribute vec3 position;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform sampler2D textureSampler;
uniform float[GRID_SIZE * GRID_SIZE] tiles;
uniform float[TILE_TYPES_LENGTH * 2] uvStart;
uniform float[TILE_TYPES_LENGTH * 2] uvEnd;

// Varying
varying vec3 vPosition;
varying vec2 vUV;

void main(void) {
    vec4 outPosition = worldViewProjection * vec4(position, 1.0);
    gl_Position = outPosition;

    vUV = uv;
    vPosition = position;
}