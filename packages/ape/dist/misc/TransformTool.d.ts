import { Object3D, Camera } from "three";
import { Event, ArgEvent } from "../misc/Events";
export declare namespace TransformTool {
    const onAttach: ArgEvent<Object3D>;
    const onDetach: ArgEvent<Object3D>;
    const onMouseDown: Event;
    const onMouseUp: Event;
    const onObjectChange: ArgEvent<Object3D>;
    function attach(object3d: Object3D, camera?: Camera): void;
    function detach(): void;
    function getAttachedObject(): Object3D;
    function isMouseDown(): boolean;
}
