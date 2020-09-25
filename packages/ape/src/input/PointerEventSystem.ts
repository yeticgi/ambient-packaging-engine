import { Object3D, Vector2, Intersection, Camera } from 'three';
import { IDisposable } from '../misc/IDisposable';
import { Input, InputType } from './Input';
import { Physics } from '../physics/Physics';
import { isObjectVisible } from '../utils/ThreeUtils';
import { CameraDecorator } from '../gameobject/decorators/CameraDecorator';
import { sortZA } from '../utils/MiscUtils';

export type PointerEventType = 'pointer enter' | 'pointer exit' | 'pointer down' | 'pointer up' | 'pointer click';

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
export class PointerEventSystem implements IDisposable {
    
    static debug: boolean = false;

    private static _activeSystems: PointerEventSystem[] = [];
    private static _focusedSystem: PointerEventSystem;

    /**
     * List of all active pointer event systems.
     */
    static get activeSystems(): Readonly<PointerEventSystem[]> {
        return this._activeSystems;
    }

    /**
     * Update all active pointer events systems.
     * This function sorts the systems based on priority (highest to lowest priority).
     */
    static updateActiveSystems(input: Input): void {
        if (!this._activeSystems || this._activeSystems.length === 0) {
            return;
        }

        if (this._activeSystems.length === 1) {
            // No need to sort, only one pointer event system is active.
            this._activeSystems[0]._update(input);
        } else {
            // If there is a focused system, update it first.
            // If the focuses system becomes no longer focuses then move on to updating
            // systems until one does.
            if (this._focusedSystem) {
                const isFocused = this._focusedSystem._update(input);
                if (!isFocused) {
                    // Focused system is no longer focused.
                    if (this.debug) {
                        console.log(`[PointerEventSystem] ${this._focusedSystem.name} has lost focus.`);
                    }

                    this._focusedSystem = null;
                } else {
                    // Focused system is still focused. Dont update other pointer event systems.
                    return; 
                }
            }

            // Sort pointer event systems in descending priority order.
            const systems = Array.from(this._activeSystems);
            sortZA(systems, 'priority');

            // Loop through and update systems until one becomes focused.
            // If we find a new focused system, release any active pointers for remaining systems.
            for (const system of systems) {
                if (!this._focusedSystem) {
                    const isFocused = system._update(input);
                    if (isFocused) {
                        // Found a system that has gained focus.
                        this._focusedSystem = system;

                        if (this.debug) {
                            console.log(`[PointerEventSystem] ${this._focusedSystem.name} has gained focus.`);
                        }
                    }
                } else {
                    // A system already gained focus, release active pointers for this system.
                    system.releaseActivePointers();
                }
            }
        }
    }

    /**
     * The camera to use for hit testing pointer event listeners.
     * If this is undefined, this pointer event system will use the primary camera (CameraDecorator.PrimaryCamera).
     */
    cameraDecorator: CameraDecorator = undefined;
    
    /**
     * The priority this pointer event system has over other pointer event systems.
     * During an update frame, pointer event systems are sorted by priority (highest to lowest) and hit testing is done
     * in that order. If a hit is detected in a pointer system above another, all lower pointer systems have their pointers released and are then ignored.
     * Lower priority pointer systems are only reached if the higher priority systems dont detect any hits.
     */
    priority: number = 0;

    private _name: string;
    private _enabled: boolean = true;
    private _listeners: Set<IPointerEventListener> = new Set();
    private _pointerDown: IPointerEventListener = null;
    private _pointerEnter: IPointerEventListener = null;

    get name(): string { return this._name }
    get pointerDown(): IPointerEventListener { return this._pointerDown }
    get pointerEnter(): IPointerEventListener { return this._pointerEnter }

    get enabled(): boolean { return this._enabled }
    set enabled(value: boolean) {
        if (this._enabled === value) {
            return;
        }

        this._enabled = value;
        if (!this._enabled) {
            this.releaseActivePointers();
        }
    }

    constructor(name: string, priority: number, cameraDecorator?: CameraDecorator) {
        this._name = name;
        this.priority = priority;
        this.cameraDecorator = cameraDecorator;

        PointerEventSystem._activeSystems.push(this);
    }

    addListener(listener: IPointerEventListener): void {
        if (!this._listeners.has(listener)) {
            this._listeners.add(listener);
        }
    }

    removeListener(listener: IPointerEventListener): void {
        if (this._pointerDown === listener) { this._pointerDown = null; }
        if (this._pointerEnter === listener) { this._pointerEnter = null; }
        this._listeners.delete(listener);
    }

    /**
     * Update event system. Returns true if the update causes the pointer event system to become focused.
     */
    private _update(input: Input): boolean {
        if (!this._enabled) {
            // Input must be enabled for the pointer event system.
            return;
        }

        let cameraDecorator = this.cameraDecorator === undefined ? CameraDecorator.PrimaryCamera : this.cameraDecorator;

        if (!input || !cameraDecorator || !cameraDecorator.camera) {
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
            // Collect all active listener target objects.
            const allActiveListenerTargets: Object3D[] = [];
            this._listeners.forEach((listener) => {
                const pointerTargets = listener.pointerTargets;
                if (pointerTargets) {
                    const activeTargets = pointerTargets.filter((target) => {
                        return isObjectVisible(target);
                    });
    
                    allActiveListenerTargets.push(...activeTargets);
                }
            });
    
            // Raycast againsts all pointer event listener target objects.
            const hits = Physics.raycastAtScreenPos(pointerScreenPos, allActiveListenerTargets, cameraDecorator.camera, false);
            closestIntersection = Physics.firstRaycastHit(hits);
            closestListener = closestIntersection ? this._findEventListenerForObject(closestIntersection.object) : null;
        } else {
            // No pointer screen position currently.
            closestIntersection = null;
            closestListener = null;
        }

        //
        // Pointer enter/exit events.
        //
        if (closestListener) {
            if (this._pointerEnter !== null && this._pointerEnter !== closestListener) {
                // Let the last pointer enter object know that the pointer has exited it.
                const pointerExit = this._pointerEnter;
                this._pointerEnter = null;

                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer exit`, pointerExit);
                }

                pointerExit.onPointerExit({
                    eventType: 'pointer exit',
                    object: closestIntersection.object,
                    pointerDown: this._pointerDown
                });
            }

            if (this._pointerEnter === null) {
                // Let the closest listener know that the pointer has entered it.
                this._pointerEnter = closestListener;

                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer enter`, this._pointerEnter);
                }

                this._pointerEnter.onPointerEnter({
                    eventType: 'pointer enter',
                    object: closestIntersection.object,
                    pointerDown: this._pointerDown
                });
            }

        } else {
            // Pointer is not over any listeners.
            if (this._pointerEnter !== null) {
                // Let the last pointer enter object know that the pointer has exited it.
                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer exit`, this._pointerEnter);
                }

                this._pointerEnter.onPointerExit({
                    eventType: 'pointer exit',
                    object: null,
                    pointerDown: this._pointerDown
                });
                this._pointerEnter = null;
            }
        }

        //
        // Pointer down/up/click events.
        //
        const isPrimaryDown: boolean = (input.currentInputType === InputType.Mouse) ? input.getMouseButtonDown(0) : input.getTouchDown(0);
        if (isPrimaryDown) {
            if (this._pointerEnter !== null && this._pointerEnter === closestListener && this._pointerDown === null) {
                // Let the closest listener know that the pointer is down on it.
                this._pointerDown = closestListener;

                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer down`, this._pointerDown);
                }

                this._pointerDown.onPointerDown({
                    eventType: 'pointer down',
                    object: closestIntersection.object,
                    pointerDown: this._pointerDown
                });
            }
        }
        
        const isPrimaryUp: boolean = (input.currentInputType === InputType.Mouse) ? input.getMouseButtonUp(0) : input.getTouchUp(0);
        if (isPrimaryUp) {
            if (this._pointerDown !== null) {
                // Let the last pointer down object know that the pointer is up.
                const pointerUp = this._pointerDown;
                this._pointerDown = null;

                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer up`, pointerUp);
                }
                
                pointerUp.onPointerUp({
                    eventType: 'pointer up',
                    object: closestIntersection ? closestIntersection.object : null,
                    pointerDown: this._pointerDown
                });

                // Detect if pointer click occurs. 
                // Click means that an event listener that received the down event is now receiving the up event while being hovered over.
                const isClick: boolean = (closestListener !== null && pointerUp === closestListener);
                if (isClick) {
                    const pointerClick = pointerUp;

                    if (PointerEventSystem.debug) {
                        console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer click`, pointerClick);
                    }

                    pointerClick.onPointerClick({
                        eventType: 'pointer click',
                        object: closestIntersection.object,
                        pointerDown: this._pointerDown
                    });
                }
            }
        }

        return !!this._pointerDown;
    }

    /**
     * Release any held pointers. If active enter/down listener, then exit/up is invoked.
     */
    releaseActivePointers(): void {
        if (this._pointerDown) {
            const pointerUp = this._pointerDown;
            this._pointerDown = null;

            if (PointerEventSystem.debug) {
                console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer up`, pointerUp);
            }
            
            pointerUp.onPointerUp({
                eventType: 'pointer up',
                object: null,
                pointerDown: this._pointerDown
            });
        }

        if (this._pointerEnter) {
            const pointerExit = this._pointerEnter;
            this._pointerEnter = null;

            if (PointerEventSystem.debug) {
                console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer exit`, pointerExit);
            }

            pointerExit.onPointerExit({
                eventType: 'pointer exit',
                object: null,
                pointerDown: this._pointerDown
            });
        }
    }

    dispose(): void {
        this.releaseActivePointers();

        this._listeners = null;
        this.cameraDecorator = null;

        const index = PointerEventSystem._activeSystems.findIndex(pes => pes === this);
        if (index >= 0) {
            PointerEventSystem._activeSystems.splice(index, 1);
        }

        if (PointerEventSystem._focusedSystem === this) {
            PointerEventSystem._focusedSystem = null;
        }
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