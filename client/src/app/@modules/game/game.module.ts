import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MetricsComponent } from './metrics/metrics.component';
import { ControlsComponent } from './controls/controls.component';

@NgModule({
  declarations: [
    MetricsComponent,
    ControlsComponent
  ],
  exports: [
    MetricsComponent,
    ControlsComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class GameModule { }
