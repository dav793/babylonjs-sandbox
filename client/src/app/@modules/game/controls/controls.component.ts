import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, merge, takeUntil } from 'rxjs';

import { ControlsInput, ControlsOutput, ControlsLabels } from './controls.interface';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnDestroy, OnChanges {

  @Input('input') input$: Observable<ControlsInput>;
  @Output('output') output = new EventEmitter<ControlsOutput>();

  model: {
    labels: ControlsLabels,
    loop: boolean,
    animations: { name: string, selected: boolean }[]
  } = {
    labels: null,
    loop: true,
    animations: []
  };

  private _inputsChanged$ = new Subject<void>();
  private _destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['input$']) {
      this._inputsChanged$.next();

      this.input$.pipe(
        takeUntil( 
          merge(this._destroy$, this._inputsChanged$)
        )
      ).subscribe(value => this.handleInput(value));

    }
  }

  handleInput(input: ControlsInput): void {

    switch(input.action) {
      case 'animationNames':
        this.createOptions(input.value);
        break;
      case 'nowPlaying':
        this.updateNowPlaying(input.value);
    }

  }

  createOptions(values: string[]) {
    
    this.model.animations = values.map(elem => ({ 
      name: elem, 
      selected: false 
    }));
  
  }

  updateNowPlaying(value: ControlsLabels) {
    setTimeout(() => {    // wrap in timeout to avoid 'ExpressionChangedAfterItWasChecked' error
      this.model.labels = value;
      this.cdr.detectChanges();
    });
  }

  selectAnimation(name: string) {
    const animation = this.model.animations.find(elem => elem.name === name);
    const value = {
      name: animation.name,
      loop: this.model.loop
    };

    this.output.emit({ action: 'selectAnimation', value });
  }

}
