import { IDisposable } from "../misc/IDisposable";
import { Progress } from "./Progress";
export interface IResourceConfig {
}
/**
 * Base class of all resource objects that are loaded by ResourceManagers.
 * Resource is a generic class that returns an internally loaded object/asset.
 * Classed that derive from Resource should specifify what the object being loaded is.
 */
export declare abstract class Resource<O, K extends IResourceConfig> implements IDisposable {
    private _name;
    private _loaded;
    private _object;
    protected _loadProgress: Progress;
    get name(): string;
    get loaded(): boolean;
    get loadProgress(): Readonly<Progress>;
    get object(): O;
    constructor(name: string, config: K);
    load(): Promise<Resource<O, K>>;
    unload(): void;
    dispose(): void;
    /**
     * This function should be implemented by classed that derive from Resource
     * to return a promise that for the Resource's given object type.
     */
    protected abstract _loadObject(): Promise<O>;
    /**
     * This function should be implemented by classed that derive from Resource
     * to unload and release memory for the Resource's loaded object.
     */
    protected abstract _unloadObject(): void;
}
