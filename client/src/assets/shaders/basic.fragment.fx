precision highp float;

varying vec2 vUV;

uniform sampler2D textureSampler;

void main(void) {
    gl_FragColor = texture2D(textureSampler, vUV);
    // gl_FragColor = vec4(1.0f, 0.0f, 0.0f, 1.0f);
}