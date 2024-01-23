import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameModule } from '../game/game.module';
import { GridSingleSceneComponent } from './grid-single-scene/grid-single-scene.component';
import { GridNaiveSceneComponent } from './grid-naive-scene/grid-naive-scene.component';

@NgModule({
  declarations: [
    GridSingleSceneComponent,
    GridNaiveSceneComponent
  ],
  exports: [
    GridSingleSceneComponent,
    GridNaiveSceneComponent
  ],
  imports: [
    CommonModule,
    GameModule
  ]
})
export class ScenesModule { }
