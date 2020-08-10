import { GameObject } from "../GameObject";
export interface IDecoratorOptions {
}
export declare abstract class Decorator {
    static destroy(decorator: Decorator): void;
    private _configured;
    private _willDestroy;
    private _destroyed;
    private _started;
    private _gameObject;
    get destroyed(): boolean;
    get gameObject(): GameObject;
    get started(): boolean;
    configure(option: IDecoratorOptions): void;
    /**
     * Called once when the Decorator is attached to a gameObject.
     */
    onAttach(gameObject: GameObject): void;
    /**
     * Called when the GameObject that this Decorator is attached to becomes visible.
     */
    onVisible(): void;
    /**
     * Called when the GameObject that this Decorator is attached to becomes invisible.
     */
    onInvisible(): void;
    /**
     * Called once when the Decorator is first started.
     */
    onStart(): void;
    /**
     * Called for each three js frame.
     */
    onUpdate(): void;
    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate(): void;
    /**
     * Called when the GameObject that this Decorator is attached to is marked for destruction.
     */
    onWillDestroy(): void;
    /**
     * Called once when the Decorator is being destroyed.
     */
    protected onDestroy(): void;
}
