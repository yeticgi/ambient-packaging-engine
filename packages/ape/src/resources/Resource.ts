import { ArgEvent } from "../misc/Events";
import { IDisposable } from "../misc/IDisposable";

export interface IResourceConfig {
}

/**
 * Base class of all resource objects that are loaded by ResourceManagers.
 * Resource is a generic class that returns an internally loaded object/asset.
 * Classed that derive from Resource should specifify what the object being loaded is.
 */
export abstract class Resource<K> implements IDisposable {
    private _name: string = undefined;
    private _loaded: boolean = false;
    private _object: K = null;

    get name(): string {
        return this._name;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    get object(): K {
        return this._object;
    }

    constructor(name: string, config: IResourceConfig) {
        this._name = name;
    }

    async load(): Promise<Resource<K>> {
        try {
            if (!this._loaded) {
                this._object = await this._loadObject();
                this._loaded = true;
            }
            return this;
        } catch(error) {
            this._loaded = false;
            throw `Could not load resource ${this.name}. error: ${error}`;
        }
    }

    unload(): void {
        if (this._object) {
            this._unloadObject();
        }
        this._object = null;
    }

    dispose(): void {
        this.unload();
    }

    /**
     * This function should be implemented by classed that derive from Resource
     * to return a promise that for the Resource's given object type.
     */
    protected abstract async _loadObject(): Promise<K>;

    /**
     * This function should be implemented by classed that derive from Resource
     * to unload and release memory for the Resource's loaded object.
     */
    protected abstract _unloadObject(): void;
}
