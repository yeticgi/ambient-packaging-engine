import {
    PerspectiveCamera,
    Vector3,
    Spherical,
    Vector2,
    Quaternion,
    Matrix4,
    Math as ThreeMath,
    OrthographicCamera,
    Euler,
} from 'three';
import { InputType, MouseButtonId, Input } from '../input/Input';
import { clampDegAngle, pointOnSphere, clamp } from '../utils/Utils';
import { APEngine } from '../APEngine';

export class CameraOrbitControls {

    /**
     * The world position that the camera is looking at.
     */
    target: Vector3 = new Vector3();

    /**
     * The distance that camera is from the target.
     */
    zoomDistance: number = 20.0;

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

    private _camera: PerspectiveCamera = null;
    private _inputEnabled: boolean = true;
    private _isDragging: boolean = false;
    private _x: number = 0;
    private _y: number = 0;
    private _inputDown: boolean = false;
    private _inputDownStartPos: Vector2 = new Vector2();
    private _inputDragLastPos: Vector2 = new Vector2();
    
    get inputEnabled(): boolean { return this._inputEnabled; }
    set inputEnabled(value: boolean) { 
        this._inputEnabled = value;

        if (!this.inputEnabled) {
            this._inputDown = false;
            this._isDragging = false;
            this._inputDownStartPos.set(0, 0);
            this._inputDragLastPos.set(0, 0);
        }
    }
    get camera(): PerspectiveCamera { return this._camera; } 
    get isDragging(): boolean { return this._isDragging; } 

    constructor(camera: PerspectiveCamera) {
        this._camera = camera;

        this._x = ThreeMath.radToDeg(this._camera.rotation.y);
        this._y = ThreeMath.radToDeg(this._camera.rotation.x);
    }

    update(): void {
        if (this.target) {
            this._rotateControls();
            this._zoomControls();
            this._updateCamera();
        }
    }

    private _rotateControls(): void {
        if (!this.inputEnabled) {
            return;
        }

        const input = APEngine.input;
        

        if (input.currentInputType === InputType.Touch && input.getTouchDown(0)) {
            this._inputDown = true;
            this._inputDownStartPos.copy(input.getTouchClientPos(0));
        } else if (input.currentInputType === InputType.Mouse && input.getMouseButtonDown(0)) {
            this._inputDown = true;
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
            if (input.currentInputType === InputType.Touch && input.getTouchHeld(0)) {
                const delta = this._inputDragLastPos.clone().sub(input.getTouchClientPos(0));
                this._x += delta.x * this.xTouchSpeed;
                this._y += delta.y * this.yTouchSpeed;
                this._inputDragLastPos.copy(input.getTouchClientPos(0));
            } else if (input.currentInputType === InputType.Mouse && input.getMouseButtonHeld(0)) {
                const delta = this._inputDragLastPos.clone().sub(input.getMouseClientPos());
                this._x += delta.x * this.xMouseSpeed;
                this._y += delta.y * this.yMouseSpeed;
                this._inputDragLastPos.copy(input.getMouseClientPos());
            }
        }
    }

    private _zoomControls(): void {
        if (!this.inputEnabled) {
            return;
        }
    }

    private _updateCamera(): void {
        this._x = clampDegAngle(this._x, this.xMinDeg, this.xMaxDeg);
        this._y = clampDegAngle(this._y, this.yMinDeg, this.yMaxDeg);

        const position = pointOnSphere(
            this.target, 
            this.zoomDistance, 
            new Vector2(
                this.invertY ? -this._y : this._y,
                this.invertX ? -this._x : this._x,
            )
        );
        this._camera.position.copy(position);
        
        this._camera.lookAt(this.target);
    }
}