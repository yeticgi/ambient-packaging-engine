import { Decorator, IDecoratorOptions } from "@yeti-cgi/ape";
export declare class XRMoveToRetical extends Decorator {
    private _nonXrPosition;
    configure(options: IDecoratorOptions): void;
    onStart(): void;
    onDestroy(): void;
    onUpdate(): void;
    private _onXRStarted;
    private _onXREnded;
    private _onSelect;
    private _setMeshesVisible;
}
