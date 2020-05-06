import { WebGLRenderer, WebGLRendererParameters } from 'three';
import { Time } from './Time';
import { Input } from './input/Input';
import { Event, ArgEvent } from "./misc/Events";
import { XRInput } from './input/XRInput';
import { PerformanceStats } from './misc/PerformanceStats';
import { PerformanceResolutionScalar } from './misc/PerformanceResolutionScalar';
import { DeviceCamera } from './device-camera/DeviceCamera';
import { PointerEventSystem } from './input/PointerEventSystem';
import { SceneManager } from './scene-management/SceneManager';
export declare namespace APEngine {
    const sceneManager: SceneManager;
    let webglRenderer: WebGLRenderer;
    let time: Time;
    let input: Input;
    let xrInput: XRInput;
    let performanceStats: PerformanceStats;
    let performanceResolutionScalar: PerformanceResolutionScalar;
    let deviceCamera: DeviceCamera;
    let pointerEventSystem: PointerEventSystem;
    const onUpdate: Event;
    const onLateUpdate: Event;
    const onResize: Event;
    const onXRSessionStarted: Event;
    const onXRSessionEnded: Event;
    const onVisibilityChanged: ArgEvent<boolean>;
    function isXREnabled(): boolean;
    function getXRFrame(): any;
    function init(webglParams?: WebGLRendererParameters): void;
    function getMaxPixelRatio(): number;
    function setMaxPixelRatio(pixelRatio: number): void;
    function dispose(): void;
}
