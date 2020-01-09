import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer
} from 'three';
import { Time } from './Time';
import { Input } from './Input';
import { GameObject } from "./GameObject";
import { Event } from "./Events";
import { AudioManager } from './audio/AudioManager';
import { XRInput } from './XRInput';
import { PerformanceStats } from './PerformanceStats';

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
    export let audioManager: AudioManager;
    export let performanceStats: PerformanceStats;

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

        // Create audio manager.
        audioManager = new AudioManager();

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
        scene.traverse((o) => {
            if (o instanceof GameObject) {
                gameObjects.push(o);
                o.onUpdate();
            }
        });
        
        onUpdate.invoke();

        gameObjects.forEach((o) => {
            o.onLateUpdate();
        });

        onLateUpdate.invoke();
        
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