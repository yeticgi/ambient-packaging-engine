import { Component } from "react";
import './ThreeContainer.css';
interface IThreeContainerProps {
    webglCanvas: HTMLCanvasElement;
}
export declare class ThreeContainer extends Component<IThreeContainerProps> {
    private _parentRef;
    constructor(props: IThreeContainerProps);
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
