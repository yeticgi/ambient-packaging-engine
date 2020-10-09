import { Object3D } from 'three';
import { ObjectPool } from './ObjectPool';
export declare class Object3DPool extends ObjectPool<Object3D> {
    private _sourceObject;
    constructor(sourceObject: Object3D, name?: string, poolEmptyWarn?: boolean);
    protected onRetrieved(obj: Object3D): void;
    protected onRestored(obj: Object3D): void;
    protected createPoolObject(): Object3D;
    protected getPoolObjectId(obj: Object3D): string;
    protected disposePoolObject(obj: Object3D): void;
}
