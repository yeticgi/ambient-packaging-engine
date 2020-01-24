import { Geometry, Material, Texture, Object3D, Mesh, BufferGeometry } from "three";
import { IDisposable } from "../misc/IDisposable";

declare type Trackable = Object3D | Geometry | BufferGeometry | Material | Texture;

export interface IAssetCount {
    object3d: number;
    geometry: number;
    material: number;
    texture: number;
    unknown: number;
}

export interface IAssetReference { 
    asset: Trackable,
    referenceCount: number
}

/**
 * APE Asset Tracker is a class that tracks objects that must be manually cleaned up that are created by Three JS.
 * These include geometries, materials, and textures.
 * 
 * To use this tracker, create a new instance of it and then call track() with the given asset you would like to track.
 * The tracker will then recursively search through the asset's heirarchy (if it as one) as track all geometries, materials, and textures that it finds.
 * When you are ready to dispose of the tracked assets, call the dispose() function.
 *  
 * Reference: https://threejsfundamentals.org/threejs/lessons/threejs-cleanup.html
 */
export namespace APEAssetTracker {

    /**
     * Map of tracked assets indexed by the trackable's uuid.
     */
    export let assetRefs: Map<string, IAssetReference> = new Map();

    /**
     * Debug level for asset tracker.
     * 0: Disabled, 1: Track/Release events, 2: Total counts
     */
    export let debugLevel: number = 2;

    export function getAssetCounts(): IAssetCount {
        const assetCounts: IAssetCount = {
            geometry: 0,
            material: 0,
            object3d: 0,
            texture: 0,
            unknown: 0
        }

        assetRefs.forEach((assetRef) => {
            const asset = assetRef.asset;

            if (asset instanceof Object3D) {
                assetCounts.object3d++;
            } else if (asset instanceof Material) {
                assetCounts.material++;
            } else if (asset instanceof Geometry || asset instanceof BufferGeometry) {
                assetCounts.geometry++;
            } else if (asset instanceof Texture) {
                assetCounts.texture++;
            } else {
                assetCounts.unknown++;
            }
        });

        return assetCounts;
    }

    /**
     * Track the given asset by incrementing the reference counter for it.
     */
    export function track(asset: any): void {
        const trackables = new Map<string, Trackable>();
        findTrackables(asset, trackables);

        if (trackables && trackables.size > 0) {
            trackables.forEach((asset, uuid) => {
                let assetRef: IAssetReference = assetRefs.get(uuid);

                if (assetRef) {
                    assetRef.referenceCount++;
                } else {
                    assetRef = {
                        asset: asset,
                        referenceCount: 1
                    };

                    assetRefs.set(asset.uuid, assetRef);
                }

                if (debugLevel >= 1) {
                    console.log(`[APEAssetTracker] track asset type: ${asset.constructor.name}, uuid: ${asset.uuid}, refCount: ${assetRef.referenceCount}`);
                }
                if (debugLevel >= 2) {
                    console.log(`[APEAssetTracker] tracked assets -> ${JSON.stringify(getAssetCounts())}`);
                }
            });
        }
    }

    /**
     * Untrack the given asset by decrementing the reference counter for it. If the reference counter reaches zero, the asset will be released.
     */
    export function untrack(asset: any): void {
        const trackables = new Map<string, Trackable>();
        findTrackables(asset, trackables);

        if (trackables && trackables.size > 0) {
            trackables.forEach((asset, uuid) => {
                // Only release assets that are explicitly tracked by the tracker.
                // We dont want to cause unintended behaviour by releasing an untracked trackable asset.
                const assetRef = assetRefs.get(uuid);

                if (assetRef) {
                    if (assetRef.referenceCount > 0) {
                        assetRef.referenceCount--;

                        if (debugLevel >= 1) {
                            console.log(`[APEAssetTracker] decrement reference count for asset type: ${asset.constructor.name}, uuid: ${asset.uuid}, refCount: ${assetRef.referenceCount}`);
                        }
                    }

                    if (assetRef.referenceCount <= 0) {
                        if (debugLevel >= 1) {
                            console.log(`[APEAssetTracker] release asset type: ${asset.constructor.name}, uuid: ${asset.uuid}`);
                        }
                    
                        if (asset instanceof Object3D) {
                            if (asset.parent) {
                                asset.parent.remove(asset);
                            }
                        }
            
                        if ('dispose' in asset) {
                            asset.dispose();
                        }
                        
                        // Remove the tracked asset from the map.
                        assetRefs.delete(uuid);
    
                        if (debugLevel >= 2) {
                            console.log(`[APEAssetTracker] tracked assets -> ${JSON.stringify(getAssetCounts())}`);
                        }
                    }
                }
            });
        }
    }

    /**
     * Dispose of all tracked assets.
     */
    export function dispose(): void {
        assetRefs.forEach((assetRef, uuid) => {
            const asset = assetRef.asset;

            untrack(asset);
            if (asset instanceof Object3D) {
                if (asset.parent) {
                    asset.parent.remove(asset);
                }
            }

            if ('dispose' in asset) {
                asset.dispose();
            }
        });

        assetRefs = new Map();
    }
}

/**
 * Recursive search function that will collect all objects underneath the given asset that can be considered a Trackable.
 * Each item's key in the Map is the trackable's uuid.
 */
function findTrackables(asset: any, trackables: Map<string, Trackable>): void {
    if (!asset) {
        return;
    }

    // Handle arrays of objects, materials, and textures.
    if (Array.isArray(asset)) {
        asset.forEach(resource => findTrackables(resource, trackables));
        return;
    }

    if ('dispose' in asset || asset instanceof Object3D) {
        if (!trackables.has(asset.uuid)) {
            trackables.set(asset.uuid, asset);
        }
    }

    if (asset instanceof Object3D) {

        if (asset instanceof Mesh) {
            findTrackables(asset.geometry, trackables);
            findTrackables(asset.material, trackables);
        }

        findTrackables(asset.children, trackables);
    } else if (asset instanceof Material) {
        // We have to check if there are any textures on the material
        for (const value of Object.values(asset)) {
            if (value instanceof Texture) {
                findTrackables(value, trackables);
            }
        }
        
        // We also have to check if any uniforms reference textures or arrays of textures
        if ('uniforms' in asset) {
            const uniforms = (<any>asset).uniforms;
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