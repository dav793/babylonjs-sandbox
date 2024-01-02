
export interface ControlsOutput {
    action: 'selectAnimation';
    value?: any; 
}

export interface ControlsInput {
    action: 'animationNames'|'nowPlaying';
    value?: any;
}

export interface ControlsLabels {
    animation: string,
    inProgress: boolean
}