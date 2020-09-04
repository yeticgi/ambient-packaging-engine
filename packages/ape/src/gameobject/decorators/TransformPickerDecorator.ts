import { IDecoratorOptions, Decorator } from "./Decorator";
import { GameObject } from "../GameObject";
import { APEngine } from "../../APEngine";
import { 
    IPointerEventListener, 
    IPointerClickEvent,
    IPointerDownEvent,
    IPointerEnterEvent,
    IPointerExitEvent,
    IPointerUpEvent
} from "../../input/PointerEventSystem";
import { Object3D } from "three";
import { TransformTool } from "../../misc/TransformTool";
import { traverseSafe } from "../../utils/ThreeUtils";

export interface ITransformPickerDecoratorOptions extends IDecoratorOptions {
}

export class TransformPickerDecorator extends Decorator implements IPointerEventListener {

    get pointerTargets(): Object3D[] {
        const children: Object3D[] = [];
        traverseSafe(this.gameObject, (obj) => children.push(obj));
        return children;
    }

    configure(options: ITransformPickerDecoratorOptions): void {
        super.configure(options);
    }

    onAttach(gameObject: GameObject): void {
        super.onAttach(gameObject);
    }

    onVisible() {
        super.onVisible();

        APEngine.pointerEventSystem.addListener(this);
    }

    onInvisible() {
        super.onInvisible();

        APEngine.pointerEventSystem.removeListener(this);
    }

    onStart(): void {
        super.onStart();
    }

    onPointerEnter(event: IPointerEnterEvent): void {
    }

    onPointerExit(event: IPointerExitEvent): void {
    }

    onPointerDown(event: IPointerDownEvent): void {
    }

    onPointerUp(event: IPointerUpEvent): void {
    }

    onPointerClick(event: IPointerClickEvent): void {
        TransformTool.attach(this.gameObject);
    }

    onUpdate(): void {
        super.onUpdate();
    }

    onLateUpdate(): void {
        super.onLateUpdate();
    }

    onDestroy(): void {
        super.onDestroy();

        if (TransformTool.getAttachedObject() === this.gameObject) {
            TransformTool.detach();
        }

        APEngine.pointerEventSystem.removeListener(this);
    }
}