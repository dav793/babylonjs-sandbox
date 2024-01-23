import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GridSingleSceneComponent } from './@modules/scenes/grid-single-scene/grid-single-scene.component';
import { GridNaiveSceneComponent } from './@modules/scenes/grid-naive-scene/grid-naive-scene.component';
import { CharacterSceneComponent } from './@modules/scenes/character-scene/character-scene.component';

const routes: Routes = [
  { path: 'character', component: CharacterSceneComponent },
  { path: 'grid', component: GridSingleSceneComponent },
  { path: 'grid-naive', component: GridNaiveSceneComponent },
  { path: '', redirectTo: '/character', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
