import React, { Component } from 'react';
import { APEngine, DeviceCameraQRReader } from '@yeticgi/ape';
import { Overlay, DeviceCameraFeed } from '@yeticgi/ape-reactcomponents';

import './QRReader.css';

interface IQRReaderProps {
    /**
     * Callback invoked when a QR code is scanned.
     */
    onQRScanned: (code: string) => void;

    /**
     * Callback invoked if an error occurs internally.
     */
    onError: (error: any) => void;

    /**
     * Callback invoked if close button is clicked.
     */
    onCloseClick: () => void;
}

interface IQRReaderState {
    isSetup: boolean
}

export class QRReader extends Component<IQRReaderProps, IQRReaderState> {

    private _qrStreamReader: DeviceCameraQRReader;

    constructor(props: IQRReaderProps) {
        super(props);

        this.onOverlayClick = this.onOverlayClick.bind(this);

        this.state = {
            isSetup: false
        };
    }

    componentDidMount() {
        this.start();
    } 

    async start() {
        // Start device camera's video stream.
        const result = await APEngine.deviceCamera.startVideoStream();
        
        if (result.started) {
            // Create QR Stream Reader and start scanning the video stream.
            this._qrStreamReader = new DeviceCameraQRReader();
            this._qrStreamReader.onQRScanned.addListener((code) => {
                this.props.onQRScanned(code);
            });
    
            this._qrStreamReader.start({
                deviceCamera: APEngine.deviceCamera
            });

            this.setState({
                isSetup: true
            });
        } else {
            this.props.onError(result.error);           
        }

    }

    componentWillUnmount() {
        APEngine.deviceCamera.stopVideoStream();

        if (this._qrStreamReader) {
            this._qrStreamReader.stop();
            this._qrStreamReader.dispose();
        }
    }

    onOverlayClick() {
        // Dont do anything. We dont want to close the QR reader by clicking on the overlay.
    }

    private _deviceCameraFeed(): JSX.Element {
        if (this.state.isSetup) {
            const deviceCamera = APEngine.deviceCamera;
            if (deviceCamera && deviceCamera.isPlaying) {
                return <DeviceCameraFeed deviceCamera={deviceCamera} />
            }
        }

        return null;
    }

    render() {
        return (
            <div id='qr-reader'>
                <Overlay onClick={this.onOverlayClick} color={this.state.isSetup ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.8)'} />
                {this._deviceCameraFeed()}
                <button className='appButton qrReaderClose' onClick={this.props.onCloseClick}>Cancel</button>
            </div>
        );
    }
}