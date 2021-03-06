import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { PerspectiveCamera, OrthographicCamera, MathUtils, Matrix4, Vector3, Euler, Frustum } from "three";
import { getOptionalValue } from "../../utils/MiscUtils";
import { calculateFrustumPlanes } from "../../utils/MathUtils";
import { APEngineEvents } from "../../APEngineEvents";

export declare type CameraType = 'perspective' | 'orthographic';

export declare type FieldOfViewType = 'vertical' | 'horizontal';

export interface ICameraDecoratorOptions extends IDecoratorOptions {
    cameraType?: CameraType;
    fovType?: FieldOfViewType;
    vFov?: number;
    hFov?: number;
    zoom?: number;
    aspect?: number;
    near?: number;
    far?: number;
    size?: number;
}

/**
 * Camera decorator creates and manages ThreeJS cameras. 
 * You can change the camera type on the fly by setting the cameraType property.
 */
export class CameraDecorator extends Decorator {

    private static _PrimaryCamera: CameraDecorator = null;
    private static _Cameras: CameraDecorator[] = [];

    /**
     * The camera that is marked as primary.
     * If no camera is marked as primary, than the first camera is returned.
     */
    static get PrimaryCamera(): CameraDecorator {
        if (this._PrimaryCamera) {
            return this._PrimaryCamera;
        } else if (this._Cameras.length > 0) {
            return this._Cameras[0];
        } else {
            return null;
        }
    }

    static set PrimaryCamera(cam: CameraDecorator) {
        if (this._PrimaryCamera !== cam) {
            this._PrimaryCamera = cam;
        }
    }

    /**
     * Cameras that are updated by APEngine.
     * These camera will automatically get resized when APEngine window resize is triggered.
     */
    static get Cameras(): Readonly<CameraDecorator[]> {
        return this._Cameras;
    }

    private _cameraType: CameraType;
    private _fovType: FieldOfViewType;
    private _vFov: number;
    private _hFov: number;
    private _zoom: number;
    private _aspect: number;
    private _near: number;
    private _far: number;
    private _size: number;
    private _camera: PerspectiveCamera | OrthographicCamera;
    private _nonXrPositon: Vector3;
    private _nonXrRotation: Euler;
    private _nonXrScale: Vector3;
    private _frustum = new Frustum();
    private _projScreenMatrix = new Matrix4();

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
     * Field of View type for perspective camera. The field of view type dictates
     * how vertical fov is calculated based on the aspect ratio. No affect on orthographic cameras.
     */
    get fovType(): FieldOfViewType { return this._fovType }
    set fovType(value: FieldOfViewType) {
        if (this._fovType !== value) {
            this._fovType = value;

            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this.resize();
            }
        }
    }

    /**
     * Vertical field of view for perspective camera. No affect on orthographic cameras.
     * If field of view type is set to horizontal, the vertical field of view will be dynamic.
     * This is the default FOV that Three JS cameras use.
     */
    get vFov(): number { return this._vFov }
    set vFov(value: number) { 
        if (this._vFov !== value) {
            this._vFov = value;

            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this._camera.fov = this._vFov;
                this._camera.updateProjectionMatrix();
            }
        }
    }

    /**
     * Horizontal field of view for perspective camera. No affect on orthographic cameras.
     * Only has an affect if the field of view type is set to horizontal.
     */
    get hFov(): number { return this._hFov }
    set hFov(value: number) { 
        if (this._hFov !== value) {
            this._hFov = value;

            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this.resize();
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
                this._camera.updateProjectionMatrix();
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
                this._camera.updateProjectionMatrix();
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
                this._camera.updateProjectionMatrix();
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
                this._camera.updateProjectionMatrix();
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
                this._camera.updateProjectionMatrix();
            }
        }
    }

    /**
     * ThreeJS camera that is managed by this camera decorator.
     */
    get camera(): Readonly<PerspectiveCamera> | Readonly<OrthographicCamera> { return this._camera; }

    /**
     * The frustum for the camera. Useful for doing intersection tests with the area visible to the camera.
     */
    get frustum(): Frustum { return this._frustum }

    configure(options: ICameraDecoratorOptions): void {
        super.configure(options);

        this._cameraType = getOptionalValue(options.cameraType, 'perspective');
        this._fovType = getOptionalValue(options.fovType, 'vertical');
        this._vFov = getOptionalValue(options.vFov, 50);
        this._hFov = getOptionalValue(options.hFov, 50);
        this._zoom = getOptionalValue(options.zoom, 1);
        this._aspect = getOptionalValue(options.aspect, window.innerWidth / window.innerHeight);
        this._far = getOptionalValue(options.far, 2000);
        this._near = getOptionalValue(options.near, 0.1);
        this._size = getOptionalValue(options.size, 25);
    }

    onAttach(gameObject: GameObject): void {
        super.onAttach(gameObject);

        this._createCamera();
        this._updateFrustum();

        // Add camera decorator to global list of camera decorators.
        CameraDecorator._Cameras.push(this);

        this._onXRSessionStarted = this._onXRSessionStarted.bind(this);
        APEngineEvents.onXRSessionStarted.addListener(this._onXRSessionStarted);

        this._onXRSessionEnded = this._onXRSessionEnded.bind(this);
        APEngineEvents.onXRSessionEnded.addListener(this._onXRSessionEnded);

        this.resize();
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

        this._updateFrustum();
    }

    onLateUpdate(): void {
        super.onLateUpdate();
    }

    resize(): void {
        if (this._camera) {
            this.aspect = window.innerWidth / window.innerHeight;

            if (this._camera instanceof PerspectiveCamera) {
                if (this._fovType === 'horizontal') {
                    // Reference: https://github.com/mrdoob/three.js/issues/15968#issuecomment-475986352
                    this.vFov = Math.atan( Math.tan( this._hFov * Math.PI / 360 ) / this.aspect ) * 360 / Math.PI;
                } else {
                    this._hFov = 2 * Math.atan( Math.tan( this.vFov * Math.PI / 180 / 2 ) * this.aspect ) * 180 / Math.PI;
                }
            } else {
                // Update frustum planes for othrogtraphic camera using new aspect ratio.
                const planes = calculateFrustumPlanes(this._size, this._aspect);
                this._camera.left = planes.left;
                this._camera.right = planes.right;
                this._camera.top = planes.top;
                this._camera.bottom = planes.bottom;
                this._camera.updateProjectionMatrix();
            }
        }
    }

    private _onXRSessionStarted(): void {
        // Store this camera decorator's game object matrix before the WebXRManager starts overtwriting camera positioning.
        this._nonXrPositon = this.gameObject.position.clone();
        this._nonXrRotation = this.gameObject.rotation.clone();
        this._nonXrScale = this.gameObject.scale.clone();

        // Reset the camera decorator game object to default position, rotation, and scale.
        // WebXRManager doesnt like if the xr camera to be parented to an object with an offset.
        this.gameObject.position.set(0, 0, 0);
        this.gameObject.rotation.set(0, 0, 0);
        this.gameObject.scale.set(1, 1, 1);
    }

    private _onXRSessionEnded(): void {
        // Restore the camera decorator's game object to the position, rotation, and scale it was at before entering XR mode.
        this.gameObject.position.copy(this._nonXrPositon);
        this.gameObject.rotation.copy(this._nonXrRotation);
        this.gameObject.scale.copy(this._nonXrScale);

        this._nonXrPositon = null;
        this._nonXrRotation = null;
        this._nonXrScale = null;
    }

    private _createCamera(): void {
        if (!this.gameObject) {
            // Dont create camera until this decorator is attached to a GameObject.
            return;
        }

        if (this._cameraType === 'perspective') {
            this._camera = new PerspectiveCamera(this._vFov, this._aspect, this._near, this._far);
        } else if (this._cameraType === 'orthographic') {
            const planes = calculateFrustumPlanes(this._size, this._aspect);
            this._camera = new OrthographicCamera(planes.left, planes.right, planes.top, planes.bottom, this._near, this._far);
        } else {
            console.error(`[CameraDecorator] Can't create camera. Unknown camera type: ${this._cameraType}`);
        }

        if (this._camera) {
            // Rotate camera 180 degrees on the y-axis so that it faces forward.
            this._camera.rotateY(180 * MathUtils.DEG2RAD);

            // Add camera to this gameObject.
            this.gameObject.add(this._camera);
        }

        this.resize();
    }

    private _removeCamera(): void {
        if (!this._camera) {
            // No camera to remove.
            return;
        }

        if (this._camera.parent) {
            this._camera.parent.remove(this._camera);
        }
        this._camera = null;
    }

    private _updateFrustum(): void {
        if (!this._camera) {
            // Need camera to update frustum.
            return;
        }

        this._projScreenMatrix.multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse);
        this._frustum.setFromProjectionMatrix(this._projScreenMatrix);
    }

    onDestroy(): void {
        super.onDestroy();

        this._removeCamera();
        
        // Remove camera decorator from global list of camera decorators.
        const index = CameraDecorator._Cameras.findIndex(cameraDecorator => cameraDecorator === this);
        if (index >= 0) {
            CameraDecorator._Cameras.splice(index, 1);
        }

        // If this camera is the primary camera, set primary camera back to null.
        if (CameraDecorator._PrimaryCamera === this) {
            CameraDecorator._PrimaryCamera = null;
        }
    }
}