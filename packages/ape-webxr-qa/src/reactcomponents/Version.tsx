import React, { Component, version } from "react";
import "./Version.css";
import { 
    APEngineBuildInfo
} from '@yeti-cgi/ape';
import { BuildInfo } from "../BuildInfo";

export class Version extends Component {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="version">
                APE WebXR QA v{BuildInfo.version}<br/>
                APEngine v{APEngineBuildInfo.version}
            </div>
        );
    }
}