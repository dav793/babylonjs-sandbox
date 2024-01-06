precision highp float;

// Varying
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUV;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;

void main(void) {
    // vec3 color = vec3(1., 1., 1.);
    vec3 color = texture2D(textureSampler, vUV).rgb;
    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

    // Fresnel
    float fresnelTerm = dot(viewDirectionW, vNormalW);
    fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);

    gl_FragColor = vec4(color * fresnelTerm, 1.);
}