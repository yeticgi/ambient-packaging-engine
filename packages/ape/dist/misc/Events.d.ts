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
 * Shout is a global event dispatcher.
 * Objects can listen for and dispatch global events (referred to as shouts).
 */
export declare namespace Shout {
    function addEventListener(type: string, listener: ArgEventListener<unknown>): boolean;
    function removeEventListener(type: string, listener: ArgEventListener<unknown>): boolean;
    function dispatchEvent(type: string, arg?: unknown): void;
    function removeAllEventListeners(): void;
}
