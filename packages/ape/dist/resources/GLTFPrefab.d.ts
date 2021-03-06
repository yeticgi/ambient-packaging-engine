import { Object3D, AnimationClip } from "three";
import { IDisposable } from "../misc/IDisposable";
export declare class GLTFPrefab implements IDisposable {
    private _prefab;
    private _clips;
    /**
     * The GLTF object3d prefab object.
     * It is NOT RECOMMENDED to use this in your scenes.
     * If you want a clone of the prefab use the clone() function instead.
     */
    get prefab(): Object3D;
    /**
     * The animation clips for the GLTF model.
     */
    get clips(): AnimationClip[];
    constructor(obj3d: Object3D, clips: AnimationClip[]);
    /**
     * Retrieve a clone of the Object3D.
     * This will clone all Object3Ds and Materials on the prefab.
     *
     * If optional childObjectName is given then the returned clone is only of the specified child object and its children.
     * If the given child object name is not found then an exception will be thrown.
     *
     * Returned object will have '(clone)' appened to its name.
     */
    clone(childObjectName?: string): Object3D;
    dispose(): void;
}
