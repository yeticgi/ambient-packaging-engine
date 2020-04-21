import { Component } from "react";
export interface IPauseButtonState {
    paused: boolean;
}
export declare class PauseButton extends Component<{}, IPauseButtonState> {
    private _interval;
    constructor(props: any);
    componentWillUnmount(): void;
    render(): JSX.Element;
    tick(): void;
    onClick(): void;
}
