
import { Resource, IResourceConfig } from './Resource';
import { ArgEvent } from "../misc/Events";
import { IDisposable } from "../misc/IDisposable";

/**
 * A Resource Manager is a generic class that manages any type of Resouce that it is created for.
 * Resource Managers load, track, retrieve, and dipose of any Resources assigned to it.
 */
export class ResourceManager<T extends Resource<{}>> implements IDisposable {
    private _resources: Map<string, T> = new Map();
    private _activator: { new(name: string, config: IResourceConfig): T };

    constructor(resourceActivator: { new(name: string, config: unknown): T }) {
        this._activator = resourceActivator;
    }

    async addResourcesFromManifest(manifestUrl: string) {
        try {
            const response = await fetch(manifestUrl);
            const manifest = await response.json();
            
            const keys = Object.keys(manifest);
            for (const key of keys) {
                const config: IResourceConfig = manifest[key];
                this.addResource(key, config);
            }
        } catch (error) {
            throw error;
        }
    }

    addResource(name: string, config: IResourceConfig): void {
        const resource = new this._activator(name, config);
        this._resources.set(resource.name, resource);
    }

    unloadResource(name: string) {
        if (this._resources.has(name)) {
            const resource = this._resources.get(name);
            resource.unload();
            this._resources.delete(name);
        }
    }

    async getResource(name: string): Promise<T> {
        if (this._resources.has(name)) {
            const resource = this._resources.get(name);
            if (!resource.loaded) {
                await resource.load();
            }
            return resource;
        } else {
            return null;
        }
    }

    async preloadResources(): Promise<void> {
        if (this._resources.size > 0) {
            const resources: Resource<any>[] = Array.from(this._resources.values());
            for (let resource of resources) {
                if (!resource.loaded) {
                    await resource.load();
                }
            }
        }
    }

    /**
     * Returns wether all Resources that are currently in this Resource Manager are loaded or not.
     */
    resourcesLoaded(): boolean {
        if (this._resources.size > 0) {
            const resources: Resource<any>[] = Array.from(this._resources.values());
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

    dispose(): void {
        this._resources.forEach((resource) => {
            resource.dispose();
        });

        this._resources = new Map();
    }
}