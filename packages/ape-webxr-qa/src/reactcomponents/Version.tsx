import React, { Component, version } from "react";
import "./Version.css";
import { 
    APEngine,
} from '@yeticgi/ape';
import { App } from './App';
import { AudioManifest } from "../audio/AudioManifest";

export class Version extends Component {

    private _interval: number;

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="version">
                APEngine v{APEngine.version}
            </div>
        );
    }
}