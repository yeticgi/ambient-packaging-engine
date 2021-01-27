import { Decorator, IDecoratorOptions, GameObject } from "@yeti-cgi/ape";
export declare class XRRetical extends Decorator {
    static instance: XRRetical | null;
    private _meshDecorator;
    get isVisible(): boolean;
    configure(options: IDecoratorOptions): void;
    onAttach(gameObject: GameObject): void;
    onStart(): void;
    onDestroy(): void;
    onUpdate(): void;
}
