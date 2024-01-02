import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EngineService } from './engine.service';

import { CharacterModule } from './character/character.module';

@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,
    CharacterModule
  ],
  providers: [
    EngineService
  ]
})
export class EngineModule { }
