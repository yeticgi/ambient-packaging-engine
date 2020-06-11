export interface IFlags {
    [key: string]: boolean;
}

/**
 * An easy to use class for handling a simple collection of flags.
 * This is easier to setup than bitwise flags and uses Typescript to stay strongly typed.
 */
export class Flags<T extends IFlags> {
    private _flags: T;

    get flagCount(): number {
        return Object.keys(this._flags).length;
    }

    constructor(initialFlags: T) {
        this._flags = Object.create(initialFlags);
        this._flags = Object.assign(this._flags, initialFlags);
    }

    /**
     * Set wether or not the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    set<K extends keyof T>(enabled: boolean, ...flags: K[]): void {
        flags = this._internalGetFlags(flags);

        for (const flag of flags) {
            this._flags[flag] = enabled as T[K];
        }
    }

    /**
     * Return the name of the flag that sits at the given index.
     */
    flagFromIndex(index: number): keyof T | undefined { 
        const keys = Object.keys(this._flags);
        if (index >= 0 && index < keys.length) {
            return keys[index];
        }
        
        console.error(`[Flags] Index ${index} is out of range (0 -> ${keys.length - 1})`);
        return undefined;
    }

    /**
     * Toggle the enabled state of the given flags. 
     * This will set flags that are true to false and flags that are false to true.
     * If no flags are given, all available flags are assumed.
     */
    toggle<K extends keyof T>(...flags: K[]): void {
        flags = this._internalGetFlags(flags);

        for (const flag of flags) {
            this._flags[flag] = !this._flags[flag] as T[K];
        }
    }

    /**
     * Will return true if one of the given flags is enabled.
     * If no flags are given, all available flags are assumed.
     */
    some<K extends keyof T>(...flags: K[]): boolean {
        flags = this._internalGetFlags(flags);
        
        for (const flag of flags) {
            if (this._flags[flag]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Will return true if all of the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    every<K extends keyof T>(...flags: K[]): boolean {
        flags = this._internalGetFlags(flags);

        for (const flag of flags) {
            if (!this._flags[flag]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Will return true if none of the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    not<K extends keyof T>(...flags: K[]): boolean {
        flags = this._internalGetFlags(flags);

        for (const flag of flags) {
            if (this._flags[flag]) {
                return false;
            }
        }

        return true;
    }

    only<K extends keyof T>(...flags: K[]): boolean {
        flags = this._internalGetFlags(flags);
        const remainingFlags = new Set<keyof T>(Object.keys(this._flags));

        // Check to make sure that the given flags are all enabled.
        for (const flag of flags) {
            if (this._flags[flag]) {
                remainingFlags.delete(flag);
            } else {
                // One of the given flags is not enabled.
                return false;
            }
        }

        // Now make sure all of the remaining flags are set to false.
        for (const flag of remainingFlags) {
            if (this._flags[flag]) {
                // One of the remaining flags is enabled.
                return false;
            }
        }

        // Only the given flags are enabled.
        return true;
    }

    private _internalGetFlags<K extends keyof T>(flags: K[]): K[] {
        if (!flags || flags.length === 0) { 
            // No flags were given, return all flags.
            flags = Object.keys(this._flags) as K[];
        }

        return flags;
    }

    toString(): string {
        return JSON.stringify(this._flags);
    }
}