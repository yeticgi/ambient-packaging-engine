import { Resource, IResourceConfig } from './Resource';
import { IDisposable } from "../misc/IDisposable";
declare type ConfigType<T> = T extends Resource<any, infer P> ? P : never;
/**
 * A Resource Manager is a generic class that manages any type of Resouce that it is created for.
 * Resource Managers load, track, retrieve, and dipose of any Resources assigned to it.
 */
export declare class ResourceManager<T extends Resource<any, IResourceConfig>> implements IDisposable {
    private _resources;
    private _activator;
    constructor(resourceActivator: {
        new (name: string, config: any): T;
    });
    add(name: string, config: ConfigType<T>): void;
    unload(name: string): void;
    has(name: string): boolean;
    count(): number;
    get(name: string): Promise<T>;
    lookup(name: string): T;
    /**
     * Returns the combined loading progress of all resources that are currently in this Resource Manager.
     */
    getLoadProgress(): Readonly<number>;
    preload(): Promise<void>;
    /**
     * Returns wether all Resources that are currently in this Resource Manager are loaded or not.
     */
    allLoaded(): boolean;
    /**
     * Returns a map of all resource names currenty in the resource manager and wether or not they are currently loaded.
     */
    loadState(): Map<string, boolean>;
    dispose(): void;
}
export {};
