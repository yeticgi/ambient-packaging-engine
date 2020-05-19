import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { PerspectiveCamera, OrthographicCamera } from "three";
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
    private _fov;
    private _zoom;
    private _aspect;
    private _near;
    private _far;
    private _size;
    private _camera;
    /**
     * Is the camera orthographic or perspective.
     */
    get cameraType(): CameraType;
    set cameraType(value: CameraType);
    /**
     * Field of View for perspective camera. No affect on orthographic cameras.
     */
    get fov(): number;
    set fov(value: number);
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
    private _createCamera;
    private _removeCamera;
    onDestroy(): void;
}
