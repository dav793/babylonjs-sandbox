precision highp float;

varying vec3 vPosition;
varying vec2 vUV;

uniform sampler2D textureSampler;
uniform vec2 uvStart;
uniform vec2 uvEnd;
uniform float cellSize;

// float getUVOffset(float normalizedPosition, float uvRange) {
//     return uvRange * normalizedPosition;
// }

// @todo: optimization (precompute uvRange)
vec2 getUVOffset(vec2 normalizedPosition, vec2 uvStart, vec2 uvEnd) {
    vec2 uvRange = vec2(uvEnd.x - uvStart.x, uvEnd.y - uvStart.y);
    return vec2(
        uvStart.x + uvRange.x * normalizedPosition.x,
        uvStart.y + uvRange.y * normalizedPosition.y
    );
}

vec2 normalizePosition() {
    return vec2(
        (vPosition.x / cellSize) + 0.5f, 
        (vPosition.y / cellSize) + 0.5f
    );
}

void main(void) {
    
    vec2 normalizedPosition = normalizePosition();
    vec2 UVOffset = getUVOffset(normalizedPosition, uvStart, uvEnd);
    
    gl_FragColor = texture2D(textureSampler, UVOffset); 

}