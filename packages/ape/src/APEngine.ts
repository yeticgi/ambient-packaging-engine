import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer
} from 'three';
import { Time } from './Time';
import { Input } from './input/Input';
import { GameObject } from "./gameobject/GameObject";
import { Event } from "./misc/Events";
import { XRInput } from './input/XRInput';
import { PerformanceStats } from './misc/PerformanceStats';
import { DeviceCamera } from './misc/DeviceCamera';

export namespace APEngine {
    
    /**
     * Version number of the APEngine.
     */
    export const version: string = "__ape_version__";

    export let scene: Scene;
    export let camera: PerspectiveCamera;
    export let webglRenderer: WebGLRenderer;
    export let time: Time;
    export let input: Input;
    export let xrInput: XRInput;
    export let performanceStats: PerformanceStats;
    export let deviceCamera: DeviceCamera;

    export let onUpdate: Event = new Event();
    export let onLateUpdate: Event = new Event();
    export let onXRSessionStarted: Event = new Event();
    export let onXRSessionEnded: Event = new Event();

    let _initialized: boolean = false;
    let _xrFrame: any;
    let _xrEnabled: boolean = false;

    export function isXREnabled() {
        return _xrEnabled;
    }

    export function getXRFrame(): any { 
        return _xrFrame;
    }

    export function init(appElement: HTMLDivElement, threeCanvasParent: HTMLDivElement) {
        if (_initialized) {
            return;
        }

        console.log(`APEngine v${version} init`);

        _initialized = true;

        // Create renderer.
        webglRenderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });

        const width = window.innerWidth;
        const height = window.innerHeight;

        webglRenderer.setSize(width, height);
        webglRenderer.shadowMap.enabled = false;
        webglRenderer.domElement.style.display = "block";
        webglRenderer.xr.enabled = true;
        threeCanvasParent.appendChild(webglRenderer.domElement);
        
        // Create time module.
        time = new Time();

        // Create performance stats module.
        performanceStats = new PerformanceStats();
        
        // Create input module.
        input = new Input({
            appElement: webglRenderer.domElement,
            canvasElement: webglRenderer.domElement,
            time: time,
            getUIHtmlElements: () => []
        });
        
        // Create xr input module.
        xrInput = new XRInput(webglRenderer);

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
        
        // Update game objects.
        let gameObjects: GameObject[] = [];
        if (scene) {
            scene.traverse((go) => {
                if (go instanceof GameObject) {
                    gameObjects.push(go);
                    go.onUpdate();
                }
            });
        }
        
        onUpdate.invoke();

        if (scene) {
            gameObjects.forEach((go) => {
                go.onLateUpdate();
            });
        }

        onLateUpdate.invoke();

        GameObject.__APEngine_ProcessGameObjectDestroyQueue();
        
        if (scene && camera) {
            webglRenderer.render(scene, camera);
        }

        time.update();
        performanceStats.update();
    }

    export function dispose() {
        console.log("[APEngine] Dispose");
        window.removeEventListener('resize', resize);

        scene.dispose();
        scene = null;

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
        
        webglRenderer.setPixelRatio(window.devicePixelRatio | 1);
        webglRenderer.setSize(width, height);

        if (camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }
}