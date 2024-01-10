import { 
    Color3, 
    Engine, 
    Material, 
    MaterialPluginBase, 
    Mesh, 
    PBRBaseMaterial, 
    Scene
} from '@babylonjs/core';

export class ColorifyPluginMaterial extends MaterialPluginBase {

    // any local variable definitions of the plugin instance.
    color = new Color3(1.0, 0.0, 0.0);

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
        super(material, "Colorify", 200, { COLORIFY: false });

        this._varColorName = material instanceof PBRBaseMaterial ? "finalColor" : "color";
    }

    // we use the define to enable or disable the plugin.
    override prepareDefines(defines: any, scene: Scene, mesh: Mesh) {
        defines.COLORIFY = this._isEnabled;
    }

    // here we can define any uniforms to be passed to the shader code.
    override getUniforms() {
        return {
            // first, define the UBO with the correct type and size.
            ubo: [{ name: "myColor", size: 3, type: "vec3" }],
            // now, on the fragment shader, add the uniform itself in case uniform buffers are not supported by the engine
            fragment: `
                #ifdef COLORIFY
                    uniform vec3 myColor;
                #endif
            `,
        };
    }

    // whenever a material is bound to a mesh, we need to update the uniforms.
    // so bind our uniform variable to the actual color we have in the instance.
    override bindForSubMesh(uniformBuffer: any, scene: Scene, engine: Engine, subMesh: any) {
        if (this._isEnabled) {
            uniformBuffer.updateColor3("myColor", this.color);
        }
    }

    override getClassName() {
        return "ColorifyPluginMaterial";
    }

    override getCustomCode(shaderType: string) {
        return shaderType === "vertex"
            ? null
            : {
                // this is just like before. Multiply the final shader color by
                // our color. Note that we have access to all shader variables:
                // we're effectively inserting a piece of code in the shader code.
                CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR: `
                    #ifdef COLORIFY
                        ${this._varColorName}.rgb *= myColor;
                    #endif
                `,

                // we can even use regexes to replace arbitrary parts of the code.
                // if your key starts with '!' it's parsed as a Regex.
                "!diffuseBase\\+=info\\.diffuse\\*shadow;": `
                    diffuseBase += info.diffuse*shadow;
                    diffuseBase += vec3(0., 0.2, 0.8);
                `,
            };
    }

}
