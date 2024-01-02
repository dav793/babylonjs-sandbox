import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, merge, takeUntil } from 'rxjs';

import { ControlsInput, ControlsOutput } from './controls.interface';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnDestroy, OnChanges {

  @Input('input') input$: Observable<ControlsInput>;
  @Output('output') output = new EventEmitter<ControlsOutput>();

  model: {
    loop: boolean,
    animations: { name: string, selected: boolean }[],
    bodySlotModelTypes: { name: string, selected: boolean }[]
  } = {
    loop: true,
    animations: [],
    bodySlotModelTypes: []
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
      case 'bodySlotModelTypeNames':
        this.createBodySlotModelTypeOptions(input.value);
        break;
      case 'equipped':
        this.updateEquipped(input.value);
        break;
      case 'animationNames':
        this.createAnimationOptions(input.value);
        break;
      case 'nowPlaying':
        this.updateNowPlaying(input.value);
        break;
    }

  }

  isAnimationSelected(name: string): boolean {
    const anim = this.model.animations.find(elem => elem.name === name);
    return anim.selected;
  }

  // INPUTS

  createBodySlotModelTypeOptions(values: string[]) {
    this.model.bodySlotModelTypes = values.map(elem => ({
      name: elem,
      selected: false
    }));
  }

  createAnimationOptions(values: string[]) {
    this.model.animations = values.map(elem => ({ 
      name: elem, 
      selected: false 
    }));
  }

  updateEquipped(value: { name: string, isEquipped: boolean }) {
    console.log(value);
  }

  updateNowPlaying(value: { animation: string, inProgress: boolean }) {
    if (!value || !value.animation)
      return;

    setTimeout(() => {    // wrap in timeout to avoid 'ExpressionChangedAfterItWasChecked' error
      const anim = this.model.animations.find(elem => elem.name === value.animation);
      anim.selected = value.inProgress;
      this.cdr.detectChanges();
    });
  }

  // OUTPUTS

  selectEquippable(name: string) {
    console.log(name);
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
