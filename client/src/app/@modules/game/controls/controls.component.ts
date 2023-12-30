import { Component, Output, EventEmitter } from '@angular/core';

import { ControlsOutput } from './controls.interface';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent {

  @Output('output') output = new EventEmitter<ControlsOutput>(); 

  clickToggleRotation(): void {
    this.output.emit({ action: 'toggleRotation' });
  }

  clickToggleTranslation(): void {
    this.output.emit({ action: 'toggleTranslation' });
  }

}

