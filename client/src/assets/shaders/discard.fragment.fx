precision highp float;

varying vec2 vUV;

// Refs
uniform sampler2D textureSampler;

void main(void) {
    vec3 color = texture2D(textureSampler, vUV).rgb;

    // Discard colors where the green component is over a threshold
    if (color.g > 0.3) {
        discard;
    }

    gl_FragColor = vec4(color, 1.);
}