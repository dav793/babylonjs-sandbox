precision highp float;

// Attributes
attribute vec3 position;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform float groundSize;
uniform float cellSize;
uniform float gradientSharpness;
uniform vec4 gridColor;
uniform int pointerOnMesh;
uniform vec2 pointerCoords;

// Varying
varying vec2 vUV;
varying vec3 vPosition;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);

    vPosition = position;
    vUV = uv;
}