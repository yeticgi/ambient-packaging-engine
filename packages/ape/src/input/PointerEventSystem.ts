import { Object3D, Vector2, Intersection, Camera } from 'three';
import { IDisposable } from '../misc/IDisposable';
import { Input, InputType } from './Input';
import { Physics } from '../physics/Physics';

export type PointerEventType = 'pointer enter' | 'pointer exit' | 'pointer down' | 'pointer up' | 'pointer click';

export interface IPointerEvent {
    eventType: PointerEventType;
    object: Object3D;
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
export class PointerEventSystem implements IDisposable {

    private _listeners: Set<IPointerEventListener> = new Set();
    private _pointerDown: IPointerEventListener = null;
    private _pointerEnter: IPointerEventListener = null;

    constructor() {
    }

    addListener(listener: IPointerEventListener): void {
        if (!this._listeners.has(listener)) {
            this._listeners.add(listener);
        }
    }

    removeListener(listener: IPointerEventListener): void {
        this._listeners.delete(listener);
    }

    update(input: Input, camera: Camera): void {
        if (!input || !camera) {
            // Pointer event system needs both an input module and a camera.
            return;
        }

        if (input.currentInputType !== InputType.Mouse &&
            input.currentInputType !== InputType.Touch
        ) {
            // Pointer Event System only works with mouse and touch input types.
            return;
        }

        // Retrieve the pointer's current screen position.
        let pointerScreenPos: Vector2 = (input.currentInputType === InputType.Mouse) ? input.getMouseScreenPos() : input.getTouchScreenPos(0);

        // Raycast against pointer event listeners using the pointer's screen position to find 
        // the event listener that is currently the closest to the camera.
        let closestIntersection: Intersection;
        let closestListener: IPointerEventListener;

        if (pointerScreenPos) {
            // Collect all listener target objects.
            const allListenerTargets: Object3D[] = [];
            this._listeners.forEach((listener) => {
                allListenerTargets.push(...listener.pointerTargets);
            });
    
            // Raycast againsts all pointer event listener target objects.
            const hits = Physics.raycastAtScreenPos(pointerScreenPos, allListenerTargets, camera);
            closestIntersection = Physics.firstRaycastHit(hits);
            closestListener = closestIntersection ? this._findEventListenerForObject(closestIntersection.object) : null;
        } else {
            // No pointer screen position currently.
            closestIntersection = null;
            closestListener = null;
        }

        // Pointer enter/exit events.
        if (closestListener) {
            if (this._pointerEnter !== null && this._pointerEnter !== closestListener) {
                // Let the last pointer enter object know that the pointer has exited it.
                const pointerExit = this._pointerEnter;
                this._pointerEnter = null;

                pointerExit.onPointerExit({
                    eventType: 'pointer exit',
                    object: closestIntersection.object
                });
            }

            if (this._pointerEnter === null) {
                // Let the closest listener know that the pointer has entered it.
                this._pointerEnter = closestListener;

                this._pointerEnter.onPointerEnter({
                    eventType: 'pointer enter',
                    object: closestIntersection.object
                });
            }

        } else {
            // Pointer is not over any listeners.
            if (this._pointerEnter !== null) {
                // Let the last pointer enter object know that the pointer has exited it.
                this._pointerEnter.onPointerExit({
                    eventType: 'pointer exit',
                    object: null
                });
                this._pointerEnter = null;
            }
        }

        // Pointer down/up/click events.

            // if (this._pointerEnter !== null && this._pointerDown === null) {
            //     // Detect pointer down event with primary input action on the last pointer enter object.
            //     const isPrimaryDown: boolean = (input.currentInputType === InputType.Mouse) ? input.getMouseButtonDown(0) : input.getTouchDown(0);
                
            //     if (isPrimaryDown) {
            //         // Let the closest listener know that the pointer is down on it.
            //         this._pointerDown = closestListener;
    
            //         this._pointerDown.onPointerDown({
            //             eventType: 'pointer down',
            //             object: closestIntersection.object
            //         });
            //     }
            // }

            // if (this._pointerDown !== null) {
            //     // Detect pointer up with primary input action on the last pointer down object.
            //     const isPrimaryUp: boolean = (input.currentInputType === InputType.Mouse) ? input.getMouseButtonUp(0) : input.getTouchUp(0);

            //     if (isPrimaryUp) {
            //         // Let the last pointer down object know that the pointer is up.
            //         const pointerUp = this._pointerDown;
            //         this._pointerDown = null;
                    
            //         pointerUp.onPointerUp({
            //             eventType: 'pointer up',
            //             object: closestIntersection.object
            //         });
                    
            //         // Detect if pointer click occurs. Click means the an event listener received both down and up events with the the pointer over them.
            //         const isClick: boolean = pointerUp === closestListener;

            //         if (isClick) {

            //         }
            //     }
            // }

    }

    dispose(): void {
        this._listeners = new Set();
    }

    private _findEventListenerForObject(obj3d: Object3D): IPointerEventListener {
        if (obj3d) {
            const listenerValues = Array.from(this._listeners);
            for (const listener of listenerValues) {
                const pointerTargets = listener.pointerTargets;
                if (pointerTargets && pointerTargets.length > 0) {
                    const matchFound = pointerTargets.some((target) => {
                        return target === obj3d;
                    });
                    if (matchFound) {
                        return listener;
                    }
                }
            }
        }

        return null;
    }
}