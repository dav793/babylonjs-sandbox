import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil, filter } from 'rxjs';

import { EngineService } from '../../engine/engine.service';
import { ControlsInput, ControlsOutput } from '../controls/controls.interface';
import { CharacterModelOperation } from '../../engine/character/character-model.model';

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
    this.engineService.characterBodySlotModelTypeNames$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( modelTypeNames => this.controlsInput$.next({ action: 'bodySlotModelTypeNames', value: modelTypeNames }) );

    this.engineService.animationNames$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( animationNames => this.controlsInput$.next({ action: 'animationNames', value: animationNames }) );

    this.engineService.characterModelStatus$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( modelChanges => {
      let isEquipped = false;
      if (modelChanges.operation === CharacterModelOperation.Added || modelChanges.operation === CharacterModelOperation.Updated)
        isEquipped = true;

      this.controlsInput$.next({ action: 'modelChanges', value: { name: modelChanges.modelName, isEquipped } });
    });

    this.engineService.animationStatus$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( value => this.controlsInput$.next({ action: 'nowPlaying', value }) );
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
      case 'toggleEquippable':
        this.engineService.toggleEquippable(event.value.name);
        break;
    }

  }

}
