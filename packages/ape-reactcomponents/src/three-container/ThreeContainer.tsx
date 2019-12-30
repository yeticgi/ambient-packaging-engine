import React, { Component } from "react";
import { render } from "react-dom";

import './ThreeContainer.css';

interface IThreeContainerProps {
    canvasParentRef: React.RefObject<HTMLDivElement>
}

export class ThreeContainer extends Component<IThreeContainerProps> {

    constructor(props: IThreeContainerProps) {
        super(props); 
    }

    render() {
        return (
            <div className="threeCanvasParent" ref={this.props.canvasParentRef} />
        );
    }
}