/**
 * [Ryan] This decorator exists simply to provide a nice template for create a decorator from scratch.
 * It contains most of the available events that a Decorator can use.
 */

import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";

export interface IEmptyDecoratorOptions extends IDecoratorOptions {
}

export class EmptyDecorator extends Decorator {

    configure(options: IEmptyDecoratorOptions): void {
        super.configure(options);
    }

    onAttach(gameObject: GameObject): void {
        super.onAttach(gameObject);
    }

    onVisible() {
        super.onVisible();
    }

    onInvisible() {
        super.onInvisible();
    }

    onStart(): void {
        super.onStart();
    }

    onUpdate(): void {
        super.onUpdate();
    }

    onLateUpdate(): void {
        super.onLateUpdate();
    }

    onDestroy(): void {
        super.onDestroy();
    }
}