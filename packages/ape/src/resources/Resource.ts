import { IDisposable } from "../misc/IDisposable";
import { Progress } from "./Progress";

export interface IResourceConfig {
}

/**
 * Base class of all resource objects that are loaded by ResourceManagers.
 * Resource is a generic class that returns an internally loaded object/asset.
 * Classed that derive from Resource should specifify what the object being loaded is.
 */
export abstract class Resource<O, K extends IResourceConfig> implements IDisposable {
    private _name: string = undefined;
    private _loaded: boolean = false;
    private _object: O = null;

    protected _loadProgress = new Progress();

    get name(): string {
        return this._name;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    get loadProgress(): Readonly<Progress> {
        return this._loadProgress;
    }

    get object(): O {
        return this._object;
    }

    constructor(name: string, config: K) {
        this._name = name;
    }

    async load(): Promise<Resource<O, K>> {
        try {
            if (!this._loaded) {
                this._object = await this._loadObject();
                this._loadProgress.complete();
                this._loaded = true;
            }
            return this;
        } catch(error) {
            this._loaded = false;
            this._loadProgress.reset();
            console.error(`Could not load resource ${this.name}.`);
            console.error(error);
        }
    }

    unload(): void {
        if (this._object) {
            this._unloadObject();
        }
        this._object = null;
        this._loadProgress.reset();
    }

    dispose(): void {
        this.unload();
    }

    /**
     * This function should be implemented by classed that derive from Resource
     * to return a promise that for the Resource's given object type.
     */
    protected abstract async _loadObject(): Promise<O>;

    /**
     * This function should be implemented by classed that derive from Resource
     * to unload and release memory for the Resource's loaded object.
     */
    protected abstract _unloadObject(): void;
}
