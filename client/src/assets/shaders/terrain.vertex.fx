precision highp float;

// Attributes
attribute vec3 position;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform float cellSize;
uniform float lineWidth;
uniform vec4 gridColor;

// Varying
varying vec2 vUV;
varying vec3 vPosition;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);

    vPosition = position;
    vUV = uv;
}