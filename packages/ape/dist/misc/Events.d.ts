import { IDisposable } from './IDisposable';
/**
 * Event that has no arguments.
 */
export declare class Event implements IDisposable {
    private _listeners;
    addListener(listener: EventListener): void;
    removeListener(listener: EventListener): void;
    removeAllListeners(): void;
    invoke(): void;
    dispose(): void;
}
/**
 * Signature of event listener that has no arguments.
 */
export declare type EventListener = () => void;
/**
 * Event that has no arguments and has listeners that return promises.
 */
export declare class PromiseEvent implements IDisposable {
    private _listeners;
    addListener(listener: PromiseEventListener): void;
    removeListener(listener: PromiseEventListener): void;
    removeAllListeners(): void;
    invoke(): Promise<void>;
    dispose(): void;
}
/**
 * Signature of event listener that has no arguments.
 */
export declare type PromiseEventListener = () => Promise<void>;
/**
 * Event that takes typed argument.
 */
export declare class ArgEvent<T> implements IDisposable {
    private _listeners;
    addListener(listener: ArgEventListener<T>): void;
    removeListener(listener: ArgEventListener<T>): void;
    removeAllListeners(): void;
    invoke(arg: T): void;
    dispose(): void;
}
/**
 * Signature of event listener that accepts typed argument.
 */
export declare type ArgEventListener<T> = (arg: T) => void;
/**
 * Event that takes typed argument and has listeners that return promises.
 */
export declare class PromiseArgEvent<T> implements IDisposable {
    private _listeners;
    addListener(listener: PromiseArgEventListener<T>): void;
    removeListener(listener: PromiseArgEventListener<T>): void;
    removeAllListeners(): void;
    invoke(arg: T): Promise<void>;
    dispose(): void;
}
/**
 * Signature of promise arg event listener that accepts typed argument.
 */
export declare type PromiseArgEventListener<T> = (arg: T) => Promise<void>;
/**
 * Shout is a global event dispatcher.
 * Objects can listen for and dispatch global events (referred to as shouts).
 */
export declare namespace Shout {
    function addEventListener(type: string, listener: ArgEventListener<unknown>): boolean;
    function removeEventListener(type: string, listener: ArgEventListener<unknown>): boolean;
    function dispatchEvent(type: string, arg?: unknown): void;
    function removeAllEventListeners(): void;
}
