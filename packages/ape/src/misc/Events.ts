import { IDisposable } from './IDisposable';

// [Ryan] I would love to have multiple versions of Event and Listener that support more than one generic parameter.
// However, this is not supported by JavaScript. TypeScript's compiler complains about the class name already being declared even though
// the generic parameters are different. This is because when transpiled to JavaScript,all generic types are stripped.
// So the best way to handle this is if you need mutiple objects to store them in a custom JavaScript object / Typescript interface.

/**
 * Event that has no arguments.
 */
export class Event implements IDisposable {
    private _listeners: EventListener[] = [];

    public addListener(listener: EventListener) {
        this._listeners.push(listener);
    }

    public removeListener(listener: EventListener) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }

    public removeAllListeners() {
        this._listeners = [];
    }

    public invoke() {
        const listeners = [...this._listeners];
        listeners.forEach(l => {
            l();
        });
    }

    public dispose() {
        this.removeAllListeners();
    }
}

/**
 * Signature of event listener that has no arguments.
 */
export declare type EventListener = () => void;

/**
 * Event that has no arguments and has listeners that return promises.
 */
export class PromiseEvent implements IDisposable {
    private _listeners: PromiseEventListener[] = [];

    public addListener(listener: PromiseEventListener) {
        this._listeners.push(listener);
    }

    public removeListener(listener: PromiseEventListener) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }

    public removeAllListeners() {
        this._listeners = [];
    }

    public async invoke() {
        const promises = [...this._listeners].map(l => l());
        await Promise.all(promises);
    }

    public dispose() {
        this.removeAllListeners();
    }
}

/**
 * Signature of event listener that has no arguments.
 */
export declare type PromiseEventListener = () => Promise<void>;

/**
 * Event that takes typed argument.
 */
export class ArgEvent<T> implements IDisposable {
    private _listeners: ArgEventListener<T>[] = [];

    public addListener(listener: ArgEventListener<T>) {
        this._listeners.push(listener);
    }

    public removeListener(listener: ArgEventListener<T>) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }

    public removeAllListeners() {
        this._listeners = [];
    }

    public invoke(arg: T) {
        const listeners = [...this._listeners];
        listeners.forEach(l => {
            l(arg);
        });
    }

    public dispose() {
        this.removeAllListeners();
    }
}

/**
 * Signature of event listener that accepts typed argument.
 */
export declare type ArgEventListener<T> = (arg: T) => void;

/**
 * Event that takes typed argument and has listeners that return promises.
 */
export class PromiseArgEvent<T> implements IDisposable {
    private _listeners: PromiseArgEventListener<T>[] = [];

    public addListener(listener: PromiseArgEventListener<T>) {
        this._listeners.push(listener);
    }

    public removeListener(listener: PromiseArgEventListener<T>) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }

    public removeAllListeners() {
        this._listeners = [];
    }

    public async invoke(arg: T): Promise<void> {
        const promises = [...this._listeners].map(l => l(arg));
        await Promise.all(promises);
    }

    public dispose() {
        this.removeAllListeners();
    }
}

/**
 * Signature of promise arg event listener that accepts typed argument.
 */
export declare type PromiseArgEventListener<T> = (arg: T) => Promise<void>;

/**
 * Shout is a global event dispatcher.  
 * Objects can listen for and dispatch global events (referred to as shouts).
 */
export namespace Shout {

    let listenersMap: Map<string, ArgEventListener<unknown>[]> = new Map();

    export function addEventListener(type: string, listener: ArgEventListener<unknown>): boolean {
        let listeners: ArgEventListener<unknown>[] = listenersMap.get(type);

        if (listeners) {
            // Add listener to listeners array if it isnt already.
            let listenerExists: boolean = listeners.some((l) => l === listener);
            if (!listenerExists) {
                listeners.push(listener);
                return true;
            } else {
                // Listener already exists.
                return false;
            }
        } else {
            // Add listeners array for shout type to the Map with the new listener added.
            listeners = [];
            listeners.push(listener);
            listenersMap.set(type, listeners);
            return true;
        }
    }

    export function removeEventListener(type:string, listener: ArgEventListener<unknown>): boolean {
        let listeners: ArgEventListener<unknown>[] = listenersMap.get(type);

        if (listeners) {
            let index = listeners.findIndex((l) => l === listener);
            if (index >= 0) {
                listeners.splice(index, 1);
                return true;
            }
        }

        return false;
    }

    export function dispatchEvent(type: string, arg?: unknown) {
        let listeners: ArgEventListener<unknown>[] = listenersMap.get(type);

        if (listeners) {
            // Make a shallow copy in case dispatching alters the array.
            let listenersCopy = listeners.slice();
            listenersCopy.forEach((l) => l(arg));
        }
    }

    export function removeAllEventListeners(): void {
        listenersMap = new Map();
    }
}
