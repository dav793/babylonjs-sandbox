import { 
    Color3,
    Color4, 
    Engine, 
    Material, 
    MaterialPluginBase, 
    Mesh,
    Scene
} from '@babylonjs/core';
import { IColor4Like } from '@babylonjs/core/Maths/math.like';

export class GridPluginMaterial extends MaterialPluginBase {

    _isEnabled = false;
    _cellSize: number;
    _gradientSharpness: number;
    _gridColor: Color4;

    constructor(material: Material) {
        // the fourth parameter is a list of #defines in the GLSL code
        super(material, 'Grid', 200, { GRID: false });
    }

    get isEnabled() { return this._isEnabled }
    set isEnabled(enabled: boolean) {
        if (this._isEnabled === enabled) {
            return;
        }
        this._isEnabled = enabled;

        // when it's changed, we need to mark the material as dirty so the shader is rebuilt.
        this.markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    set cellSize(value: number) { this._cellSize = value }
    get cellSize() { return this._cellSize }

    set gradientSharpness(value: number) { this._gradientSharpness = value }
    get gradientSharpness() { return this._gradientSharpness }

    set gridColor(value: Color4) { this._gridColor = value }
    get gridColor() { return this._gridColor }

    override getClassName() { return 'GridPluginMaterial' }

    // we use the define to enable or disable the plugin.
    override prepareDefines(defines: any, scene: Scene, mesh: Mesh) {
        defines.GRID = this._isEnabled;
    }

    override bindForSubMesh(uniformBuffer: any, scene: Scene, engine: Engine, subMesh: any) {
        if (this._isEnabled) {
            uniformBuffer.updateFloat('cellSize', this._cellSize);
            uniformBuffer.updateFloat('gradientSharpness', this._gradientSharpness);
            uniformBuffer.updateFloat4('gridColor', this._gridColor.r, this._gridColor.g, this._gridColor.b, this._gridColor.a);
        }
    }

    override getUniforms() {
        return {
            ubo: [
                { name: 'cellSize', size: 1, type: 'float' },
                { name: 'gradientSharpness', size: 1, type: 'float' },
                { name: 'gridColor', size: 4, type: 'vec4' },
            ]
        };
    }

    override getSamplers(samplers: any) {
        samplers.push('texture');
    }

    override getCustomCode(shaderType: string) {
        return shaderType === 'vertex'
            ? {
                CUSTOM_VERTEX_DEFINITIONS: ` 
                    #ifdef GRID
                        varying vec3 vPosition;
                    #endif
                `,

                CUSTOM_VERTEX_MAIN_BEGIN: `
                    #ifdef GRID
                        vPosition = position;
                    #endif
                `,
            }
            : {
                CUSTOM_FRAGMENT_DEFINITIONS: `
                    #ifdef GRID
                        uniform sampler2D textureSampler;

                        varying vec3 vPosition;

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
                    #endif
                `,

                CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR: `
                    #ifdef GRID
                        vec2 vUV = vDiffuseUV + uvOffset;
                        vec4 procColor = texture( textureSampler, vUV );

                        float modx = mod( vPosition.x, cellSize );
                        float diffx = min( modx, abs(modx-cellSize) );
                        float mody = mod( vPosition.y, cellSize );
                        float diffy = min( mody, abs(mody-cellSize) );

                        float gridAlphaX = gridColor.a * clamp( (1.f - diffx*gradientSharpness), 0.f, 1.f );
                        if (gridAlphaX > 0.f)
                            procColor = getAlphaBlendedColor( procColor, vec4( gridColor.rgb, gridAlphaX ) );

                        float gridAlphaY = gridColor.a * clamp( (1.f - diffy*gradientSharpness), 0.f, 1.f );
                        if (gridAlphaY > 0.f)
                            procColor = getAlphaBlendedColor( procColor, vec4( gridColor.rgb, gridAlphaY ) );

                        // color.rgb = procColor;
                        // color = vec4( fract(vPosition.x), 0.f, 0.f, 1.f );
                        // color = vec4( vUV.x, 0.f, 0.f, 1.f );
                        
                        color = procColor;
                    #endif
                `
            };
    }

}
