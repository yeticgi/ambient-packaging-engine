
import { Resource } from './Resource';
import { ArgEvent } from "../misc/Events";
import { IDisposable } from "../misc/IDisposable";

/**
 * A Resource Manager is a generic class that manages any type of Resouce that it is created for.
 * Resource Managers load, track, retrieve, and dipose of any Resources assigned to it.
 */
export class ResourceManager<T extends Resource<any>> implements IDisposable {
    private _resources: Map<string, T> = new Map();

    addResource(resource: T): void {
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