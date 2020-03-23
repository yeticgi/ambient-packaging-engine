import {
    WebGLRenderer,
    WebGLRendererParameters
} from 'three';
import { Time } from './Time';
import { Input } from './input/Input';
import { GameObject } from "./gameobject/GameObject";
import { Event } from "./misc/Events";
import { XRInput } from './input/XRInput';
import { PerformanceStats } from './misc/PerformanceStats';
import { PerformanceResolutionScalar } from './misc/PerformanceResolutionScalar';
import { DeviceCamera } from './device-camera/DeviceCamera';
import { PointerEventSystem } from './input/PointerEventSystem';
import { APEngineBuildInfo } from './APEngineBuildInfo';
import { SceneManager } from './scene-management/SceneManager';

export namespace APEngine {

    export const sceneManager = new SceneManager();
    
    export let webglRenderer: WebGLRenderer;
    export let time: Time;
    export let input: Input;
    export let xrInput: XRInput;
    export let performanceStats: PerformanceStats;
    export let performanceResolutionScalar: PerformanceResolutionScalar;
    export let deviceCamera: DeviceCamera;
    export let pointerEventSystem: PointerEventSystem;

    export const onUpdate: Event = new Event();
    export const onLateUpdate: Event = new Event();
    export const onResize: Event = new Event();
    export const onXRSessionStarted: Event = new Event();
    export const onXRSessionEnded: Event = new Event();

    let _initialized: boolean = false;
    let _xrFrame: any;
    let _xrEnabled: boolean = false;
    let _maxPixelRatio: number = 0;

    export function isXREnabled() {
        return _xrEnabled;
    }

    export function getXRFrame(): any { 
        return _xrFrame;
    }

    export function init(webglParams?: WebGLRendererParameters) {
        if (_initialized) {
            return;
        }

        console.info(`== APEngine v${APEngineBuildInfo.version} ==\nDate: ${APEngineBuildInfo.date().toString()}`);

        _initialized = true;

        // Create renderer.
        webglRenderer = new WebGLRenderer(webglParams);
        webglRenderer.autoClear = false;
        // webglRenderer.autoClearColor = false;
        // webglRenderer.autoClearDepth = false;
        // webglRenderer.autoClearStencil = false;

        const width = window.innerWidth;
        const height = window.innerHeight;

        webglRenderer.setSize(width, height);
        webglRenderer.domElement.style.display = "block";
        webglRenderer.xr.enabled = false;
        
        // Create time module.
        time = new Time();

        // Create performance stats module.
        performanceStats = new PerformanceStats();

        // Create performance resolution scalar.
        performanceResolutionScalar = new PerformanceResolutionScalar(webglRenderer, {
            startEnabled: false
        });
        
        // Create input module.
        input = new Input({
            appElement: webglRenderer.domElement,
            canvasElement: webglRenderer.domElement,
            time: time,
            getUIHtmlElements: () => []
        });
        
        // Create xr input module.
        xrInput = new XRInput(webglRenderer);

        // Create pointer event system.
        pointerEventSystem = new PointerEventSystem();

        // Create device camera module.
        deviceCamera = new DeviceCamera({
            video: {
                facingMode: 'environment'
            },
            audio: false
        })

        // Setup update loop.
        webglRenderer.setAnimationLoop(update);

        resize();

        // Listen for window resize event so that we can update the webgl canvas accordingly.
        window.addEventListener('resize', resize);
    }

    function update(timestamp: any, frame: any) {
        performanceResolutionScalar.update();

        _xrFrame = frame;

        // Track state of XR presentation.
        const xrEnabled = webglRenderer.xr.isPresenting && !!_xrFrame;
        if (_xrEnabled !== xrEnabled) {
            _xrEnabled = xrEnabled;

            if (_xrEnabled) {
                onXRSessionStarted.invoke();
            } else {
                onXRSessionEnded.invoke();
            }
        }

        input.update();

        // Update pointer event system.
        pointerEventSystem.update(input, sceneManager.primaryCamera);
        
        // Update game objects in scenes.
        sceneManager.update();
        onUpdate.invoke();
        sceneManager.lateUpdate();
        onLateUpdate.invoke();

        GameObject.__APEngine_ProcessGameObjectDestroyQueue();
        
        sceneManager.render(webglRenderer);

        time.update();
        performanceStats.update();
    }

    export function getMaxPixelRatio() {
        return _maxPixelRatio;
    }

    export function setMaxPixelRatio(pixelRatio: number) {
        _maxPixelRatio = pixelRatio;
        resize();
    }

    export function dispose() {
        window.removeEventListener('resize', resize);

        sceneManager.dispose();

        webglRenderer.dispose();
        webglRenderer = null;

        time.dispose();
        time = null;

        input.dispose();
        input = null;

        xrInput.dispose();
        xrInput = null;

        deviceCamera.dispose();
        deviceCamera = null;

        performanceStats.dispose();
        performanceStats = null;

        _xrEnabled = false;
        _xrFrame = null;

        onUpdate.removeAllListeners();
        onLateUpdate.removeAllListeners();
        onXRSessionStarted.removeAllListeners();
        onXRSessionEnded.removeAllListeners();

        _initialized = false;
    }

    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        webglRenderer.setSize(width, height);

        let pixelRatio = window.devicePixelRatio;
        if ((_maxPixelRatio > 0) && (pixelRatio > _maxPixelRatio)) {
            pixelRatio = _maxPixelRatio;
        }
        
        webglRenderer.setPixelRatio(pixelRatio);
        sceneManager.resizeCameras(width, height);

        onResize.invoke();
    }
}