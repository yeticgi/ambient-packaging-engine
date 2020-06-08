export interface IFlags {
    [key: string]: boolean;
}
/**
 * An easy to use class object for handling the concept of flags.
 * This is an easier to understand alternative to using Bitwise operations and uses
 * Typescript's capabilities to stay strongly typed!
 */
export declare class Flags<T extends IFlags> {
    private _flags;
    constructor(initialFlags: T);
    /**
     * Set wether or not the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    set<K extends keyof T>(enabled: boolean, ...flags: K[]): void;
    /**
     * Toggle the enabled state of the given flags.
     * This will set flags that are true to false and flags that are false to true.
     * If no flags are given, all available flags are assumed.
     */
    toggle<K extends keyof T>(...flags: K[]): void;
    /**
     * Will return true if one of the given flags is enabled.
     * If no flags are given, all available flags are assumed.
     */
    someEnabled<K extends keyof T>(...flags: K[]): boolean;
    /**
     * Will return true if all of the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    allEnabled<K extends keyof T>(...flags: K[]): boolean;
    private _internalGetFlags;
    toString(): string;
}
