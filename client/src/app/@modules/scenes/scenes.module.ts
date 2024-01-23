import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameModule } from '../game/game.module';
import { GridSingleSceneComponent } from './grid-single-scene/grid-single-scene.component';
import { GridNaiveSceneComponent } from './grid-naive-scene/grid-naive-scene.component';
import { CharacterSceneComponent } from './character-scene/character-scene.component';

@NgModule({
  declarations: [
    GridSingleSceneComponent,
    GridNaiveSceneComponent,
    CharacterSceneComponent
  ],
  exports: [
    GridSingleSceneComponent,
    GridNaiveSceneComponent,
    CharacterSceneComponent
  ],
  imports: [
    CommonModule,
    GameModule
  ]
})
export class ScenesModule { }
