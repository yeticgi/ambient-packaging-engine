import { Material, Texture, Object3D, BufferGeometry, TextureDataType, Skeleton } from "three";
declare type Trackable = Object3D | BufferGeometry | Material | Texture | Skeleton;
export interface IAssetCount {
    object3d: number;
    geometry: number;
    material: number;
    texture: number;
    skeleton: number;
    unknown: number;
}
export interface IAssetReference {
    asset: Trackable;
    referenceCount: number;
}
export interface IAssetSnapshot {
    uuid: string;
    name: string;
    type: string | TextureDataType;
    referenceCount: number;
}
export interface ISnapshot {
    assetSnapshots: IAssetSnapshot[];
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
export declare namespace APEAssetTracker {
    /**
     * Map of tracked assets indexed by the trackable's uuid.
     */
    let assetRefs: Map<string, IAssetReference>;
    /**
     * Debug level for asset tracker.
     * 0: Disabled, 1: Track/Release events, 2: Total counts
     */
    let debugLevel: number;
    let snapshots: ISnapshot[];
    function getAssetCounts(): IAssetCount;
    /**
     * Take a snapshot of the current state of asset references.
     * This is useful for comparing snapshots during debugging to figure out which assets are not
     * being untracked and cleaned up properly.
     */
    function takeSnapshot(): ISnapshot;
    function clearSnapshots(): void;
    function diffOfLastTwoSnapshots(): IAssetSnapshot[];
    function diffOfSnapshots(snapshotA: ISnapshot, snapshotB: ISnapshot): IAssetSnapshot[];
    function intersectOfLastTwoSnapshots(): IAssetSnapshot[];
    function intersectOfSnapshots(snapshotA: ISnapshot, snapshotB: ISnapshot): IAssetSnapshot[];
    /**
     * Track the given asset by incrementing the reference counter for it.
     */
    function track(asset: any): void;
    /**
     * Untrack the given asset by decrementing the reference counter for it. If the reference counter reaches zero, the asset will be released.
     */
    function untrack(asset: any): void;
    /**
     * Dispose of all tracked assets.
     */
    function dispose(): void;
}
export {};
