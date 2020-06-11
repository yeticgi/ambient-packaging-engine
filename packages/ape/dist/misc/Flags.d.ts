export interface IFlags {
    [key: string]: boolean;
}
/**
 * An easy to use class for handling a simple collection of flags.
 * This is easier to setup than bitwise flags and uses Typescript to stay strongly typed.
 */
export declare class Flags<T extends IFlags> {
    private _flags;
    get flagCount(): number;
    constructor(initialFlags: T);
    /**
     * Set wether or not the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    set<K extends keyof T>(enabled: boolean, ...flags: K[]): void;
    /**
     * Return the name of the flag that sits at the given index.
     */
    flagFromIndex(index: number): keyof T | undefined;
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
    some<K extends keyof T>(...flags: K[]): boolean;
    /**
     * Will return true if all of the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    every<K extends keyof T>(...flags: K[]): boolean;
    /**
     * Will return true if none of the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    not<K extends keyof T>(...flags: K[]): boolean;
    only<K extends keyof T>(...flags: K[]): boolean;
    private _internalGetFlags;
    toString(): string;
}
