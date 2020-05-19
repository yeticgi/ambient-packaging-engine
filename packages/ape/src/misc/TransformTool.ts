import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Object3D, Camera } from "three";
import { Event, ArgEvent } from "../misc/Events";
import { APEngine } from "../APEngine";
import { findParentScene } from "../utils/ThreeUtils";
import { TransformControlsGUI } from "./TransformControlsGUI";
import { CameraDecorator } from "../gameobject/decorators/CameraDecorator";

export namespace TransformTool {
    var _controls: TransformControls;
    var _gui: TransformControlsGUI;
    var _mouseDown: boolean;

    export const onAttach: ArgEvent<Object3D> = new ArgEvent();
    export const onDetach: ArgEvent<Object3D> = new ArgEvent();
    export const onMouseDown: Event = new Event();
    export const onMouseUp: Event = new Event();
    export const onObjectChange: ArgEvent<Object3D> = new ArgEvent();

    export function attach(object3d: Object3D, cameraDecorator?: CameraDecorator): void {
        if (_controls || _gui) {
            detach();
        }

        const transformCamera = cameraDecorator ?? CameraDecorator.PrimaryCamera;
        if (!transformCamera) {
            console.error(`[TransformTool] There is no valid camera to create transfrom controls with.`);
            return;
        }
        if (!APEngine.webglRenderer.domElement) {
            console.error(`[TransformTool] There is no valid dom element to attach transfrom controls events to.`);
            return;
        }

        _controls = new TransformControls(
            transformCamera.camera,
            APEngine.webglRenderer.domElement
        );

        _controls.attach(object3d);
        _controls.setSpace('local');
        _controls.setMode('translate');

        _controls.addEventListener('change', controlsChange);
        _controls.addEventListener('mouseDown', controlsMouseDown);
        _controls.addEventListener('mouseUp', controlsMouseUp);
        _controls.addEventListener('objectChange', controlsObjectChange);

        // window.addEventListener('keydown', handleKeyDown);

        const scene = findParentScene(object3d);
        scene.add(_controls);

        _gui = new TransformControlsGUI(_controls);
        _gui.onUnselectClick.addListener(guiUnselectClick);
    }

    export function detach(): void {
        if (_gui) {
            _gui.onUnselectClick.removeListener(guiUnselectClick);
            _gui.dispose();
            _gui = null;
        }

        if (_controls) {
            _controls.removeEventListener('change', controlsChange);
            _controls.removeEventListener('mouseDown', controlsMouseDown);
            _controls.removeEventListener('mouseUp', controlsMouseUp);
            _controls.removeEventListener('objectChange', controlsObjectChange);

            // window.removeEventListener('keydown', handleKeyDown;

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

    export function isMouseDown(): boolean {
        return _mouseDown;
    }

    function guiUnselectClick(): void {
        detach();
    }
    
    function controlsChange(): void {
    }

    function controlsObjectChange(): void {
        onObjectChange.invoke(getAttachedObject());
    }

    function controlsMouseDown(): void {
        _mouseDown = true;
        onMouseDown.invoke();
    }

    function controlsMouseUp(): void {
        _mouseDown = false;
        onMouseUp.invoke();
    }
}