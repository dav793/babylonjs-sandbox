precision highp float;

// Uniforms
uniform sampler2D textureSampler;
uniform float cellSize;
uniform float lineWidth;
uniform vec4 gridColor;

// Varying
varying vec3 vPosition;
varying vec2 vUV;

void main(void) {

    // grid lines
    vec4 color = texture2D(textureSampler, vUV);
    float modx = mod(vPosition.x + lineWidth/2.f, cellSize);
    float mody = mod(vPosition.y + lineWidth/2.f, cellSize);
    if ( modx < lineWidth || mody < lineWidth ) {
        // color *= vec4(gridColor.rgb, 1.f);

        // painter's algorithm (straight alpha blending)
        // see: https://en.m.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
        float alphaOver = gridColor.a + color.a * (1.f-gridColor.a);
        color = vec4(
            (gridColor.r*gridColor.a + color.r*color.a * (1.f-gridColor.a)) / alphaOver,
            (gridColor.g*gridColor.a + color.g*color.a * (1.f-gridColor.a)) / alphaOver,
            (gridColor.b*gridColor.a + color.b*color.a * (1.f-gridColor.a)) / alphaOver,
            color.a
        );
    }

    // center red lines
    // if (vPosition.x < 0.01f && vPosition.x > -0.01f) {
    //     color *= vec4(1.f, 0.f, 0.f, 1.f);
    // }
    // if (vPosition.y < 0.01f && vPosition.y > -0.01f) {
    //     color *= vec4(1.f, 0.f, 0.f, 1.f);
    // }

    gl_FragColor = color;
}