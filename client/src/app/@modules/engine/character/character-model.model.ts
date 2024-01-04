import { BehaviorSubject, ReplaySubject, Subject, interval, takeWhile, map } from 'rxjs';

import { Scene, ISceneLoaderAsyncResult, AnimationGroup, AsyncCoroutine } from '@babylonjs/core';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

export class CharacterModelCollection {

    bodyParts: {
        skin: CharacterBodySlotModels,
        head_hat: CharacterBodySlotModels,
        torso_under: CharacterBodySlotModels,
        torso_over: CharacterBodySlotModels,
        legs: CharacterBodySlotModels,
        feet: CharacterBodySlotModels
    };

    modelChanges$ = new ReplaySubject<{ modelName: string, operation: CharacterModelOperation }>(50);
    animationChanges$ = new BehaviorSubject<{ animation: string, looping: boolean, inProgress: boolean }>(null);
    onDestroy$ = new Subject<void>();

    constructor(
        private _id: string
    ) {
        this.bodyParts = {
            skin:           CharacterModelCollection.CreateEmptyCharacterBodySlotModels(),
            head_hat:       CharacterModelCollection.CreateEmptyCharacterBodySlotModels(),
            torso_under:    CharacterModelCollection.CreateEmptyCharacterBodySlotModels(),
            torso_over:     CharacterModelCollection.CreateEmptyCharacterBodySlotModels(),
            legs:           CharacterModelCollection.CreateEmptyCharacterBodySlotModels(),
            feet:           CharacterModelCollection.CreateEmptyCharacterBodySlotModels(),
        };
    }

    static CreateEmptyCharacterBodySlotModels(): CharacterBodySlotModels {
        return { modelName: null, models: null, material: null };
    }

    get identifier(): string {
        return this._id;
    }

    get modelNames(): string[] {
        return Object.keys(this.bodyParts)
            .map(bodyPart => (this.bodyParts as any)[ bodyPart ].modelName)
            .filter(modelName => modelName);
    }

    get animationNames(): string[] {
        return this.bodyParts[ CharacterBodySlot.Skin ].models.animationGroups
            .map(anim => anim.name);
    }

    get activeAnimation(): string|null {
        if (!this.animationChanges$.value || !this.animationChanges$.value.inProgress)
            return null;
        return this.animationChanges$.value.animation;
    }

    destroy() {
        this.onDestroy$.next();
    }

    startAnimation(scene: Scene, targetAnimation: string, loop?: boolean, blend?: boolean): void {

        // get previous animation if exists and emit stop status message
        let previousAnimation = this.activeAnimation;
        if (previousAnimation) {
            const previousAnimationGroup = this.bodyParts[ CharacterBodySlot.Skin ].models.animationGroups.find(anim => anim.name === previousAnimation);
            this.animationChanges$.next({ animation: previousAnimationGroup.name, looping: null, inProgress: false });
        }
        
        // start animations for each body slot
        for (let bodyPart of Object.keys(this.bodyParts)) {
            const models: CharacterBodySlotModels = (this.bodyParts as any)[bodyPart];
            
            if (models.models)
                this.startAnimationByBodySlot(scene, targetAnimation, previousAnimation, bodyPart as CharacterBodySlot, loop, blend);
        }

        // emit status messages
        const animationGroup = this.bodyParts[ CharacterBodySlot.Skin ].models.animationGroups.find(anim => anim.name === targetAnimation);
        this.animationChanges$.next({ animation: animationGroup.name, looping: loop, inProgress: true });
        animationGroup.onAnimationGroupEndObservable.addOnce(() => {
            this.animationChanges$.next({ animation: animationGroup.name, looping: loop, inProgress: false });
        });
    }

    private startAnimationByBodySlot(scene: Scene, targetAnimation: string, previousAnimation: string, bodySlot: CharacterBodySlot, loop?: boolean, blend?: boolean): void {
        let animationGroup: AnimationGroup;
        let previousAnimationGroup: AnimationGroup;

        if (targetAnimation === previousAnimation)
            return;

        this.bodyParts[ bodySlot ].models.animationGroups.forEach(anim => {
            if (anim.name !== previousAnimation)
                anim.stop();
            else if (anim.name === previousAnimation)
                previousAnimationGroup = anim;

            if (anim.name === targetAnimation) {
                animationGroup = anim;
            }
        });
        if (!animationGroup)
            throw new Error(`Animation '${targetAnimation}' not found.`);

        if (!previousAnimationGroup) {
            animationGroup.play(loop);
            return;
        }

        if (!blend) {
            previousAnimationGroup.stop();
            animationGroup.play(loop);
        }
        else {
            // blend smoothly between previous and next animations
            // see animation blending example: https://playground.babylonjs.com/#WZ4485#2
            scene.onBeforeRenderObservable.runCoroutineAsync(
                this.blendAnimations(previousAnimationGroup, animationGroup, loop)
            );
        }
    }

    private *blendAnimations(fromAnimation: AnimationGroup, toAnimation: AnimationGroup, loop: boolean): AsyncCoroutine<void> {
        let fromWeight = 1;
        let toWeight = 0;

        toAnimation.play(loop);

        // blend from fromAnimation to toAnimation by updating weights every frame
        while(toWeight < 1) {
            toWeight += 0.02;
            fromWeight -= 0.02;

            toAnimation.setWeightForAllAnimatables(toWeight);
            fromAnimation.setWeightForAllAnimatables(fromWeight);

            yield;
        }
    }

}

export interface CharacterBodySlotModels {
    modelName: string | null,
    models: ISceneLoaderAsyncResult | null;
    material: StandardMaterial | null;
};

export enum CharacterModelOperation {
    Added = 'added',
    Removed = 'removed',
    Updated = 'updated'
};

export enum CharacterBodySlot {
    Skin = 'skin',
    Head_Hat = 'head_hat',
    Torso_Under = 'torso_under',
    Torso_Over = 'torso_over',
    Legs = 'legs',
    Feet = 'feet'
};

export interface CharacterBodySlotModelTypeDefinition {
    name: string,
    bodySlot: CharacterBodySlot,
    modelPath: string,
    modelFilename: string,
    texturePath: string,
    textureFilename: string,
    alphaMaps: { 
        [key: string]: {
            applyWith: string[],
            texturePath: string,
            textureFilename: string
        }[] 
    };
};

export class CharacterBodySlotModelType {

    static Definitions: CharacterBodySlotModelTypeDefinition[] = [
        {
            name: 'Male_Skin',
            bodySlot: CharacterBodySlot.Skin,
            modelPath: 'characters/Male',
            modelFilename: 'MaleBody.glb',
            texturePath: 'characters/Male',
            textureFilename: 'UV_MaleBody_Skin_256.jpg',
            alphaMaps: {
                torso_over: [
                    {
                        applyWith: ['Male_ButtonShirt_Open'],
                        texturePath: 'characters/Male/AlphaMaps',
                        textureFilename: 'UV_MaleBody_Skin_AlphaMap_ButtonShirt_Open.png'
                    }
                ],
                torso_under: [
                    {
                        applyWith: ['Male_Shirt'],
                        texturePath: 'characters/Male/AlphaMaps',
                        textureFilename: 'UV_MaleBody_Skin_AlphaMap_Shirt.png'
                    }
                ],
                legs: [
                    {
                        applyWith: ['Male_Pants'],
                        texturePath: 'characters/Male/AlphaMaps',
                        textureFilename: 'UV_MaleBody_Skin_AlphaMap_Pants.png'
                    },
                    {
                        applyWith: ['Male_Shorts'],
                        texturePath: 'characters/Male/AlphaMaps',
                        textureFilename: 'UV_MaleBody_Skin_AlphaMap_Shorts.png'
                    }
                ]
            }
        },
        {
            name: 'Male_Shirt',
            bodySlot: CharacterBodySlot.Torso_Under,
            modelPath: 'characters/Male',
            modelFilename: 'MaleBody_Shirt.glb',
            texturePath: 'characters/Male',
            textureFilename: 'UV_MaleBody_Shirt_256.jpg',
            alphaMaps: {
                torso_over: [
                    {
                        applyWith: ['Male_ButtonShirt_Open'],
                        texturePath: 'characters/Male/AlphaMaps',
                        textureFilename: 'UV_MaleBody_Shirt_AlphaMap_ButtonShirt_Open.png'
                    }
                ]
            }
        },
        {
            name: 'Male_ButtonShirt_Open',
            bodySlot: CharacterBodySlot.Torso_Over,
            modelPath: 'characters/Male',
            modelFilename: 'MaleBody_ButtonShirt_Open.glb',
            texturePath: 'characters/Male',
            textureFilename: 'UV_MaleBody_ButtonShirt_Flamingoes_512.jpg',
            alphaMaps: {}
        },
        {
            name: 'Male_Pants',
            bodySlot: CharacterBodySlot.Legs,
            modelPath: 'characters/Male',
            modelFilename: 'MaleBody_Pants.glb',
            texturePath: 'characters/Male',
            textureFilename: 'UV_MaleBody_Pants_256.jpg',
            alphaMaps: {}
        },
        {
            name: 'Male_Shorts',
            bodySlot: CharacterBodySlot.Legs,
            modelPath: 'characters/Male',
            modelFilename: 'MaleBody_Shorts.glb',
            texturePath: 'characters/Male',
            textureFilename: 'UV_MaleBody_Shorts_256.jpg',
            alphaMaps: {}
        },
        {
            name: 'Male_Sneakers',
            bodySlot: CharacterBodySlot.Feet,
            modelPath: 'characters/Male',
            modelFilename: 'MaleBody_Sneakers.glb',
            texturePath: 'characters/Male',
            textureFilename: 'UV_MaleBody_Sneakers_256.jpg',
            alphaMaps: {}
        },
        {
            name: 'Male_BaseballCap',
            bodySlot: CharacterBodySlot.Head_Hat,
            modelPath: 'characters/Male',
            modelFilename: 'MaleBody_BaseballCap.glb',
            texturePath: 'characters/Male',
            textureFilename: 'UV_MaleBody_BaseballCap_256.jpg',
            alphaMaps: {}
        }
    ];

    static findByName(name: string): CharacterBodySlotModelTypeDefinition | null {
        const match = this.Definitions.find(elem => elem.name === name);
        return match ? match : null;
    }

    static getNames(): string[] {
        return this.Definitions.map(elem => elem.name);
    }

}