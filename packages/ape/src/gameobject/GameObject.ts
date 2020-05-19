import { Object3D, Scene } from "three";
import { Decorator } from "./decorators/Decorator";


enum DestroyState {
    None = -1,
    WillDestroy = 0,
    Destroyed = 1
}

/**
 * GameObject is an APEngine specific implemention of Three's Object3D class that supports decorators.
 */
export class GameObject extends Object3D {

    private static __APEngine_destroyQueue: GameObject[] = [];

    /**
     * Destroy the given GameObject and all of its children.
     */
    static destroy(gameObject: GameObject): void {
        // Get array of all child gameObjects in ascending order,
        // including the given gameObject.
        gameObject.traverse((go) => {
            if (go instanceof GameObject) {
                if (go._destroyState === DestroyState.None) {
                    GameObject.__APEngine_destroyQueue.push(go);
                    go._destroyState = DestroyState.WillDestroy;
                }
            }
        });
    }

    /**
     * Process the GameObject destroy queue.
     * This should ONLY be called by APEngine.
     */
    static __APEngine_ProcessGameObjectDestroyQueue() {
        if (this.__APEngine_destroyQueue.length > 0) {
            // Use a copy of the destroy queue in its current state so that 
            // any modifications to the destroy queue during processing are not affected.
            const count = this.__APEngine_destroyQueue.length;

            for (let i = 0; i < count; i++) {
                const gameObject = this.__APEngine_destroyQueue.pop();
                if (gameObject && gameObject._destroyState === DestroyState.WillDestroy) {
                    // Infrom the gameobject that it is being destroyed.
                    gameObject.onDestroy();

                    gameObject._destroyState = DestroyState.Destroyed;
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
    private _destroyState: DestroyState = DestroyState.None;
    private _prevVisible: boolean = false;

    constructor(name?: string) {
        super();
        
        if (name) {
            this.name = name;
        }
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

    getDecoratorInChildren<T extends Decorator>(type: { new(): T }, includeInvisible?: boolean): T {
        // Check this gameObject for matching decorator.
        if (includeInvisible || this.visible) {
            const decorator = this.getDecorator(type);
            if (decorator) {
                return decorator;
            }
        }

        // Recursively search through child gameObjects for matching decorator.
        for (const child of this.children) {
            if (child instanceof GameObject) {
                const decorator = child.getDecoratorInChildren(type, includeInvisible);
                if (decorator) {
                    return decorator;
                }
            }
        }

        // No matching decorator found in this gameObject or its children.
        return null;
    }

    getDecoratorsInChildren<T extends Decorator>(type: { new(): T }, includeInvisible?: boolean): T[] {
        const decorators: T[] = [];

        if (!includeInvisible) {
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
        if (this._destroyState !== DestroyState.None) {
            return;
        }

        let isVisible = GameObject.isGameObjectVisible(this);

        this._decorators.forEach((d) => {
            if (!d.destroyed && isVisible) {
                if (!d.started) {
                    this._prevVisible = true;
                    d.onVisible();
                    d.onStart();
                    if (!d.started) {
                        console.error(`Decorator ${d.constructor.name} does not have super.onStart() called.`);
                    }
                } else {
                    isVisible = this.visibleChangeCheck();
                }

                if (isVisible) {
                    d.onUpdate();
                }
            }
        });

        this.cleanupDestroyedDecorators();
    }

    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate() {
        if (this._destroyState !== DestroyState.None) {
            return;
        }

        const isVisible = this.visibleChangeCheck();

        this._decorators.forEach((d) => {
            if (!d.destroyed && isVisible) {
                d.onLateUpdate();
            }
        });

        this.cleanupDestroyedDecorators();
    }

    /**
     * Run a visibility change check. Returns the current state of gameobject visibility.
     */
    private visibleChangeCheck(): boolean {
        const isVisible = GameObject.isGameObjectVisible(this);

        if (this._prevVisible !== isVisible) {
            this._decorators.forEach((d) => {
                if (!d.destroyed) {
                    if (isVisible) {
                        d.onVisible();
                    } else {
                        d.onInvisible();
                    }
                }
            });
            this._prevVisible = isVisible;
        }

        return isVisible;
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