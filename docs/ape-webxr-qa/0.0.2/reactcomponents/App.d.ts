import { Component } from 'react';
import './App.css';
interface IAppState {
    engineInitialized: boolean;
    qrReaderOpen: boolean;
}
export declare class App extends Component<{}, IAppState> {
    /**
     * Version number of the APE WebXR QA app.
     */
    static readonly version: string;
    private appDivRef;
    private threeCanvasParentRef;
    private sceneBackgroundColor;
    constructor(props: any);
    componentDidMount(): void;
    private createTestScene;
    private createTestCube;
    private onEngineUpdate;
    private onQRScanClick;
    render(): JSX.Element;
}
export {};
