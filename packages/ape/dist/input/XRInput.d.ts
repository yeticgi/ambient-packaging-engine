import { IDisposable } from "../misc/IDisposable";
import { Group, WebGLRenderer, Vector3, Quaternion } from "three";
import { ArgEvent } from '../misc/Events';
export interface ControllerPose {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}
export declare class XRInput implements IDisposable {
    controller: Group;
    private _renderer;
    onSelectStart: ArgEvent<ControllerPose>;
    onSelect: ArgEvent<ControllerPose>;
    onSelectEnd: ArgEvent<ControllerPose>;
    constructor(renderer: WebGLRenderer);
    /**
     * Return the controller's pose at the current time.
     * This is a snapshot of the controller's pose and will not change as the controller moves.
     */
    getCurrentControllerPose(): ControllerPose;
    dispose(): void;
    private _onControllerSelectStart;
    private _onControllerSelect;
    private _onControllerSelectEnd;
}
