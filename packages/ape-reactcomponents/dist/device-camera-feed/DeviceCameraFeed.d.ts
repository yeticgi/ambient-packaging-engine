import { Component } from "react";
import { DeviceCamera } from "@yeticgi/ape";
interface IDeviceCameraFeedProps {
    /**
     * The Device Camera to use as input for video feed rendering.
     */
    deviceCamera: DeviceCamera;
    className?: string;
}
export declare class DeviceCameraFeed extends Component<IDeviceCameraFeedProps> {
    private _canvasRef;
    private _tickHandleId;
    constructor(props: IDeviceCameraFeedProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    tick(): void;
    render(): JSX.Element;
}
export {};
