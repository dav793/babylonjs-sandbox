import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridBordersSceneComponent } from './grid-borders-scene.component';

describe('GridBordersSceneComponent', () => {
  let component: GridBordersSceneComponent;
  let fixture: ComponentFixture<GridBordersSceneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GridBordersSceneComponent]
    });
    fixture = TestBed.createComponent(GridBordersSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
