import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import './ThreeContainer.css';

interface IThreeContainerProps {
    webglCanvas: HTMLCanvasElement;
}

export class ThreeContainer extends Component<IThreeContainerProps> {

    private _parentRef: React.RefObject<HTMLDivElement>;

    constructor(props: IThreeContainerProps) {
        super(props); 

        this._parentRef = React.createRef();
    }

    componentDidMount(): void {
        if (this.props.webglCanvas) {
            this._parentRef.current.appendChild(this.props.webglCanvas);
        }
    }

    render() {
        return (
            <div className="three-canvas-parent" ref={this._parentRef}>
            </div>
        );
    }
}