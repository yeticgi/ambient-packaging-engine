import { GameObject } from "../GameObject";
import { IDisposable } from "../IDisposable";

export interface IDecoratorOptions {
}

export abstract class Decorator {

    static destroy(decorator: Decorator) {
        if (decorator._destroyed) {
            return;
        }

        // Inform decorator that it is being destroyed.
        decorator.onDestroy();
        decorator._destroyed = true;
    }

    private _configured: boolean = false;
    private _enabled: boolean = false;
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
            throw new Error(`[Decorator] ${this.constructor.name} did not have configure() called before being attached to gameObject.`);
        }

        this._gameObject = gameObject;
    }

    /**
     * Called once when the Decorator is first started.
     */
    onStart() {
        console.log(`[Decorator] ${this.constructor.name} onStart`);
        this._started = true;
    }

    /**
     * Called for each three js frame.
     */
    onUpdate() {
        // console.log(`[Decorator] ${this.constructor.name} onUpdate`);
    }

    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate() {
        // console.log(`[Decorator] ${this.constructor.name} onLateUpdate`);
    }

    /**
     * Called once when the Decorator is being destroyed.
     */
    protected onDestroy() {
        console.log(`[Decorator] ${this.constructor.name} onDestroy`);
    }
}