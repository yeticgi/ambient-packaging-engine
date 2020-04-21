import { Component } from "react";
import "./ARButton.css";
declare type ARButtonMode = 'start ar' | 'not supported' | 'not available' | 'need https';
export interface IARButtonState {
    mode: ARButtonMode;
}
/**
 * This is a port of ARButton.js from Three JS to a React component.
 */
export declare class ARButton extends Component<{}, IARButtonState> {
    private _currentSession;
    constructor(props: any);
    componentDidMount(): void;
    private _onSessionStarted;
    private _onSessionEnded;
    onClick(): void;
    render(): JSX.Element;
}
export {};
