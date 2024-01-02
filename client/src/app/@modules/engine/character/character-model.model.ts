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
