import React, { Component } from "react";
import { 
    APEngine, APEResources,
} from '@yeti-cgi/ape';

export interface IPauseButtonState { 
    paused: boolean;
}

export class PauseButton extends Component<{}, IPauseButtonState> {

    private _interval: number;

    constructor(props: any) {
        super(props);

        this.onClick = this.onClick.bind(this);

        this.state = {
            paused: APEngine.time.timeScale === 0
        }
        this._interval = window.setInterval(() => this.tick(), 100);
    }

    componentWillUnmount() {
        window.clearInterval(this._interval);
    }

    render() {
        const buttonText = this.state.paused ? "Resume" : "Pause";
        return (
            <button className="appButton" onClick={this.onClick}>{buttonText}</button>
        );
    }

    tick() {
        const paused = APEngine.time.timeScale === 0;
        if (this.state.paused != paused) {
            this.setState({
                paused
            });
        }
    }

    onClick() {
        if (APEngine.time.timeScale === 0) {
            APEngine.time.timeScale = 1;
        } else {
            APEngine.time.timeScale = 0;
        }

        APEResources.audio.get('button').then(
            resource => resource.object.play()
        );
    }
}