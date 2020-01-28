import { APEAssetTracker } from "./APEAssetTracker";
import { Object3D } from "three";
import { IDisposable } from "../misc/IDisposable";

export class Object3DPrefab implements IDisposable {
    private _prefab: Object3D;

    /**
     * The SVG Mesh prefab object.
     * It is NOT RECOMMENDED to use this in your scenes. 
     * If you want a clone of the prefab use the clone() function instead.
     */
    get prefab(): Object3D { return this._prefab; }

    constructor(obj3d: Object3D) {
        this._prefab = obj3d;
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
                const clone = childObject.clone();
                clone.name = `${clone.name} (clone)`;
                return clone;
            } else {
                throw new Error(`Could not find child object named ${childObjectName} in the prefab ${this._prefab}`);
            }
        } else {
            const clone = this._prefab.clone();
            clone.name = `${clone.name} (clone)`;
            return clone;
        }
    }

    dispose(): void {
        APEAssetTracker.untrack(this._prefab);
    }
}