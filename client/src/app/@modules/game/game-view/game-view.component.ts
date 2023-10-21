import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { EngineService } from '../../engine/engine.service';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.scss']
})
export class GameViewComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private engineService: EngineService,
    private ngZone: NgZone
  ) { }

  ngOnDestroy(): void {
    
  }

  ngAfterViewInit(): void {
    this.setup();
  }

  setup() {
    this.engineService.setupEngine( this.canvas );
    this.startRenderLoop();
  }

  startRenderLoop(): void {
    this.ngZone.runOutsideAngular(() => {

      if (document.readyState !== 'loading') {
        this.engineService.startRenderLoop();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.engineService.startRenderLoop();
        });
      }

      window.addEventListener('resize', () => {
        // this.engineService.resize(window.innerWidth, window.innerHeight);
      });
      
    });
  }

}
