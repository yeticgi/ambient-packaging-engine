import React, { Component } from "react";
import ReactDOM from 'react-dom';
import "./App.css";
import { ThreeContainer } from '@yeticgi/ape-reactcomponents';
import { APEngine } from '@yeticgi/ape';

export class App extends Component {

    public apengine: APEngine | null = null;

    private appDivRef: React.RefObject<HTMLDivElement>;
    private threeCanvasParentRef: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);

        this.appDivRef = React.createRef<HTMLDivElement>();
        this.threeCanvasParentRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        this.apengine = new APEngine(
            this.appDivRef.current!,
            this.threeCanvasParentRef.current!
        );
    }

    render() {
        return (
            <div className="app" ref={this.appDivRef} >
                <ThreeContainer canvasParentRef={this.threeCanvasParentRef}/>
            </div>
        );
    }
}