import React, { Component } from "react";
import "./ARButton.css";
import { APEngine } from '@yeti-cgi/ape';

declare type ARButtonMode = 'start ar' | 'not supported' | 'not available' | 'need https';

export interface IARButtonState {
    mode: ARButtonMode;
}

/**
 * This is a port of ARButton.js from Three JS to a React component.
 */
export class ARButton extends Component<{}, IARButtonState> {

    private _currentSession: any = null;

    constructor(props: any) {
        super(props);

        this.state = { 
            mode: null
        };

        this.onClick = this.onClick.bind(this);
        this._onSessionStarted = this._onSessionStarted.bind(this);
        this._onSessionEnded = this._onSessionEnded.bind(this);
    }

    componentDidMount() {
        const nav = navigator as any;
        if ('xr' in nav) {
            nav.xr.isSessionSupported('immersive-ar')
                .then((supported: any) => {
                    this.setState({ mode: supported ? 'start ar' : 'not supported' });
                })
                .catch((error: any) => {
                    this.setState({ mode: 'not supported' });
                });
        } else {
            if (window.isSecureContext === false) {
                this.setState({ mode: 'need https' });
            } else {
                this.setState({ mode: 'not available' });
            }
        }
    }

    private _onSessionStarted(session: any) {
        session.addEventListener('end', this._onSessionEnded);

        APEngine.webglRenderer.xr.setReferenceSpaceType('local');
        APEngine.webglRenderer.xr.setSession(session);

        this._currentSession = session;
    }

    private _onSessionEnded() {
        this._currentSession.removeEventListener('end', this._onSessionEnded);
        this._currentSession = null;
    }

    onClick() {
        if (this.state.mode === 'start ar') {
            if (this._currentSession === null) {
                const nav = navigator as any;
                nav.xr.requestSession('immersive-ar',
                    { requiredFeatures: [ 'local', 'hit-test' ]
                })
                .then(this._onSessionStarted);
            } else {
                this._currentSession.end();
            }
        } else {
            window.open('https://immersiveweb.dev/');
        }
    }

    render() {
        if (this.state.mode === null) {
            return null;
        }

        let buttonText: string;
        let buttonClass: string;

        if (this.state.mode === 'start ar') {
            buttonText = 'START AR';
            buttonClass = 'arButton start';
        } else if (this.state.mode === 'not supported') {
            buttonText = 'AR NOT SUPPORTED';
            buttonClass = 'arButton disabled';
        } else if (this.state.mode === 'need https') {
            buttonText = 'WEBXR NEEDS HTTPS';
            buttonClass = 'arButton disabled';
        } else if (this.state.mode === 'not available') {
            buttonText = 'WEBXR NOT AVAILABLE';
            buttonClass = 'arButton disabled';
        } else {
            throw new Error(`[ARButton] Component does not implement ARButtonMode ${this.state.mode}`);
        }

        return (
            <button className={buttonClass} onClick={this.onClick}>{buttonText}</button>
        );
    }
}