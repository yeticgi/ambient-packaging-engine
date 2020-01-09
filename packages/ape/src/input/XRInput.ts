import { IDisposable } from "../util/IDisposable";
import { 
    Group,
    Scene,
    WebGLRenderer
} from "three";
import { Event } from '../util/Events';

export class XRInput implements IDisposable {

    private _renderer: WebGLRenderer;
    private _controller: Group;

    /**
     * Should gaze raycasting be enabled.
     */
    gazeEnabled: boolean = false;

    onSelect: Event = new Event();

    constructor(renderer: WebGLRenderer) {
        this._renderer = renderer;

        this._onControllerSelect = this._onControllerSelect.bind(this);

        // Setup AR controller.
        this._controller = this._renderer.xr.getController(0);
        this._controller.addEventListener('select', this._onControllerSelect);
        // this._scene.add(this._controller);
    }

    dispose(): void {
        if (this._controller) {
            // this._controller.parent.remove(this._controller);
            this._controller.removeEventListener('select', this._onControllerSelect);
        }
    }

    private _onControllerSelect() {
        this.onSelect.invoke();
    }

}