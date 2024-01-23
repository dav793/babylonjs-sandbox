import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MetricsComponent } from './metrics/metrics.component';

@NgModule({
  declarations: [
    MetricsComponent
  ],
  exports: [
    MetricsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class GameModule { }
