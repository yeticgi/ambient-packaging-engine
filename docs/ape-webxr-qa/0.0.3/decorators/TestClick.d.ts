import { Decorator, IDecoratorOptions, GameObject } from "@yeticgi/ape";
export declare class TestClick extends Decorator {
    private _down;
    configure(options: IDecoratorOptions): void;
    onAttach(gameObject: GameObject): void;
    onUpdate(): void;
    onDestroy(): void;
    private clicked;
}
