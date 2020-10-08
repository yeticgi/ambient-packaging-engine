import { Object3D } from 'three';
import { ObjectPool } from './ObjectPool';
export declare class Object3DPool extends ObjectPool<Object3D> {
    private _sourceObject;
    constructor(sourceObject: Object3D, name?: string, poolEmptyWarn?: boolean);
    onRetrieved(obj: Object3D): void;
    onRestored(obj: Object3D): void;
    createPoolObject(): Object3D;
    getPoolObjectId(obj: Object3D): string;
    disposePoolObject(obj: Object3D): void;
}
