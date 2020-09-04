import { Object3D, Scene } from "three";
import { Decorator } from "./decorators/Decorator";
/**
 * GameObject is an APEngine specific implemention of Three's Object3D class that supports decorators.
 */
export declare class GameObject extends Object3D {
    private static __APEngine_destroyQueue;
    /**
     * Destroy the given GameObject and all of its children.
     */
    static destroy(gameObject: GameObject): void;
    /**
     * Process the GameObject destroy queue.
     * This should ONLY be called by APEngine.
     */
    static __APEngine_ProcessGameObjectDestroyQueue(): void;
    /**
     * Is the given GameObject visible to rendering?
     * This function taked into account the visibility of the gameObject's parents.
     */
    static isGameObjectVisible(gameObject: GameObject): boolean;
    /**
     * Find the GameObject that is a parent of the given object.
     * If the object is a GameObject, then the object itself is returned.
     * If the object has no GameObject parents, then null is returned.
     */
    static findParentGameObject(obj: Object3D): GameObject;
    /**
     * Find a GameObject that has the given name at or underneath the given root/scene.
     */
    static findGameObjectByName(root: Object3D | Scene, name: string): GameObject;
    private _decorators;
    private _destroyState;
    private _prevVisible;
    get destroyed(): boolean;
    constructor(name?: string);
    addDecorator<T extends Decorator>(decorator: T): T;
    getDecorator<T extends Decorator>(type: {
        new (): T;
    }): T;
    getDecorators<T extends Decorator>(type: {
        new (): T;
    }): T[];
    getDecoratorInChildren<T extends Decorator>(type: {
        new (): T;
    }, includeInvisible?: boolean): T;
    getDecoratorsInChildren<T extends Decorator>(type: {
        new (): T;
    }, includeInvisible?: boolean): T[];
    getDecoratorInParent<T extends Decorator>(type: {
        new (): T;
    }, includeInvisible?: boolean): T;
    /**
     * Called for each three js frame.
     */
    onUpdate(): void;
    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate(): void;
    /**
     * Run a visibility change check. Returns the current state of gameobject visibility.
     */
    private visibleChangeCheck;
    private onDestroy;
    private cleanupDestroyedDecorators;
}
