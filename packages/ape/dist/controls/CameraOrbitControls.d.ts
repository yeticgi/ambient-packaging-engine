import { PerspectiveCamera, Vector3 } from 'three';
export interface IDefaultSettings {
    zoomDistance?: number;
    x?: number;
    y?: number;
}
export declare class CameraOrbitControls {
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
    get camera(): PerspectiveCamera;
    get isDragging(): boolean;
    get isZooming(): boolean;
    constructor(camera: PerspectiveCamera);
    update(): void;
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
}
