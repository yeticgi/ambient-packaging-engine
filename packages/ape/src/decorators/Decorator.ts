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
        decorator.enabled = false;
        decorator.onDestroy();
        decorator._destroyed = true;
    }

    private _configured: boolean = false;
    private _enabled: boolean = false;
    private _destroyed: boolean = false;
    private _started: boolean = false;
    private _gameObject: GameObject = null;

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            
            if (this.enabled) {
                this.onEnable();
                if (!this._started) {
                    this._started = true;
                    this.onStart();
                }
            } else {
                this.onDisable();
            }
        }
    }

    get destroyed() { 
        return this._destroyed;
    }

    get gameObject() { 
        return this._gameObject;
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
    }

    /**
     * Called each time the Decorator is enabled.
     */
    onEnable() {
        console.log(`[Decorator] ${this.constructor.name} onEnable`);
    }

    /**
     * Called each time the Decorator is disabled.
     */
    onDisable() {
        console.log(`[Decorator] ${this.constructor.name} onDisable`);
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