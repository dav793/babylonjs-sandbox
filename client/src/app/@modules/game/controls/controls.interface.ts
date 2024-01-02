
export interface ControlsOutput {
    action: 'selectEquippable'|'selectAnimation';
    value?: any; 
}

export interface ControlsInput {
    action: 'bodySlotModelTypeNames'|'equipped'|'animationNames'|'nowPlaying';
    value?: any;
}
