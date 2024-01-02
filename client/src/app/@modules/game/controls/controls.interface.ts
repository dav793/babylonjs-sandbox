
export interface ControlsOutput {
    action: 'selectAnimation';
    value?: any; 
}

export interface ControlsInput {
    action: 'bodySlotModelTypeNames'|'animationNames'|'nowPlaying';
    value?: any;
}
