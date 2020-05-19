import { Component } from 'react';
import './App.css';
interface IAppState {
    engineInitialized: boolean;
    qrReaderOpen: boolean;
}
export declare class App extends Component<{}, IAppState> {
    private sceneBackgroundColor;
    constructor(props: any);
    componentDidMount(): Promise<void>;
    private createTestScene;
    private onEngineUpdate;
    private onQRScanClick;
    render(): JSX.Element;
}
export {};
