import { Object3D, Scene } from "three";
import { Decorator } from "./decorators/Decorator";

/**
 * GameObject is an APEngine specific implemention of Three's Object3D class that supports decorators.
 */
export class GameObject extends Object3D {

    /**
     * Destroy the given GameObject and all of its children.
     */
    static destroy(gameObject: GameObject): void {
        // Get array of all child gameObjects in ascending order,
        // including the given gameObject.
        let gameObjects: GameObject[] = [];
        gameObject.traverse((o) => {
            if (o instanceof GameObject) {
                gameObjects.push(o);
            }
        });

        if (gameObjects.length > 0) {
            for (let i = gameObjects.length - 1; i >= 0; i--) {
                if (!gameObjects[i]._destroyed) {
                    // Inform the gameobject that it is being destroyed.
                    gameObjects[i].onDestroy();

                    if (gameObjects[i] === gameObject) {
                        // Remove root gameObject from its parent.
                        if (gameObject.parent) {
                            gameObject.parent.remove(gameObject);
                        }
                    }

                    gameObjects[i]._destroyed = true;
                }
            }
        }
    }

    /**
     * Is the given GameObject visible to rendering?
     * This function taked into account the visibility of the gameObject's parents.
     */
    static isGameObjectVisible(gameObject: GameObject) {
        let obj = gameObject as Object3D;

        if (!obj) {
            return false;
        }
        while (obj) {
            if (!obj.visible) {
                return false;
            }
            obj = obj.parent;
        }
        return true;
    }

    /**
     * Find the GameObject that is a parent of the given object.  
     * If the object is a GameObject, then the object itself is returned.  
     * If the object has no GameObject parents, then null is returned.
     */
    static findParentGameObject(obj: Object3D): GameObject {
        if (obj instanceof GameObject) {
            return obj;
        }
        if (obj.parent) {
            return GameObject.findParentGameObject(obj.parent);
        }
        return null;
    }

    /**
     * Find a GameObject that has the given name at or underneath the given root/scene.
     */
    static findGameObjectByName(root: Object3D | Scene, name: string): GameObject {
        if (root instanceof GameObject && root.name === name) {
            return root;
        }

        for (let child of root.children) {
            const go = GameObject.findGameObjectByName(child, name);
            if (go) {
                return go;
            }
        }

        return null;
    }

    private _decorators: Decorator[] = [];
    private _destroyed: boolean = false;
    // private _visiblityDisabledDecorators: Decorator[] = [];

    constructor() {
        super();
    }

    addDecorator<T extends Decorator>(decorator: T): T {
        if (this._decorators.some((d) => d === decorator)) {
            // Decorator is already added.
            return;
        }

        // Add decorator to the array.
        this._decorators.push(decorator);
        decorator.onAttach(this);

        return decorator;
    }

    getDecorator<T extends Decorator>(type: { new(): T }): T {
        for (let i = 0; i < this._decorators.length; i++) {
            const decorator = this._decorators[i];
            if (decorator instanceof type) {
                return decorator;
            }
        }

        return null;
    }

    getDecorators<T extends Decorator>(type: { new(): T }): T[] {
        let decorators: T[] = [];

        for (let i = 0; i < this._decorators.length; i++) {
            const decorator = this._decorators[i];
            if (decorator instanceof type) {
                decorators.push(decorator);
            }
        }

        if (decorators.length > 0) {
            return decorators;
        } else {
            return null;
        }
    }

    getDecoratorsInChildren<T extends Decorator>(type: { new(): T }, includeInvisible?: boolean): T[] {
        const decorators: T[] = [];

        if (includeInvisible) {
            this.traverseVisible((o) => {
                if (o instanceof GameObject) {
                    const decs = o.getDecorators(type);
                    if (decs) {
                        decorators.push(...decs);
                    }
                }
            });
        } else {
            this.traverse((o) => {
                if (o instanceof GameObject) {
                    const decs = o.getDecorators(type);
                    if (decs) {
                        decorators.push(...decs);
                    }
                }
            });
        }

        if (decorators.length > 0) {
            return decorators;
        } else {
            return null;
        }
    }

    /**
     * Called for each three js frame.
     */
    onUpdate() {
        if (this._destroyed) {
            return;
        }

        this._decorators.forEach((d) => {
            if (!d.destroyed && GameObject.isGameObjectVisible(this)) {
                if (!d.started) {
                    d.onStart();
                    if (!d.started) {
                        console.error(`Decorator ${d.constructor.name} does not have super.onStart() called.`);
                    }
                }
                d.onUpdate();
            }
        });

        this.cleanupDestroyedDecorators();
    }

    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate() {
        if (this._destroyed) {
            return;
        }

        this._decorators.forEach((c) => {
            if (!c.destroyed && GameObject.isGameObjectVisible(this)) {
                c.onLateUpdate();
            }
        });

        this.cleanupDestroyedDecorators();
    }

    private onDestroy() {
        // Destroy our decorators.
        this._decorators.forEach((c) => {
            Decorator.destroy(c);
        });
        this._decorators = [];

        if (this.parent) {
            // Remove ourself from parent object (and thus the scene).
            this.parent.remove(this);
        }
    }

    private cleanupDestroyedDecorators() {
        this._decorators = this._decorators.filter((c) => {
            return !c.destroyed;
        });
    }
}