import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GridSingleSceneComponent } from './@modules/scenes/grid-single-scene/grid-single-scene.component';
import { GridNaiveSceneComponent } from './@modules/scenes/grid-naive-scene/grid-naive-scene.component';
import { CharacterSceneComponent } from './@modules/scenes/character-scene/character-scene.component';
import { ThinGridSceneComponent } from './@modules/scenes/thin-grid-scene/thin-grid-scene.component';
import { GridBordersSceneComponent } from './@modules/scenes/grid-borders-scene/grid-borders-scene.component';

const routes: Routes = [
  { path: 'character', component: CharacterSceneComponent },
  { path: 'thin-grid', component: ThinGridSceneComponent },
  { path: 'grid-borders', component: GridBordersSceneComponent },
  { path: 'grid', component: GridSingleSceneComponent },
  { path: 'grid-naive', component: GridNaiveSceneComponent },
  { path: '', redirectTo: '/character', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
