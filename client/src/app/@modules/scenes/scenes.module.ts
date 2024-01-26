import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameModule } from '../game/game.module';
import { GridSingleSceneComponent } from './grid-single-scene/grid-single-scene.component';
import { GridNaiveSceneComponent } from './grid-naive-scene/grid-naive-scene.component';
import { CharacterSceneComponent } from './character-scene/character-scene.component';
import { ThinGridSceneComponent } from './thin-grid-scene/thin-grid-scene.component';
import { GridBordersSceneComponent } from './grid-borders-scene/grid-borders-scene.component';

@NgModule({
  declarations: [
    GridSingleSceneComponent,
    GridNaiveSceneComponent,
    CharacterSceneComponent,
    ThinGridSceneComponent,
    GridBordersSceneComponent
  ],
  exports: [
    GridSingleSceneComponent,
    GridNaiveSceneComponent,
    CharacterSceneComponent,
    ThinGridSceneComponent,
    GridBordersSceneComponent
  ],
  imports: [
    CommonModule,
    GameModule
  ]
})
export class ScenesModule { }
