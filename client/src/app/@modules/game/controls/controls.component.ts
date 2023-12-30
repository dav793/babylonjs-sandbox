import { Component, Output, EventEmitter } from '@angular/core';

import { ControlsOutput } from './controls.interface';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent {

  @Output('output') output = new EventEmitter<ControlsOutput>(); 

  clickTest(): void {
    this.output.emit({ action: 'test' });
  }

}

