import { Component } from 'react';
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
    isSetup: boolean;
}
export declare class QRReader extends Component<IQRReaderProps, IQRReaderState> {
    private _qrStreamReader;
    constructor(props: IQRReaderProps);
    componentDidMount(): void;
    start(): Promise<void>;
    componentWillUnmount(): void;
    onOverlayClick(): void;
    private _deviceCameraFeed;
    render(): JSX.Element;
}
export {};
