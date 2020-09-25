import { Object3D } from 'three';
import { IDisposable } from '../misc/IDisposable';
import { Input } from './Input';
import { CameraDecorator } from '../gameobject/decorators/CameraDecorator';
export declare type PointerEventType = 'pointer enter' | 'pointer exit' | 'pointer down' | 'pointer up' | 'pointer click';
export interface IPointerEvent {
    /**
     * The string event type identifier.
     */
    eventType: PointerEventType;
    /**
     * The Object3D (if any) that was responsible for this event.
     */
    object: Object3D;
    /**
     * The object (if any) that had pointer down called on it at the time of this event.
     */
    pointerDown: IPointerEventListener;
}
export interface IPointerEnterEvent extends IPointerEvent {
}
export interface IPointerExitEvent extends IPointerEvent {
}
export interface IPointerDownEvent extends IPointerEvent {
}
export interface IPointerUpEvent extends IPointerEvent {
}
export interface IPointerClickEvent extends IPointerEvent {
}
export interface IPointerEventListener {
    /**
     * The objects that the pointer event system will use to detect collision for this listener.
     */
    pointerTargets: Object3D[];
    /**
     * Function that will be invoked when the pointer event system issues pointer enter event for this listener.
     * If
     */
    onPointerEnter(event: IPointerEnterEvent): void;
    /**
     * Function that will be invoked when the pointer event system issues pointer exit event for this listener.
     */
    onPointerExit(event: IPointerExitEvent): void;
    /**
     * Function that will be invoked when the pointer event system issues pointer down event for this listener.
     */
    onPointerDown(event: IPointerDownEvent): void;
    /**
     * Function that will be invoked when the pointer event system issues pointer up event for this listener.
     */
    onPointerUp(event: IPointerUpEvent): void;
    /**
     * Function that will be invoked when the pointer event system issues pointer click event for this listener.
     */
    onPointerClick(event: IPointerClickEvent): void;
}
/**
 * A class that can be used to easily listen for some basic input events for Three JS Oojects.
 */
export declare class PointerEventSystem implements IDisposable {
    static debug: boolean;
    private static _activeSystems;
    private static _focusedSystem;
    /**
     * List of all active pointer event systems.
     */
    static get activeSystems(): Readonly<PointerEventSystem[]>;
    /**
     * Update all active pointer events systems.
     * This function sorts the systems based on priority (highest to lowest priority).
     */
    static updateActiveSystems(input: Input): void;
    /**
     * The camera to use for hit testing pointer event listeners.
     * If this is undefined, this pointer event system will use the primary camera (CameraDecorator.PrimaryCamera).
     */
    cameraDecorator: CameraDecorator;
    /**
     * The priority this pointer event system has over other pointer event systems.
     * During an update frame, pointer event systems are sorted by priority (highest to lowest) and hit testing is done
     * in that order. If a hit is detected in a pointer system above another, all lower pointer systems have their pointers released and are then ignored.
     * Lower priority pointer systems are only reached if the higher priority systems dont detect any hits.
     */
    priority: number;
    private _name;
    private _enabled;
    private _listeners;
    private _pointerDown;
    private _pointerEnter;
    get name(): string;
    get pointerDown(): IPointerEventListener;
    get pointerEnter(): IPointerEventListener;
    get enabled(): boolean;
    set enabled(value: boolean);
    constructor(name: string, priority: number, cameraDecorator?: CameraDecorator);
    addListener(listener: IPointerEventListener): void;
    removeListener(listener: IPointerEventListener): void;
    /**
     * Update event system. Returns true if the update causes the pointer event system to become focused.
     */
    private _update;
    /**
     * Release any held pointers. If active enter/down listener, then exit/up is invoked.
     */
    releaseActivePointers(): void;
    dispose(): void;
    private _findEventListenerForObject;
}
