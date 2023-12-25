import { Component, ViewChild, ElementRef, Input, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Subject, Observable, takeUntil, merge } from 'rxjs';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsComponent implements OnDestroy, OnChanges {

  @Input('fpsChanges') fpsChanges$: Observable<string>; 

  @ViewChild('fpsCounter', { static: true }) private fpsCounter: ElementRef<HTMLElement>;

  private _destroy$ = new Subject<void>();
  private _setInputs$ = new Subject<void>();

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.fpsChanges$.pipe(
      takeUntil(
        merge(
          this._setInputs$,
          this._destroy$
        )
      )
    ).subscribe(value => {
      this.fpsCounter.nativeElement.innerHTML = value;
    });

  }

}
