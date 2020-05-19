import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { Vector3 } from "three";
import { CameraDecorator } from "./CameraDecorator";
export interface ICameraOrbitDecoratorOptions extends IDecoratorOptions {
    cameraDecorator?: CameraDecorator;
}
/**
 * Decorator that provided orbit controls for a camera decorator.
 */
export declare class CameraOrbitDecorator extends Decorator {
    /**
     * The world position that the camera is looking at.
     */
    target: Vector3;
    /**
     * The distance in pixels that needs to be crossed in order for dragging to start.
     */
    dragThreshold: number;
    invertY: boolean;
    invertX: boolean;
    xMouseSpeed: number;
    yMouseSpeed: number;
    xTouchSpeed: number;
    yTouchSpeed: number;
    xMinDeg: number;
    xMaxDeg: number;
    yMinDeg: number;
    yMaxDeg: number;
    zoomMouseSpeed: number;
    zoomTouchSpeed: number;
    zoomMin: number;
    zoomMax: number;
    rotateWhileZooming: boolean;
    private _camera;
    private _inputEnabled;
    private _zoomEnabled;
    private _isDragging;
    private _isZooming;
    private _x;
    private _y;
    private _zoomDistance;
    private _inputDown;
    private _inputDownStartPos;
    private _inputDragLastPos;
    private _inputTouchZoomDist;
    get inputEnabled(): boolean;
    set inputEnabled(value: boolean);
    get zoomEnabled(): boolean;
    set zoomEnabled(value: boolean);
    get camera(): CameraDecorator;
    get isDragging(): boolean;
    get isZooming(): boolean;
    configure(options: ICameraOrbitDecoratorOptions): void;
    onAttach(gameObject: GameObject): void;
    onVisible(): void;
    onInvisible(): void;
    onStart(): void;
    setOrbit(x?: number, y?: number): void;
    setOrbitFromGeoCoord(latitude?: number, longitude?: number): void;
    getOrbit(): {
        x: number;
        y: number;
    };
    setZoomDistance(zoom: number): void;
    getZoomDistance(): number;
    private _rotateControls;
    private _zoomControls;
    private _updateCamera;
    onUpdate(): void;
    onLateUpdate(): void;
    onDestroy(): void;
}
