import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { EngineModule } from './@modules/engine/engine.module';
import { GameModule } from './@modules/game/game.module';
import { ScenesModule } from './@modules/scenes/scenes.module';
import { EditorApiModule } from './@modules/editor-api/editor-api.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EngineModule,
    GameModule,
    ScenesModule,
    EditorApiModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
