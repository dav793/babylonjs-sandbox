import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditorSocketApiService } from './editor-socket-api.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    EditorSocketApiService
  ]
})
export class EditorApiModule { }
