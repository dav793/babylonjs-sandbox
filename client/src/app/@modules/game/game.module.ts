import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EngineModule } from '../engine/engine.module';

import { GameViewComponent } from './game-view/game-view.component';

@NgModule({
  declarations: [
    GameViewComponent
  ],
  exports: [
    GameViewComponent
  ],
  imports: [
    CommonModule,
    EngineModule
  ]
})
export class GameModule { }
