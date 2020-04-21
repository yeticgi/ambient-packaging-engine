import { Object3D, Camera } from 'three';
import { IDisposable } from '../misc/IDisposable';
import { Input } from './Input';
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
    private _listeners;
    private _pointerDown;
    private _pointerEnter;
    constructor();
    addListener(listener: IPointerEventListener): void;
    removeListener(listener: IPointerEventListener): void;
    update(input: Input, camera: Camera): void;
    dispose(): void;
    private _findEventListenerForObject;
}
