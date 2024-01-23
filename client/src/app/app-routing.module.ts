import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GridSingleSceneComponent } from './@modules/scenes/grid-single-scene/grid-single-scene.component';
import { GridNaiveSceneComponent } from './@modules/scenes/grid-naive-scene/grid-naive-scene.component';

const routes: Routes = [
  { path: 'grid', component: GridSingleSceneComponent },
  { path: 'grid-naive', component: GridNaiveSceneComponent },
  { path: '', redirectTo: '/grid', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
