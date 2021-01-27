import React, { Component } from "react";
import { DeviceCamera } from "@yeti-cgi/ape";

interface IDeviceCameraFeedProps {
    /**
     * The Device Camera to use as input for video feed rendering.
     */
    deviceCamera: DeviceCamera,
    className?: string;
}

export class DeviceCameraFeed extends Component<IDeviceCameraFeedProps> {

    private _canvasRef: React.RefObject<HTMLCanvasElement>;
    private _tickHandleId: number;

    constructor(props: IDeviceCameraFeedProps) {
        super(props);

        this.tick = this.tick.bind(this);

        this._canvasRef = React.createRef<HTMLCanvasElement>();
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
        
        var style:React.CSSProperties = {};
        if (!this.props.className) {
            style = {
                position: 'fixed',
                width: '100%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        return (
            <canvas style={style} ref={this._canvasRef} className={this.props.className} />
        );
    }
}