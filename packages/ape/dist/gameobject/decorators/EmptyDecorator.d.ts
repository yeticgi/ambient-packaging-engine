/**
 * [Ryan] This decorator exists simply to provide a nice template for create a decorator from scratch.
 * It contains most of the available events that a Decorator can use.
 */
import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
export interface IEmptyDecoratorOptions extends IDecoratorOptions {
}
export declare class EmptyDecorator extends Decorator {
    configure(options: IEmptyDecoratorOptions): void;
    onAttach(gameObject: GameObject): void;
    onVisible(): void;
    onInvisible(): void;
    onStart(): void;
    onUpdate(): void;
    onLateUpdate(): void;
    onWillDestroy(): void;
    onDestroy(): void;
}
