import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

import { EngineService } from '../../engine/engine.service';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.scss']
})
export class GameViewComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('fpsCounter', { static: true }) private fpsCounter: ElementRef<HTMLElement>;

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

    // track fps
    this.startMetricsTracker();
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

  startMetricsTracker(): void {
    this.engineService.fpsChanges$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(value => {
      this.fpsCounter.nativeElement.innerHTML = value;
    });
  }

}
