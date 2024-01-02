import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

import { EngineService } from '../../engine/engine.service';
import { ControlsInput, ControlsOutput } from '../controls/controls.interface';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.scss']
})
export class GameViewComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  controlsInput$ = new Subject<ControlsInput>;

  private _destroy$ = new Subject<void>();

  constructor(
    private engineService: EngineService,
    private ngZone: NgZone
  ) { }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngAfterViewInit(): void {
    this.setup();
  }

  setup() {
    // setup + start engine
    this.engineService.setupEngine( this.canvas );
    this.startRenderLoop();
    // this.engineService.showInspector();

    // setup engine listeners
    this.engineService.animationNames$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(animationNames => {

      this.controlsInput$.next({
        action: 'animationNames',
        value: animationNames
      });

    });

    this.engineService.controlLabels$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(value => this.controlsInput$.next({ action: 'nowPlaying', value }));
  }

  startRenderLoop(): void {
    this.ngZone.runOutsideAngular(() => {

      if (document.readyState !== 'loading')
        this.engineService.startRenderLoop();
      else
        window.addEventListener('DOMContentLoaded', () => this.engineService.startRenderLoop());

      window.addEventListener('resize', () => this.engineService.resize());
      
    });
  }

  get fpsChanges$(): Observable<string> {
    return this.engineService.fpsChanges$;
  }

  onControlsOutput(event: ControlsOutput): void {

    switch(event.action) {
      case 'selectAnimation':
        this.engineService.startAnimation(event.value);
        break;
    }

  }

}
