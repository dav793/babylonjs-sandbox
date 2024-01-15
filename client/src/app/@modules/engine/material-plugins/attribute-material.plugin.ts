import { 
    Engine, 
    Material, 
    MaterialPluginBase, 
    Mesh,
    Scene,
    RawTexture2DArray
} from '@babylonjs/core';

export class AttributePluginMaterial extends MaterialPluginBase {

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

    _texArray: RawTexture2DArray;
    _isEnabled = false;

    constructor(material: Material, texArray: RawTexture2DArray) {
        // the fourth parameter is a list of #defines in the GLSL code
        super(material, "Attributes", 200, { ATTRIBUTES: false });
        this._texArray = texArray;
    }

    override getClassName() {
        return "AttributesPluginMaterial";
    }

    // we use the define to enable or disable the plugin.
    override prepareDefines(defines: any, scene: Scene, mesh: Mesh) {
        defines.ATTRIBUTES = this._isEnabled;
    }

    // whenever a material is bound to a mesh, we need to update the uniforms.
    // so bind our uniform variable to the actual color we have in the instance.
    override bindForSubMesh(uniformBuffer: any, scene: Scene, engine: Engine, subMesh: any) {
        uniformBuffer.setTexture('arrayTex', this._texArray)
    }

    override getSamplers(samplers: string[]) {
        samplers.push("arrayTex");
    }

    override getAttributes(attributes: string[]) {
        attributes.push('texIndices');
    }

    override getUniforms() {
        return {
            ubo: []
        } as any;
    }

    override getCustomCode(shaderType: string) {
        return shaderType === "vertex"
            ? {
                CUSTOM_VERTEX_DEFINITIONS: ` 
                    attribute float texIndices;
                    varying float texIndex;
                `,

                CUSTOM_VERTEX_MAIN_BEGIN: `
                    texIndex = texIndices;
                `,
            }
            : {
                CUSTOM_FRAGMENT_DEFINITIONS: `
                    uniform highp sampler2DArray arrayTex;
                    varying float texIndex;
                `,

                "!baseColor\\=texture2D\\(diffuseSampler,vDiffuseUV\\+uvOffset\\);": ` 
                    baseColor = texture( arrayTex, vec3(vDiffuseUV, texIndex) );
                `,
            };
    }

}