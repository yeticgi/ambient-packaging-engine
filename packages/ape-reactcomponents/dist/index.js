import React, { Component } from 'react';
import { APEngine } from '@yeticgi/ape';

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".threeCanvasParent {\n    width: 100%;\n    height: 100%;\n}";
styleInject(css_248z);

class ThreeContainer extends Component {
    constructor(props) {
        super(props);
        this._parentRef = React.createRef();
    }
    componentDidMount() {
        if (this.props.webglCanvas) {
            this._parentRef.current.appendChild(this.props.webglCanvas);
        }
    }
    render() {
        return (React.createElement("div", { className: "three-canvas-parent", ref: this._parentRef }));
    }
}

var css_248z$1 = ".arButton {\n    display: none;\n    position: absolute;\n    bottom: 20px;\n    padding: 12px 6px;\n    border: 1px solid #fff;\n    border-radius: 4px;\n    background: rgba(0,0,0,0.1);\n    color: #fff;\n    font: 'normal 13px sans-serif';\n    text-align: center;\n    opacity: 0.5;\n    outline: none;\n}\n\n.arButton.start {\n    display: initial;\n    cursor: pointer;\n    left: calc(50% - 50px);\n    width: 100px;\n}\n\n.arButton.disabled {\n    display: initial;\n    cursor: auto;\n    left: calc(50% - 75px);\n    width: 150px;\n}\n\n.arButton.disabled:hover {\n    background: rgba(255, 255, 255, 0.25);\n}";
styleInject(css_248z$1);

/**
 * This is a port of ARButton.js from Three JS to a React component.
 */
class ARButton extends Component {
    constructor(props) {
        super(props);
        this._currentSession = null;
        this.state = {
            mode: null
        };
        this.onClick = this.onClick.bind(this);
        this._onSessionStarted = this._onSessionStarted.bind(this);
        this._onSessionEnded = this._onSessionEnded.bind(this);
    }
    componentDidMount() {
        const nav = navigator;
        if ('xr' in nav) {
            nav.xr.isSessionSupported('immersive-ar')
                .then((supported) => {
                this.setState({ mode: supported ? 'start ar' : 'not supported' });
            })
                .catch((error) => {
                this.setState({ mode: 'not supported' });
            });
        }
        else {
            if (window.isSecureContext === false) {
                this.setState({ mode: 'need https' });
            }
            else {
                this.setState({ mode: 'not available' });
            }
        }
    }
    _onSessionStarted(session) {
        session.addEventListener('end', this._onSessionEnded);
        APEngine.webglRenderer.xr.setReferenceSpaceType('local');
        APEngine.webglRenderer.xr.setSession(session);
        this._currentSession = session;
    }
    _onSessionEnded() {
        this._currentSession.removeEventListener('end', this._onSessionEnded);
        this._currentSession = null;
    }
    onClick() {
        if (this.state.mode === 'start ar') {
            if (this._currentSession === null) {
                const nav = navigator;
                nav.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test']
                })
                    .then(this._onSessionStarted);
            }
            else {
                this._currentSession.end();
            }
        }
        else {
            window.open('https://immersiveweb.dev/');
        }
    }
    render() {
        if (this.state.mode === null) {
            return null;
        }
        let buttonText;
        let buttonClass;
        if (this.state.mode === 'start ar') {
            buttonText = 'START AR';
            buttonClass = 'arButton start';
        }
        else if (this.state.mode === 'not supported') {
            buttonText = 'AR NOT SUPPORTED';
            buttonClass = 'arButton disabled';
        }
        else if (this.state.mode === 'need https') {
            buttonText = 'WEBXR NEEDS HTTPS';
            buttonClass = 'arButton disabled';
        }
        else if (this.state.mode === 'not available') {
            buttonText = 'WEBXR NOT AVAILABLE';
            buttonClass = 'arButton disabled';
        }
        else {
            throw new Error(`[ARButton] Component does not implement ARButtonMode ${this.state.mode}`);
        }
        return (React.createElement("button", { className: buttonClass, onClick: this.onClick }, buttonText));
    }
}

class Overlay extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        var _a;
        const style = {
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            backgroundColor: (_a = this.props.color) !== null && _a !== void 0 ? _a : 'rgba(0,0,0,0.5)'
        };
        return (React.createElement("div", { id: 'overlay', style: style, onClick: () => {
                if (this.props.onClick) {
                    this.props.onClick();
                }
            } }));
    }
}

class DeviceCameraFeed extends Component {
    constructor(props) {
        super(props);
        this.tick = this.tick.bind(this);
        this._canvasRef = React.createRef();
    }
    componentDidMount() {
        // Start doing update ticks now that component is mounted and refs are obtained.
        this.tick();
    }
    componentWillUnmount() {
        cancelAnimationFrame(this._tickHandleId);
    }
    tick() {
        // Request for next animation frame for tick.
        this._tickHandleId = requestAnimationFrame(this.tick);
        // Must have current reference to canvas element.
        if (!this._canvasRef.current) {
            return;
        }
        // Device camera must be playing.
        if (!this.props.deviceCamera || !this.props.deviceCamera.isPlaying()) {
            return;
        }
        // Change canvas dimensions to match video.
        const canvas = this._canvasRef.current;
        const video = this.props.deviceCamera.getVideoElement();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Draw video onto canvas 2d context.
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    render() {
        var style = {};
        if (!this.props.className) {
            style = {
                position: 'fixed',
                width: '100%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }
        return (React.createElement("canvas", { style: style, ref: this._canvasRef, className: this.props.className }));
    }
}

export { ARButton, DeviceCameraFeed, Overlay, ThreeContainer };
//# sourceMappingURL=index.js.map
