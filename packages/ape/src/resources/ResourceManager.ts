
import { Resource, IResourceConfig } from './Resource';
import { IDisposable } from "../misc/IDisposable";
import { Progress } from './Progress';

type ConfigType<T> = T extends Resource<any, infer P> ? P : never;

/**
 * A Resource Manager is a generic class that manages any type of Resouce that it is created for.
 * Resource Managers load, track, retrieve, and dipose of any Resources assigned to it.
 */
export class ResourceManager<T extends Resource<any, IResourceConfig>> implements IDisposable {
    private _resources: Map<string, T> = new Map();
    private _activator: { new(name: string, config: IResourceConfig): T };
    private _progress = new Progress();

    constructor(resourceActivator: { new(name: string, config: any): T }) {
        this._activator = resourceActivator;
    }

    add(name: string, config: ConfigType<T>): void {
        if (!this._resources.has(name)) {
            const resource = new this._activator(name, config);
            this._resources.set(resource.name, resource);
        } else {
            console.warn(`Resource ${name} is already added. Ignoring this add call.`);
        }
    }

    unload(name: string) {
        if (this._resources.has(name)) {
            const resource = this._resources.get(name);
            resource.unload();
            this._resources.delete(name);
        }
    }

    has(name: string): boolean {
        return this._resources.has(name);
    }

    async get(name: string): Promise<T> {
        if (this._resources.has(name)) {
            const resource = this._resources.get(name);
            if (!resource.loaded) {
                await resource.load();
            }
            return resource;
        } else {
            throw new Error(`Could not get resource: ${name}`);
        }
    }

    /**
     * Returns the loading progress of specified resource.
     */
    getResourceProgress(name: string): Readonly<Progress> {
        if (this._resources.has(name)) {
            const resource = this._resources.get(name);
            return resource.progress;
        } else {
            return null;
        }
    }

    /**
     * Returns the combined loading progress of all resources that are currently in this Resource Manager.
     */
    getManagerProgress(): Readonly<Progress> {
        this._progress.set(0, 0);

        if (this._resources.size > 0) {
            for (const [resourceName, resource] of this._resources) {
                this._progress.loaded += resource.progress.loaded;
                this._progress.total += resource.progress.total;
            }
            
            return this._progress;
        } else {
            this._progress.complete();
            return this._progress;
        }
    }

    async preload(): Promise<void> {
        if (this._resources.size > 0) {
            const resources: Resource<any, any>[] = Array.from(this._resources.values());
            await Promise.all(resources.map(r => r.load()));
        }
    }

    /**
     * Returns wether all Resources that are currently in this Resource Manager are loaded or not.
     */
    allLoaded(): boolean {
        if (this._resources.size > 0) {
            const resources: Resource<any, any>[] = Array.from(this._resources.values());
            for (let resource of resources) {
                if (!resource.loaded) {
                    return false;
                }
            }
            return true;
        } else {
            return true;
        }
    }

    /**
     * Returns a map of all resource names currenty in the resource manager and wether or not they are currently loaded.
     */
    loadState(): Map<string, boolean> {
        const map = new Map<string, boolean>();

        for (const [resourceName, resource] of this._resources) {
            map.set(resourceName, resource.loaded);
        }

        return map;
    }

    dispose(): void {
        this._resources.forEach((resource) => {
            resource.dispose();
        });

        this._resources = new Map();
    }
}