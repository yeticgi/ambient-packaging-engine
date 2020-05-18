import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { PerspectiveCamera, OrthographicCamera } from "three";
import { getOptionalValue } from "../../utils/MiscUtils";
import { calculateFrustumPlanes } from "../../utils/MathUtils";

export declare type CameraType = 'perspective' | 'orthographic';

export interface ICameraDecoratorOptions extends IDecoratorOptions {
    cameraType?: CameraType;
    fov?: number;
    zoom?: number;
    aspect?: number;
    near?: number;
    far?: number;
    size?: number;
}

export class CameraDecorator extends Decorator {

    private _cameraType: CameraType;
    private _fov: number;
    private _zoom: number;
    private _aspect: number;
    private _near: number;
    private _far: number;
    private _size: number;
    private _camera: PerspectiveCamera | OrthographicCamera;

    /**
     * Is the camera orthographic or perspective.
     */
    get cameraType(): CameraType { return this._cameraType }
    set cameraType(value: CameraType) {
        if (this._cameraType !== value) {
            this._cameraType = value;
            this._removeCamera();
            this._createCamera();
        }
    }

    /**
     * Field of View for perspective camera. No affect on orthographic cameras.
     */
    get fov(): number { return this._fov }
    set fov(value: number) { 
        if (this._fov !== value) {
            this._fov = value;

            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this._camera.fov = this._fov;
            }
        }
    }

    /**
     * Zoom level of the camera.
     */
    get zoom(): number { return this._zoom }   
    set zoom(value: number) { 
        if (this._zoom !== value) {
            this._zoom = value;

            if (this._camera) {
                this._camera.zoom = this._zoom;
            }
        }
    }

    /**
     * Aspect ratio of perspective camera. Has no effect on orthographic camera.
     */
    get aspect(): number { return this._aspect }
    set aspect(value: number) {
        if (this._aspect !== value) {
            this._aspect = value;

            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this._camera.aspect = this._aspect;
            }
        }
    }

    /** 
     * Far clipping plane 
     */
    get far(): number { return this._far }
    set far(value: number) {
        if (this._far !== value) {
            this._far = value;

            if (this._camera) {
                this._camera.far = this._far;
            }
        }
    }

    /**
     * Near clipping plane
     */
    get near(): number { return this._near }
    set near(value: number) { 
        if (this._near !== value) {
            this._near = value;

            if (this._camera) {
                this._camera.near = this._near;
            }
        }
    }

    /**
     * The frustum size of orthographic camera. This has no affect on perspective camera.
     */
    get size(): number { return this._size }
    set size(value: number) {
        if (this._size !== value) {
            this._size = value;

            if (this._camera && this._camera instanceof OrthographicCamera) {
                const planes = calculateFrustumPlanes(this._size, this._aspect);
                this._camera.left = planes.left;
                this._camera.right = planes.right;
                this._camera.top = planes.top;
                this._camera.bottom = planes.bottom;
            }
        }
    }

    /**
     * ThreeJS camera that is managed by this camera decorator.
     */
    get camera(): Readonly<PerspectiveCamera> | Readonly<OrthographicCamera> { return this._camera; }

    configure(options: ICameraDecoratorOptions): void {
        super.configure(options);

        this._cameraType = getOptionalValue(options.cameraType, 'perspective');
        this._fov = getOptionalValue(options.fov, 50);
        this._zoom = getOptionalValue(options.zoom, 1);
        this._aspect = getOptionalValue(options.aspect, window.innerWidth / window.innerHeight);
        this._far = getOptionalValue(options.far, 2000);
        this._near = getOptionalValue(options.near, 0.1);
    }

    onAttach(gameObject: GameObject): void {
        super.onAttach(gameObject);

        this._createCamera();
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

    onUpdate(): void {
        super.onUpdate();
    }

    onLateUpdate(): void {
        super.onLateUpdate();
    }

    private _createCamera(): void {
        if (!this.gameObject) {
            // Dont create camera until this decorator is attached to a GameObject.
            return;
        }

        if (this._cameraType === 'perspective') {
            this._camera = new PerspectiveCamera(this._fov, this._aspect, this._near, this._far);
        } else if (this._cameraType === 'orthographic') {
            const planes = calculateFrustumPlanes(this._size, this._aspect);
            this._camera = new OrthographicCamera(planes.left, planes.right, planes.top, planes.bottom, this._near, this._far);
        } else {
            console.error(`[CameraDecorator] Can't create camera. Unknown camera type: ${this._cameraType}`);
        }
    }

    private _removeCamera(): void {
        if (this._camera) {
            if (this._camera.parent) {
                this._camera.parent.remove(this._camera);
            }
            this._camera = null;
        }
    }

    onDestroy(): void {
        super.onDestroy();

        this._removeCamera();
    }
}