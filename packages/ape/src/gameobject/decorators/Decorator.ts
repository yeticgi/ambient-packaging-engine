import { GameObject } from "../GameObject";

export interface IDecoratorOptions {
}

export abstract class Decorator {

    static destroy(decorator: Decorator) {
        if (decorator._destroyed) {
            return;
        }

        if (!decorator._willDestroy) {
            decorator.onWillDestroy();
        }

        decorator.onDestroy();
    }

    private _configured: boolean = false;
    private _willDestroy: boolean = false;
    private _destroyed: boolean = false;
    private _started: boolean = false;
    private _gameObject: GameObject = null;

    get destroyed() { 
        return this._destroyed;
    }

    get gameObject() { 
        return this._gameObject;
    }

    get started() {
        return this._started;
    }

    configure(option: IDecoratorOptions) {
        this._configured = true;
    }

    /**
     * Called once when the Decorator is attached to a gameObject.
     */
    onAttach(gameObject: GameObject) {
        if (!this._configured) {
            throw new Error(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} did not have configure() called before being attached to gameObject.`);
        }

        this._gameObject = gameObject;
    }

    /**
     * Called when the GameObject that this Decorator is attached to becomes visible.
     */
    onVisible() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onVisible`);
    }

    /**
     * Called when the GameObject that this Decorator is attached to becomes invisible.
     */
    onInvisible() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onInvisible`);
    }

    /**
     * Called once when the Decorator is first started.
     */
    onStart() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onStart`);
        this._started = true;
    }

    /**
     * Called for each three js frame.
     */
    onUpdate() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onUpdate`);
    }

    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onLateUpdate`);
    }

    /**
     * Called when the GameObject that this Decorator is attached to is marked for destruction.
     */
    onWillDestroy() {
        this._willDestroy = true;
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onWillDestroy`);
    }

    /**
     * Called once when the Decorator is being destroyed.
     */
    protected onDestroy() {
        this._destroyed = true;
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onDestroy`);
    }
}