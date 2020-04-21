import { IDisposable } from "../misc/IDisposable";
export interface IResourceConfig {
}
/**
 * Base class of all resource objects that are loaded by ResourceManagers.
 * Resource is a generic class that returns an internally loaded object/asset.
 * Classed that derive from Resource should specifify what the object being loaded is.
 */
export declare abstract class Resource<K> implements IDisposable {
    private _name;
    private _loaded;
    private _object;
    get name(): string;
    get loaded(): boolean;
    get object(): K;
    constructor(name: string, config: IResourceConfig);
    load(): Promise<Resource<K>>;
    unload(): void;
    dispose(): void;
    /**
     * This function should be implemented by classed that derive from Resource
     * to return a promise that for the Resource's given object type.
     */
    protected abstract _loadObject(): Promise<K>;
    /**
     * This function should be implemented by classed that derive from Resource
     * to unload and release memory for the Resource's loaded object.
     */
    protected abstract _unloadObject(): void;
}
