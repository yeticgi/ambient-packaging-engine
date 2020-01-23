import { Geometry, Material, Texture, Object3D, Mesh, BufferGeometry } from "three";
import { IDisposable } from "../misc/IDisposable";

declare type Trackable = Object3D | Geometry | BufferGeometry | Material | Texture;

export interface IResourceCount {
    object3d: number;
    geometry: number;
    material: number;
    texture: number;
    unknown: number;
}

/**
 * Three Resource Tracker is a class that tracks objects that must be manually cleaned up that are created by Three JS.
 * These include geometries, materials, and textures.
 * 
 * To use this tracker, create a new instance of it and then call track() with the given resource you would like to track.
 * The tracker will then recursively search through the resource's heirarchy (if it as one) as track all geometries, materials, and textures that it finds.
 * When you are ready to dispose of the tracked resources, call the dispose() function.
 *  
 * Reference: https://threejsfundamentals.org/threejs/lessons/threejs-cleanup.html
 */
export class ThreeResourceTracker implements IDisposable {

    /**
     * Map of tracked resources indexed by the trackable's uuid.
     */
    resources: Map<string, Trackable> = new Map();

    /**
     * Debug level for ThreeResourceTracker class.
     * 0: Disabled, 1: Track/Release events, 2: Total counts
     */
    public debugLevel: number = 2;
    
    constructor() {
    }

    getResourceCounts(): IResourceCount {
        const resourceCounts: IResourceCount = {
            geometry: 0,
            material: 0,
            object3d: 0,
            texture: 0,
            unknown: 0
        }

        this.resources.forEach((resource) => {
            if (resource instanceof Object3D) {
                resourceCounts.object3d++;
            } else if (resource instanceof Material) {
                resourceCounts.material++;
            } else if (resource instanceof Geometry || resource instanceof BufferGeometry) {
                resourceCounts.geometry++;
            } else if (resource instanceof Texture) {
                resourceCounts.texture++;
            } else {
                resourceCounts.unknown++;
            }
        });

        return resourceCounts;
    }

    track(resource: any): void {
        const trackables = new Map<string, Trackable>();
        findTrackables(resource, trackables);

        if (trackables && trackables.size > 0) {
            trackables.forEach((resource, key) => {
                if (!this.resources.has(resource.uuid)) {
                    this.resources.set(resource.uuid, resource);
                    if (this.debugLevel >= 1) {
                        console.log(`[ThreeResourceTracker] track resource type: ${resource.constructor.name}, uuid: ${resource.uuid}`);
                    }
                    if (this.debugLevel >= 2) {
                        console.log(`[ThreeResourceTracker] tracked resources -> ${JSON.stringify(this.getResourceCounts())}`);
                    }
                }
            });
        }
    }

    /**
     * Release the given 
     */
    release(resource: any): void {
        const trackables = new Map<string, Trackable>();
        findTrackables(resource, trackables);

        if (trackables && trackables.size > 0) {
            trackables.forEach((resource, uuid) => {
                // Only release resources that are explicitly tracked by the tracker.
                // We dont want to cause unintended behaviour by releasing an untracked trackable resource.
                if (this.resources.has(uuid)) {
                    if (this.debugLevel >= 1) {
                        console.log(`[ThreeResourceTracker] release resource type: ${resource.constructor.name}, uuid: ${resource.uuid}`);
                    }
                    
                    if (resource instanceof Object3D) {
                        if (resource.parent) {
                            resource.parent.remove(resource);
                        }
                    }
        
                    if ('dispose' in resource) {
                        resource.dispose();
                    }
                    
                    // Remove the tracked resource from the map.
                    this.resources.delete(uuid);

                    if (this.debugLevel >= 2) {
                        console.log(`[ThreeResourceTracker] tracked resources -> ${JSON.stringify(this.getResourceCounts())}`);
                    }
                }
            });
        }
    }

    /**
     * Dispose of all tracked resources.
     */
    dispose(): void {
        this.resources.forEach((resource, uuid) => {
            this.release(resource);
            if (resource instanceof Object3D) {
                if (resource.parent) {
                    resource.parent.remove(resource);
                }
            }

            if ('dispose' in resource) {
                resource.dispose();
            }
        });

        this.resources = new Map();
    }
}

/**
 * Recursive search function that will collect all objects underneath the given resource that can be considered a Trackable.
 * Each item's key in the Map is the trackable's uuid.
 */
function findTrackables(resource: any, trackables: Map<string, Trackable>): void {
    if (!resource) {
        return;
    }

    // Handle arrays of objects, materials, and textures.
    if (Array.isArray(resource)) {
        resource.forEach(resource => findTrackables(resource, trackables));
        return;
    }

    if ('dispose' in resource || resource instanceof Object3D) {
        if (!trackables.has(resource.uuid)) {
            trackables.set(resource.uuid, resource);
        }
    }

    if (resource instanceof Object3D) {

        if (resource instanceof Mesh) {
            findTrackables(resource.geometry, trackables);
            findTrackables(resource.material, trackables);
        }

        findTrackables(resource.children, trackables);
    } else if (resource instanceof Material) {
        // We have to check if there are any textures on the material
        for (const value of Object.values(resource)) {
            if (value instanceof Texture) {
                findTrackables(value, trackables);
            }
        }
        
        // We also have to check if any uniforms reference textures or arrays of textures
        if ('uniforms' in resource) {
            const uniforms = (<any>resource).uniforms;
            for (const uniform of Object.values(uniforms)) {
                if (uniform) {
                    const uniformValue = (<any>uniform).value;
                    if (uniformValue instanceof Texture || Array.isArray(uniformValue)) {
                        findTrackables(uniformValue, trackables);
                    }
                }
            }
        }
    }
}