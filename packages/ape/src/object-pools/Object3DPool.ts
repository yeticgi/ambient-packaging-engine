import { Object3D } from 'three';
import { APEAssetTracker } from '../resources/APEAssetTracker';
import { ObjectPool } from './ObjectPool';

export class Object3DPool extends ObjectPool<Object3D> {
    private _sourceObject: Object3D;

    constructor(
        sourceObject: Object3D,
        name?: string,
        poolEmptyWarn?: boolean
    ) {
        super(name, poolEmptyWarn);

        this._sourceObject = sourceObject.clone(true);
        this._sourceObject.parent = null;

        APEAssetTracker.track(this._sourceObject);
    }

    protected onRetrieved(obj: Object3D): void {
        // Do nothing.
    }

    protected onRestored(obj: Object3D): void {
        if (obj.parent) {
            // Remove from its current parent.
            obj.parent.remove(obj);
            obj.parent = null;
        }
    }

    protected createPoolObject(): Object3D {
        const obj = this._sourceObject.clone(true);
        APEAssetTracker.track(obj);

        return obj;
    }

    protected getPoolObjectId(obj: Object3D): string {
        return obj.uuid;
    }

    protected disposePoolObject(obj: Object3D): void {
        APEAssetTracker.untrack(obj);
    }
}