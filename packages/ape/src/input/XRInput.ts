import { IDisposable } from "../misc/IDisposable";
import { 
    Group,
    WebGLRenderer,
    Vector3,
    Quaternion
} from "three";
import { ArgEvent } from '../misc/Events';

export interface ControllerPose {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

export class XRInput implements IDisposable {

    controller: Group;

    private _renderer: WebGLRenderer;

    onSelectStart = new ArgEvent<ControllerPose>();
    onSelect = new ArgEvent<ControllerPose>();
    onSelectEnd = new ArgEvent<ControllerPose>();

    constructor(renderer: WebGLRenderer) {
        this._renderer = renderer;

        this._onControllerSelectStart = this._onControllerSelectStart.bind(this);
        this._onControllerSelect = this._onControllerSelect.bind(this);
        this._onControllerSelectEnd = this._onControllerSelectEnd.bind(this);

        // Setup AR controller.
        this.controller = this._renderer.xr.getController(0);
        this.controller.addEventListener('selectstart', this._onControllerSelectStart);
        this.controller.addEventListener('select', this._onControllerSelect);
        this.controller.addEventListener('selectend', this._onControllerSelectEnd);
    }

    /**
     * Return the controller's pose at the current time.
     * This is a snapshot of the controller's pose and will not change as the controller moves.
     */
    getCurrentControllerPose(): ControllerPose {
        if (this.controller) {
            const controllerPose: ControllerPose = {
                position: new Vector3(),
                rotation: new Quaternion(),
                scale: new Vector3()
            };

            this.controller.matrixWorld.decompose(controllerPose.position, controllerPose.rotation, controllerPose.scale);
            return controllerPose;
        } else {
            return null;
        }
    }

    dispose(): void {
        if (this.controller) {
            this.controller.removeEventListener('selectstart', this._onControllerSelectStart);
            this.controller.removeEventListener('select', this._onControllerSelect);
            this.controller.removeEventListener('selectend', this._onControllerSelectEnd);
        }
    }

    private _onControllerSelectStart() {
        this.onSelectStart.invoke(this.getCurrentControllerPose());
    }

    private _onControllerSelect() {
        this.onSelect.invoke(this.getCurrentControllerPose());
    }


    private _onControllerSelectEnd() {
        this.onSelectEnd.invoke(this.getCurrentControllerPose());
    }

}