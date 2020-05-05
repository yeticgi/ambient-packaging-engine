import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { IPointerEventListener, IPointerClickEvent, IPointerDownEvent, IPointerEnterEvent, IPointerExitEvent, IPointerUpEvent } from "../../input/PointerEventSystem";
import { Object3D } from "three";
export interface ITransformPickerDecoratorOptions extends IDecoratorOptions {
}
export declare class TransformPickerDecorator extends Decorator implements IPointerEventListener {
    get pointerTargets(): Object3D[];
    configure(options: ITransformPickerDecoratorOptions): void;
    onAttach(gameObject: GameObject): void;
    onVisible(): void;
    onInvisible(): void;
    onStart(): void;
    onPointerEnter(event: IPointerEnterEvent): void;
    onPointerExit(event: IPointerExitEvent): void;
    onPointerDown(event: IPointerDownEvent): void;
    onPointerUp(event: IPointerUpEvent): void;
    onPointerClick(event: IPointerClickEvent): void;
    onUpdate(): void;
    onLateUpdate(): void;
    onDestroy(): void;
}
