import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Object3D, Camera } from "three";
import { ArgEvent } from "../misc/Events";
import { APEngine } from "../APEngine";
import { findParentScene } from "../utils/ThreeUtils";

export namespace TransformTool {
    var _controls: TransformControls;

    export const onAttach: ArgEvent<Object3D> = new ArgEvent();
    export const onDetach: ArgEvent<Object3D> = new ArgEvent();

    export function attach(object3d: Object3D, camera?: Camera): void {
        if (_controls) {
            detach();
        }

        const transformCamera = camera ?? APEngine.sceneManager.primaryCamera;
        if (!transformCamera) {
            console.error(`[TransformTool] There is no valid camera to create transfrom controls with.`);
            return;
        }
        if (!APEngine.webglRenderer.domElement) {
            console.error(`[TransformTool] There is no valid dom element to attach transfrom controls events to.`);
            return;
        }

        _controls = new TransformControls(
            transformCamera,
            APEngine.webglRenderer.domElement
        );

        _controls.attach(object3d);

        const scene = findParentScene(object3d);
        scene.add(_controls);
    }

    export function detach(): void {
        if (_controls) {
            _controls.parent.remove(_controls);
            _controls.detach();
            _controls.dispose();
            _controls = null;
        }
    }

    export function getAttachedObject(): Object3D {
        if (_controls) {
            return _controls.object;
        } else { 
            return null;
        }
    }
}