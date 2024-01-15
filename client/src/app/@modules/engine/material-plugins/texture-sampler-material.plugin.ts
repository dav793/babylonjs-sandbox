import { 
    Material, 
    MaterialPluginBase, 
    Mesh, 
    PBRBaseMaterial, 
    Scene
} from '@babylonjs/core';

export class TextureSamplerPluginMaterial extends MaterialPluginBase {

    // we can add an enabled flag to be able to toggle the plugin on and off.
    get isEnabled() {
        return this._isEnabled;
    }

    set isEnabled(enabled: boolean) {
        if (this._isEnabled === enabled) {
            return;
        }
        this._isEnabled = enabled;
        // when it's changed, we need to mark the material as dirty so the shader is rebuilt.
        this.markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    _isEnabled = false;
    _varColorName: string;

    constructor(material: Material) {
        // the fourth parameter is a list of #defines in the GLSL code
        super(material, "TextureSampler", 200, { TEXTURE_SAMPLER: false });

        this._varColorName = material instanceof PBRBaseMaterial ? "finalColor" : "color";
    }

    // we use the define to enable or disable the plugin.
    override prepareDefines(defines: any, scene: Scene, mesh: Mesh) {
        defines.TEXTURE_SAMPLER = this._isEnabled;
    }

    override getSamplers(samplers: any) {
        samplers.push("texture");
    }

    override getClassName() {
        return "TextureSamplePluginMaterial";
    }

    override getCustomCode(shaderType: string) {
        return shaderType === "vertex"
            ? null
            : {
                CUSTOM_FRAGMENT_DEFINITIONS: `
                    #ifdef TEXTURE_SAMPLER
                        uniform sampler2D myTexture;
                    #endif
                `,

                CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR: `
                    #ifdef TEXTURE_SAMPLER
                        color.rgb = texture(myTexture, vDiffuseUV + uvOffset).rgb;
                    #endif
                `
            };
    }

}