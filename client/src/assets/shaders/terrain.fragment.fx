precision highp float;

// Uniforms
uniform sampler2D textureSampler;
uniform float groundSize;
uniform float cellSize;
uniform float lineWidth;
uniform vec4 gridColor;
uniform int pointerOnMesh;
uniform vec2 pointerCoords;

// Varying
varying vec3 vPosition;
varying vec2 vUV;

void main(void) {

    // grid lines
    vec4 color = texture2D(textureSampler, vUV);
    float modx = mod(vPosition.x + lineWidth/2.f, cellSize);
    float mody = mod(vPosition.y + lineWidth/2.f, cellSize);
    if ( modx < lineWidth || mody < lineWidth ) {

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
    else if (pointerOnMesh == 1) {
        // fill in cell

        float offset = floor(groundSize/cellSize) / 2.f;
        vec2 realPointerCoords = vec2( pointerCoords.x - offset, pointerCoords.y - offset );

        if ( realPointerCoords.x == floor(vPosition.x) && realPointerCoords.y == floor(vPosition.y) ) {

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
    }

    gl_FragColor = color;
}