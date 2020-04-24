import { APEAssetTracker } from "./APEAssetTracker";
import { Object3D, AnimationClip } from "three";
import { IDisposable } from "../misc/IDisposable";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

export class GLTFPrefab implements IDisposable {
    private _prefab: Object3D;
    private _clips: AnimationClip[];

    /**
     * The GLTF object3d prefab object.
     * It is NOT RECOMMENDED to use this in your scenes. 
     * If you want a clone of the prefab use the clone() function instead.
     */
    get prefab(): Object3D { return this._prefab; }

    /**
     * The animation clips for the GLTF model.
     */
    get clips(): AnimationClip[] { return this._clips; }

    constructor(obj3d: Object3D, clips: AnimationClip[]) {
        this._prefab = obj3d;
        this._clips = clips;
        APEAssetTracker.track(this._prefab);
    }

    /**
     * Retrieve a clone of the Object3D.
     * This will clone all Object3Ds and Materials on the prefab.
     * 
     * If optional childObjectName is given then the returned clone is only of the specified child object and its children.
     * If the given child object name is not found then an exception will be thrown.
     * 
     * Returned object will have '(clone)' appened to its name.
     */
    clone(childObjectName?: string): Object3D {
        if (childObjectName) {
            const childObject = this.prefab.getObjectByName(childObjectName);
            if (childObject) {
                // const clone = childObject.clone();
                const clone = SkeletonUtils.clone(childObject) as Object3D;
                clone.name = `${clone.name} (clone)`;
                return clone;
            } else {
                throw new Error(`Could not find child object named ${childObjectName} in the prefab ${this._prefab}`);
            }
        } else {
            // const clone = this._prefab.clone();
            const clone = SkeletonUtils.clone(this._prefab) as Object3D;
            clone.name = `${clone.name} (clone)`;
            return clone;
        }
    }

    dispose(): void {
        APEAssetTracker.untrack(this._prefab);
    }
}