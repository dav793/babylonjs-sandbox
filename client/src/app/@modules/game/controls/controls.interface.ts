
export interface ControlsOutput {
    action: 'toggleEquippable'|'selectAnimation';
    value?: any; 
}

export interface ControlsInput {
    action: 'bodySlotModelTypeNames'|'modelChanges'|'animationNames'|'nowPlaying';
    value?: any;
}
