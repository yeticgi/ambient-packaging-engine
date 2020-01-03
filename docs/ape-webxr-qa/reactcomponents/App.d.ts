import { Component } from "react";
import "./App.css";
interface IAppState {
    engineInitialized: boolean;
}
export declare class App extends Component<{}, IAppState> {
    private appDivRef;
    private threeCanvasParentRef;
    private cube;
    constructor(props: any);
    componentDidMount(): void;
    private createTestScene;
    private createTestCube;
    private onEngineUpdate;
    render(): JSX.Element;
}
export {};
