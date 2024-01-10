precision highp float;

// Uniforms
uniform sampler2D textureSampler;
uniform float groundSize;
uniform float cellSize;
uniform float gradientSharpness;
uniform vec4 gridColor;

// Varying
varying vec3 vPosition;
varying vec2 vUV;

vec4 getAlphaBlendedColor(vec4 sourceColor, vec4 addColor) {
    // painter's algorithm (straight alpha blending)
    // see: https://en.m.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
    float alphaOver = addColor.a + sourceColor.a * (1.f-addColor.a);
    return vec4(
        (addColor.r*addColor.a + sourceColor.r*sourceColor.a * (1.f-addColor.a)) / alphaOver,
        (addColor.g*addColor.a + sourceColor.g*sourceColor.a * (1.f-addColor.a)) / alphaOver,
        (addColor.b*addColor.a + sourceColor.b*sourceColor.a * (1.f-addColor.a)) / alphaOver,
        sourceColor.a
    );
}

void main(void) {

    vec4 color = texture2D(textureSampler, vUV);

    // grid lines
    float modx = mod(vPosition.x, cellSize);
    float diffx = min( modx, abs(modx-cellSize) );
    float mody = mod(vPosition.y, cellSize);
    float diffy = min( mody, abs(mody-cellSize) );
    
    float gridAlphaX = gridColor.a * clamp((1.f - diffx*gradientSharpness), 0.f, 1.f);
    if (gridAlphaX > 0.f)
        color = getAlphaBlendedColor( color, vec4( gridColor.rgb, gridAlphaX ) );

    float gridAlphaY = gridColor.a * clamp((1.f - diffy*gradientSharpness), 0.f, 1.f);
    if (gridAlphaY > 0.f)
        color = getAlphaBlendedColor( color, vec4( gridColor.rgb, gridAlphaY ) );

    gl_FragColor = color;
}