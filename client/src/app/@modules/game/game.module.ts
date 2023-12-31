import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EngineModule } from '../engine/engine.module';

import { GameViewComponent } from './game-view/game-view.component';
import { MetricsComponent } from './metrics/metrics.component';
import { ControlsComponent } from './controls/controls.component';

@NgModule({
  declarations: [
    GameViewComponent,
    MetricsComponent,
    ControlsComponent
  ],
  exports: [
    GameViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EngineModule
  ]
})
export class GameModule { }
