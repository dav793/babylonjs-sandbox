import { BehaviorSubject, Subject } from 'rxjs';

import { ISceneLoaderAsyncResult, AnimationGroup } from '@babylonjs/core';
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

    animationChanges$ = new BehaviorSubject<{ animation: string, inProgress: boolean }>(null);
    onDestroy$ = new Subject<void>();

    constructor(
        private _id: string
    ) {

        this.bodyParts = {
            skin:           { models: null, material: null },
            head_hat:       { models: null, material: null },
            torso_under:    { models: null, material: null },
            torso_over:     { models: null, material: null },
            legs:           { models: null, material: null },
            feet:           { models: null, material: null },
        };

    }

    get identifier(): string {
        return this._id;
    }

    get animationNames(): string[] {
        return this.bodyParts[ CharacterBodySlot.Skin ].models.animationGroups
            .map(anim => anim.name);
    }

    destroy() {
        this.onDestroy$.next();
    }

    startAnimation(targetAnimation: string, loop?: boolean): void {

        this.startAnimationByBodySlot(targetAnimation, CharacterBodySlot.Skin, loop);
        this.startAnimationByBodySlot(targetAnimation, CharacterBodySlot.Legs, loop);
        this.startAnimationByBodySlot(targetAnimation, CharacterBodySlot.Torso_Under, loop);
        this.startAnimationByBodySlot(targetAnimation, CharacterBodySlot.Feet, loop);

        const animationGroup = this.bodyParts[ CharacterBodySlot.Skin ].models.animationGroups.find(anim => anim.name === targetAnimation);
        this.animationChanges$.next({ animation: animationGroup.name, inProgress: true });
        animationGroup.onAnimationGroupEndObservable.addOnce(() => {
            this.animationChanges$.next({ animation: animationGroup.name, inProgress: false });
        });

    }

    private startAnimationByBodySlot(targetAnimation: string, bodySlot: CharacterBodySlot, loop?: boolean): void {
        let animationGroup: AnimationGroup;
        this.bodyParts[ bodySlot ].models.animationGroups.forEach(anim => {
            anim.stop();

            if (anim.name === targetAnimation)
                animationGroup = anim;
        });
        if (!animationGroup)
            throw new Error(`Animation '${targetAnimation}' not found.`);

        animationGroup.play(loop);
    }

}

export interface CharacterBodySlotModels {
    models: ISceneLoaderAsyncResult | null;
    material: StandardMaterial | null;
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
            modelPath: 'characters/Male/',
            modelFilename: 'MaleBody.glb',
            texturePath: 'characters/Male/',
            textureFilename: 'UV_MaleBody_Skin_256.jpg',
            alphaMaps: {
                torso_over: [
                    {
                        applyWith: ['Male_ButtonShirt_Open'],
                        texturePath: 'characters/Male/AlphaMaps/',
                        textureFilename: 'UV_MaleBody_Skin_AlphaMap_ButtonShirt_Open.png'
                    }
                ],
                torso_under: [
                    {
                        applyWith: ['Male_Shirt'],
                        texturePath: 'characters/Male/AlphaMaps/',
                        textureFilename: 'UV_MaleBody_Skin_AlphaMap_Shirt.png'
                    }
                ],
                legs: [
                    {
                        applyWith: ['Male_Pants'],
                        texturePath: 'characters/Male/AlphaMaps/',
                        textureFilename: 'UV_MaleBody_Skin_AlphaMap_Pants.png'
                    },
                    {
                        applyWith: ['Male_Shorts'],
                        texturePath: 'characters/Male/AlphaMaps/',
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
                        texturePath: 'characters/Male/AlphaMaps/',
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