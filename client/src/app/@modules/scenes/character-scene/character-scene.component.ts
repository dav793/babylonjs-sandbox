import { Component, NgZone, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, takeUntil, filter } from 'rxjs';

import { HemisphericLight, ArcRotateCamera, Vector3 } from '@babylonjs/core';

import { EngineService } from '../../engine/engine.service';
import { ControlsInput, ControlsOutput } from '../../game/controls/controls.interface';
import { CharacterModelFactory } from 'src/app/@shared/character/character-model.factory';
import { 
  CharacterModelOperation, 
  CharacterModelCollection, 
  CharacterBodySlotModels, 
  CharacterBodySlotModelType, 
  CharacterBodySlotModelTypeDefinition 
} from 'src/app/@shared/character/character-model.model';

@Component({
  selector: 'app-character-scene',
  templateUrl: './character-scene.component.html',
  styleUrls: ['./character-scene.component.scss'],
  providers: [ EngineService ]
})
export class CharacterSceneComponent {

  @ViewChild('canvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  controlsInput$ = new Subject<ControlsInput>;

  characterBodySlotModelTypeNames$ = new BehaviorSubject<string[]>([]);
  characterModelStatus$ = new Subject<{ modelName: string, operation: CharacterModelOperation }>();
  animationNames$ = new BehaviorSubject<string[]>([]);
  animationStatus$ = new BehaviorSubject<{ animation: string, inProgress: boolean }>({ animation: '', inProgress: false });

  characterModelFactory: CharacterModelFactory;
  characterModelCollection: CharacterModelCollection;
  characterModelIdentifier = 'MyCharacter';

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

    this.setupEventListeners();

    // setup + start engine
    this.engineService.setupEngine( this.canvas );
    this.setupScene();
    this.startRenderLoop();
    // this.engineService.showInspector();

  }

  setupEventListeners(): void {
    this.characterBodySlotModelTypeNames$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( modelTypeNames => this.controlsInput$.next({ action: 'bodySlotModelTypeNames', value: modelTypeNames }) );

    this.animationNames$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( animationNames => this.controlsInput$.next({ action: 'animationNames', value: animationNames }) );

    this.characterModelStatus$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( modelChanges => {
      let isEquipped = false;
      if (modelChanges.operation === CharacterModelOperation.Added || modelChanges.operation === CharacterModelOperation.Updated)
        isEquipped = true;

      this.controlsInput$.next({ action: 'modelChanges', value: { name: modelChanges.modelName, isEquipped } });
    });

    this.animationStatus$.pipe(
      takeUntil(this._destroy$)
    ).subscribe( value => this.controlsInput$.next({ action: 'nowPlaying', value }) );
  }

  onControlsOutput(event: ControlsOutput): void {
    switch(event.action) {

      case 'selectAnimation':
        this.startAnimation(event.value);
        break;

      case 'toggleEquippable':
        this.toggleEquippable(event.value.name);
        break;

    }
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

  async setupScene() {

    this.characterModelFactory = new CharacterModelFactory(this.engineService.scene);

    // set light
    const light = new HemisphericLight("myLight", new Vector3(1, 2, -1), this.engineService.scene);
    light.intensity = 0.85;

    // set camera
    const camera = new ArcRotateCamera("myCamera", -Math.PI / 2, Math.PI / 2 - 0.4, 16, new Vector3(0, 1, 0), this.engineService.scene);
    camera.radius = 3;
    camera.wheelPrecision = 100;
    camera.attachControl(this.engineService.canvas.nativeElement, true);
    this.engineService.setCamera(camera);

    // create character model
    const equipped = [
      'Male_Skin',
      'Male_Shirt',
      'Male_LeatherJacket_Open',
      // 'Male_Shorts',
      // 'Male_Leggings',
      'Male_Jeans',
      'Male_Sneakers',
      'Male_SportHat'
    ];
    this.characterModelCollection = await this.characterModelFactory.createCharacterModel( this.characterModelIdentifier, equipped );

    // emit events
    this.animationNames$.next( this.characterModelCollection.animationNames );
    this.characterBodySlotModelTypeNames$.next(
      CharacterBodySlotModelType.getNames()
    );

    // setup listeners
    this.characterModelCollection.modelChanges$.pipe(
      takeUntil(this.characterModelCollection.onDestroy$),
    ).subscribe(
      modelChanges => this.characterModelStatus$.next(modelChanges)
    );

    this.characterModelCollection.animationChanges$.pipe(
      takeUntil(this.characterModelCollection.onDestroy$)
    ).subscribe(
      animationChanges => this.animationStatus$.next(animationChanges)
    );

  }

  startAnimation(value: { 
    name: string, 
    loop: boolean, 
    blend: boolean 
  }) {
    this.characterModelCollection.startAnimation(this.engineService.scene, value.name, value.loop, value.blend);
  }

  async toggleEquippable(modelName: string) {
  
    const modelTypeDef: CharacterBodySlotModelTypeDefinition = CharacterBodySlotModelType.findByName(modelName);
    const bodySlotModels: CharacterBodySlotModels = this.characterModelCollection.bodyParts[modelTypeDef.bodySlot];
    
    if (bodySlotModels.models && bodySlotModels.modelName !== modelName) {
      // slot has a different model; destroy old model and create new one
      const prevModelTypeDef: CharacterBodySlotModelTypeDefinition = CharacterBodySlotModelType.findByName(bodySlotModels.modelName);
      this.characterModelFactory.destroyCollectionModel(prevModelTypeDef, this.characterModelCollection);
      await this.characterModelFactory.createCollectionModel(modelTypeDef, this.characterModelCollection);
    }
    else if (bodySlotModels.models && bodySlotModels.modelName === modelName) 
      this.characterModelFactory.destroyCollectionModel(modelTypeDef, this.characterModelCollection); // slot has same model; destroy model
    else  
      await this.characterModelFactory.createCollectionModel(modelTypeDef, this.characterModelCollection);  // slot is empty; create model
    
    this.characterModelFactory.updateTextures(this.characterModelCollection);
  }

}
