/**
 * This is a generic object pool class that can be extended from to implement a pool for
 * theoretically any type of object you would want.
 */
export declare abstract class ObjectPool<T> {
    name: string;
    /**
     * Log a warning to the console when the pool empty, causing a new object to be generated during retrieve.
     */
    poolEmptyWarn: boolean;
    private _pool;
    /**
     * Simple map of objects that this pool is responsible for and has created.
     * Used mostly to check that an object being placed back in the pool actually does belong here.
     */
    private _objectIds;
    get poolSize(): number;
    constructor(name?: string, poolEmptyWarn?: boolean);
    /**
     * Initialize the pool of objects.
     * @param startSize [Optional] How starting size of the object pool (Default is 5).
     */
    initializePool(startSize?: number): this;
    /**
     * Retrieve an object from the pool.
     */
    retrieve(): T;
    /**
     * Restore the object to the pool.
     * @param obj
     */
    restore(obj: T): boolean;
    /**
     * Dispose of the pool and any objects it is holding on to.
     */
    dispose(): void;
    /**
     * Called when an object is retrieved from the pool.
     * @param obj The object that was retrieved.
     */
    protected abstract onRetrieved(obj: T): void;
    /**
     * Called when an object is restored to the pool.
     * @param obj The object that was restored.
     */
    protected abstract onRestored(obj: T): void;
    /**
     * Called to create a new object for the pool.
     */
    protected abstract createPoolObject(): T;
    /**
     * Called to retireve an unique id for the given object.
     * @param obj The object to get an id for.
     */
    protected abstract getPoolObjectId(obj: T): string;
    /**
     * Called when the object is being disposed of.
     * @param obj The object being disposed.
     */
    protected abstract disposePoolObject(obj: T): void;
}
