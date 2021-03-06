import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { Vector3, Vector2 } from "three";
import { CameraDecorator } from "./CameraDecorator";
import { clamp, clampDegAngle, pointOnSphere } from "../../utils/MathUtils";
import { APEngine } from "../../APEngine";
import { InputType } from "../../input/Input";
import { getOptionalValue } from "../../utils/MiscUtils";
import { TransformTool } from "../../misc/TransformTool";

export interface ICameraOrbitDecoratorOptions extends IDecoratorOptions {
    cameraDecorator?: CameraDecorator;
}

/**
 * Decorator that provided orbit controls for a camera decorator.
 */
export class CameraOrbitDecorator extends Decorator {
    /**
     * The world position that the camera is looking at.
     */
    target: Vector3 = new Vector3();

    /**
     * The distance in pixels that needs to be crossed in order for dragging to start.
     */
    dragThreshold = 10.0;

    invertY: boolean = true;
    invertX: boolean = true;

    xMouseSpeed = 1.0;
    yMouseSpeed = 1.0;
    xTouchSpeed = 1.0;
    yTouchSpeed = 1.0;

    xMinDeg = -360.0;
    xMaxDeg = 360.0;
    yMinDeg = -90.0;
    yMaxDeg = 90.0;

    zoomMouseSpeed = 1.0;
    zoomTouchSpeed = 1.0;

    zoomMin = 0.0;
    zoomMax = 40.0;

    rotateWhileZooming: boolean = false;

    private _camera: CameraDecorator = null;
    private _inputEnabled: boolean = true;
    private _zoomEnabled: boolean = true;
    private _isDragging: boolean = false;
    private _isZooming: boolean = false;
    private _x: number = 0;
    private _y: number = 0;
    private _zoomDistance: number = 0;
    private _inputDown: boolean = false;
    private _inputDownStartPos: Vector2 = new Vector2();
    private _inputDragLastPos: Vector2 = new Vector2();
    private _inputTouchZoomDist: number = 0;
    
    get inputEnabled(): boolean { return this._inputEnabled; }
    set inputEnabled(value: boolean) { 
        this._inputEnabled = value;

        if (!this.inputEnabled) {
            this._inputDown = false;
            this._isDragging = false;
            this._isZooming = false;
            this._inputDownStartPos.set(0, 0);
            this._inputDragLastPos.set(0, 0);
            this._inputTouchZoomDist = 0;
        }
    }

    get zoomEnabled(): boolean { return this._zoomEnabled; }
    set zoomEnabled(value: boolean) {
        this._zoomEnabled = value;

        if (!this._zoomEnabled) {
            this._isZooming = false;
            this._inputTouchZoomDist = 0;
        }
    }

    get camera(): CameraDecorator { return this._camera; } 
    get isDragging(): boolean { return this._isDragging; } 
    get isZooming(): boolean { return this._isZooming; }

    configure(options: ICameraOrbitDecoratorOptions): void {
        super.configure(options);

        this._camera = getOptionalValue(options.cameraDecorator, null);
    }

    onAttach(gameObject: GameObject): void {
        super.onAttach(gameObject);

        if (!this._camera) {
            // If no camera was provided, look for one on the gameObject we are attached to.
            this._camera = this.gameObject.getDecorator(CameraDecorator);
        }

        if (!this._camera) {
            console.error(`[CameraOrbitDecorator] No camera decorator to control. Need to be provided one or be attached to GameObject with CameraDecorator on it.`);
        }
    }

    onVisible() {
        super.onVisible();
    }

    onInvisible() {
        super.onInvisible();
    }

    onStart(): void {
        super.onStart();
    }

    setOrbit(x?: number, y?: number) {
        let set = false;
        if (typeof x === 'number') {
            this._x = x;
            set = true;
        }
        if (typeof y === 'number') {
            this._y = y;
            set = true;
        }
        if (set) {
            this._updateCamera();
        }
    }

    setOrbitFromGeoCoord(latitude?: number, longitude?: number): void {
        let set = false;
        if (typeof longitude === 'number') {
            this._x = -90 + longitude;
            set = true;
        }
        if (typeof latitude === 'number') {
            this._y = -latitude;
            set = true;
        }
        if (set) {
            this._updateCamera();
        }
    }

    getOrbit(): { x: number, y: number } {
        return {
            x: this._x,
            y: this._y
        }
    }

    setZoomDistance(zoom: number) {
        zoom = clamp(zoom, this.zoomMin, this.zoomMax);

        if (this._zoomDistance !== zoom) {
            this._zoomDistance = zoom;
            this._updateCamera();
        }
    }

    getZoomDistance(): number {
        return this._zoomDistance;
    }

    private _rotateControls(): void {
        if (!this.inputEnabled) {
            return;
        }

        const input = APEngine.input;

        if (input.currentInputType === InputType.Touch && input.getTouchDown(0)) {
            this._inputDown = true;
            this._isDragging = false;
            this._inputDownStartPos.copy(input.getTouchClientPos(0));
        } else if (input.currentInputType === InputType.Mouse && input.getMouseButtonDown(0)) {
            this._inputDown = true;
            this._isDragging = false;
            this._inputDownStartPos.copy(input.getMouseClientPos());
        }
        
        if (this._inputDown && !this._isDragging) {
            // Need to cross drag theshold in order to start dragging.
            let dragDistance: number = 0.0;
            let inputPos: Vector2;
            if (input.currentInputType === InputType.Touch) {
                inputPos = input.getTouchClientPos(0);
            } else {
                inputPos = input.getMouseClientPos();
            }

            dragDistance = this._inputDownStartPos.distanceTo(inputPos);

            if (dragDistance >= this.dragThreshold) {
                this._isDragging = true;
                this._inputDragLastPos.copy(inputPos);
            }
        }

        if (input.currentInputType === InputType.Touch && input.getTouchUp(0)) {
            this._inputDown = false;
            this._isDragging = false;
            this._inputDownStartPos.set(0, 0);
        } else if (input.currentInputType === InputType.Mouse && input.getMouseButtonUp(0)) {
            this._inputDown = false;
            this._isDragging = false;
            this._inputDownStartPos.set(0, 0);
        }

        if (this._isDragging) {
            const rotateAllowed = !this.isZooming || (this.isZooming && this.rotateWhileZooming);

            if (input.currentInputType === InputType.Touch && input.getTouchHeld(0)) {
                if (rotateAllowed) {
                    const delta = this._inputDragLastPos.clone().sub(input.getTouchClientPos(0));
                    this._x += (delta.x * this.xTouchSpeed);
                    this._y += (delta.y * this.yTouchSpeed);
                }
                this._inputDragLastPos.copy(input.getTouchClientPos(0));
            } else if (input.currentInputType === InputType.Mouse && input.getMouseButtonHeld(0)) {
                if (rotateAllowed) {
                    const delta = this._inputDragLastPos.clone().sub(input.getMouseClientPos());
                    this._x += (delta.x * this.xMouseSpeed);
                    this._y += (delta.y * this.yMouseSpeed);
                }
                this._inputDragLastPos.copy(input.getMouseClientPos());
            }
        }
    }

    private _zoomControls(): void {
        if (!this.inputEnabled) {
            return;
        }
        if (!this._zoomEnabled) {
            return;
        }

        const input = APEngine.input;

        let zoomDelta: number = 0;

        if (input.currentInputType === InputType.Touch && input.getTouchCount() === 2) {
            const posA = input.getTouchClientPos(0);
            const posB = input.getTouchClientPos(1);
            const distance = posA.distanceTo(posB);

            if (input.getTouchDown(1)) {
                // Pinch zoom start.
                this._isZooming = true;
                
                // Calculate starting distance between the two touch points.
                this._inputTouchZoomDist = distance;
            } else {
                zoomDelta = ((this._inputTouchZoomDist - distance) * this.zoomTouchSpeed);
                this._inputTouchZoomDist = distance;
            }
        } else if (input.currentInputType === InputType.Mouse && input.getWheelMoved()) {
            this._isZooming = true;
            zoomDelta = (input.getWheelData().delta.y * this.zoomMouseSpeed);
        } else {
            this._isZooming = false;
            this._inputTouchZoomDist = 0;
        }

        if (zoomDelta !== 0) {
            this._zoomDistance = clamp(this._zoomDistance + zoomDelta, this.zoomMin, this.zoomMax);
        }
    }

    private _updateCamera(): void {
        this._x = clampDegAngle(this._x, this.xMinDeg, this.xMaxDeg);
        this._y = clampDegAngle(this._y, this.yMinDeg, this.yMaxDeg);

        if (this._camera) {
            const position = pointOnSphere(
                this.target, 
                this._zoomDistance, 
                new Vector2(
                    this.invertY ? -this._y : this._y,
                    this.invertX ? -this._x : this._x,
                )
            );
            
            this._camera.gameObject.position.copy(position);
            this._camera.gameObject.lookAt(this.target);
        }
    }

    onUpdate(): void {
        super.onUpdate();
        
        if (!APEngine.isXREnabled() && !TransformTool.isMouseDown() && this.target) {
            this._rotateControls();
            this._zoomControls();
            this._updateCamera();
        }
    }

    onLateUpdate(): void {
        super.onLateUpdate();
    }

    onDestroy(): void {
        super.onDestroy();
    }
}