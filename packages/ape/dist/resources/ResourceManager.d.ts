import { Resource, IResourceConfig } from './Resource';
import { IDisposable } from "../misc/IDisposable";
/**
 * A Resource Manager is a generic class that manages any type of Resouce that it is created for.
 * Resource Managers load, track, retrieve, and dipose of any Resources assigned to it.
 */
export declare class ResourceManager<T extends Resource<{}>> implements IDisposable {
    private _resources;
    private _activator;
    constructor(resourceActivator: {
        new (name: string, config: unknown): T;
    });
    add(name: string, config: IResourceConfig): void;
    unload(name: string): void;
    get(name: string): Promise<T>;
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
