import { Object3D, BasicShadowMap } from "three";
import { IDisposable } from "./IDisposable";
import { Decorator } from "./decorators/Decorator";

/**
 * GameObject is an APEngine specific implemention of Three's Object3D class that supports decorators.
 */
export class GameObject extends Object3D {

    static destroy(gameObject: GameObject): void {
        // Get array of all child gameObjects in ascending order,
        // including the given gameObject.
        let gameObjects: GameObject[] = [];
        gameObject.traverse((o) => {
            if (o instanceof GameObject) {
                gameObjects.push(o);
            }
        });
        gameObjects = gameObjects.reverse();
        
        if (gameObjects.length > 0) {
            for (let i = gameObjects.length - 1; i >= 0; i--) {
                if (gameObjects[i]._destroyed) {
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

    private _decorators: Decorator[] = [];
    private _destroyed: boolean;

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

        if (decorator.enabled) {
            throw new Error("Decorator should not be enabled just after construction.");
        }

        decorator.enabled = true;
        
        return decorator;
    }

    getDecorator<T extends Decorator>(type: { new(): T }): T  {
        for (let i = 0; i < this._decorators.length; i++) {
            const decorator = this._decorators[i];
            if (decorator instanceof type) {
                return decorator;
            }
        }

        return null;
    }

    getDecorators<T extends Decorator>(type: { new(): T }): T[]  {
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

    /**
     * Called for each three js frame.
     */
    onUpdate() {
        if (this._destroyed) {
            return;
        }

        this._decorators.forEach((c) => {
            if (!c.destroyed && c.enabled && isObjectVisible(this)) {
                c.onUpdate();
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
            if (!c.destroyed && c.enabled && isObjectVisible(this)) {
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

function isObjectVisible(obj: Object3D) {
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
