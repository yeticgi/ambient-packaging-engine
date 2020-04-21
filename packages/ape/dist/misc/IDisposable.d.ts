export interface IDisposable {
    /**
     * Tell the disposable to dispose of itself.
     * Be sure that the disposable object disposes of all of its managed child objects as well
     */
    dispose(): void;
}
