
export interface ControlsOutput {
    action: 'toggleRotation'|'toggleTranslation'|'toggleFadeOut';
    value?: any; 
}

export interface ControlsInput {
    action: 'disableTarget';
    value?: any;
}
