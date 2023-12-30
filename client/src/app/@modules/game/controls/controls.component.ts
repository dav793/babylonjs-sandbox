import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('toggleRotationButton', { static: true }) private toggleRotationButton: ElementRef<HTMLButtonElement>;
  @ViewChild('toggleTranslationButton', { static: true }) private toggleTranslationButton: ElementRef<HTMLButtonElement>;
  @ViewChild('fadeOutButton', { static: true }) private fadeOutButton: ElementRef<HTMLButtonElement>;

  private _inputsChanged$ = new Subject<void>();
  private _destroy$ = new Subject<void>();

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

  clickToggleRotation(): void {
    this.output.emit({ action: 'toggleRotation' });
  }

  clickToggleTranslation(): void {
    this.output.emit({ action: 'toggleTranslation' });
  }

  clickFadeOut(): void {
    this.output.emit({ action: 'toggleFadeOut' });
  }

  handleInput(input: ControlsInput): void {

    switch(input.action) {
      case 'disableTarget':
        this.setButtonState(input.value);
        break;
    }

  }

  setButtonState(isEnabled: boolean): void {
    this.toggleRotationButton.nativeElement.disabled = isEnabled;
    this.toggleTranslationButton.nativeElement.disabled = isEnabled;
    this.fadeOutButton.nativeElement.disabled = isEnabled;
  }

}

