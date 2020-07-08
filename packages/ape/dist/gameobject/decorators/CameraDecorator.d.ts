import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { PerspectiveCamera, OrthographicCamera } from "three";
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
export declare class CameraDecorator extends Decorator {
    private static _PrimaryCamera;
    private static _Cameras;
    /**
     * The camera that is marked as primary.
     * If no camera is marked as primary, than the first camera is returned.
     */
    static get PrimaryCamera(): CameraDecorator;
    static set PrimaryCamera(cam: CameraDecorator);
    /**
     * Cameras that are updated by APEngine.
     * These camera will automatically get resized when APEngine window resize is triggered.
     */
    static get Cameras(): Readonly<CameraDecorator[]>;
    private _cameraType;
    private _fovType;
    private _vFov;
    private _hFov;
    private _zoom;
    private _aspect;
    private _near;
    private _far;
    private _size;
    private _camera;
    private _nonXrPositon;
    private _nonXrRotation;
    private _nonXrScale;
    /**
     * Is the camera orthographic or perspective.
     */
    get cameraType(): CameraType;
    set cameraType(value: CameraType);
    /**
     * Field of View type for perspective camera. The field of view type dictates
     * how vertical fov is calculated based on the aspect ratio. No affect on orthographic cameras.
     */
    get fovType(): FieldOfViewType;
    set fovType(value: FieldOfViewType);
    /**
     * Vertical field of view for perspective camera. No affect on orthographic cameras.
     * If field of view type is set to horizontal, the vertical field of view will be dynamic.
     * This is the default FOV that Three JS cameras use.
     */
    get vFov(): number;
    set vFov(value: number);
    /**
     * Horizontal field of view for perspective camera. No affect on orthographic cameras.
     * Only has an affect if the field of view type is set to horizontal.
     */
    get hFov(): number;
    set hFov(value: number);
    /**
     * Zoom level of the camera.
     */
    get zoom(): number;
    set zoom(value: number);
    /**
     * Aspect ratio of perspective camera. Has no effect on orthographic camera.
     */
    get aspect(): number;
    set aspect(value: number);
    /**
     * Far clipping plane
     */
    get far(): number;
    set far(value: number);
    /**
     * Near clipping plane
     */
    get near(): number;
    set near(value: number);
    /**
     * The frustum size of orthographic camera. This has no affect on perspective camera.
     */
    get size(): number;
    set size(value: number);
    /**
     * ThreeJS camera that is managed by this camera decorator.
     */
    get camera(): Readonly<PerspectiveCamera> | Readonly<OrthographicCamera>;
    configure(options: ICameraDecoratorOptions): void;
    onAttach(gameObject: GameObject): void;
    onVisible(): void;
    onInvisible(): void;
    onStart(): void;
    onUpdate(): void;
    onLateUpdate(): void;
    resize(): void;
    private _onXRSessionStarted;
    private _onXRSessionEnded;
    private _createCamera;
    private _removeCamera;
    onDestroy(): void;
}
