import React, { Component } from "react";
import ReactDOM from 'react-dom';
import "./PauseButton.css";
import { ThreeContainer } from '@yeticgi/ape-reactcomponents';
import { 
    APEngine,
    GameObject,
    MeshDecorator,
    Time
} from '@yeticgi/ape';
import {
    Scene,
    PerspectiveCamera,
    BoxGeometry,
    Mesh,
    Color,
    MeshStandardMaterial,
    DirectionalLight,
    AmbientLight,
    Vector3
} from 'three';
import { Rotator } from "../decorators/Rotator";
import { TestClick } from "../decorators/TestClick";
import { AudioManifest } from "../audio/AudioManifest";

export interface IPauseButtonState { 
    paused: boolean;
}

export class PauseButton extends Component<{}, IPauseButtonState> {

    private _interval: number;

    constructor(props: any) {
        super(props);

        this.onClick = this.onClick.bind(this);

        this.state = {
            paused: APEngine.time.paused
        }
        this._interval = window.setInterval(() => this.tick(), 100);
    }

    componentWillUnmount() {
        window.clearInterval(this._interval);
    }

    render() {
        const buttonText = this.state.paused ? "Resume" : "Pause";
        return (
            <button className="button pause" onClick={this.onClick}>{buttonText}</button>
        );
    }

    tick() {
        if (this.state.paused != APEngine.time.paused) {
            this.setState({
                paused:APEngine.time.paused
            });
        }
    }

    onClick() {
        APEngine.time.paused = !APEngine.time.paused;

        let audio = APEngine.audioManager.getAudio(AudioManifest.button.name);
        audio.play();
    }
}