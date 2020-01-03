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

export namespace APEngine {
    
    export let scene: Scene;
    export let camera: PerspectiveCamera;
    export let webglRenderer: WebGLRenderer;
    export let time: Time;
    export let input: Input;
    export let audioManager: AudioManager;

    export let onUpdate: Event = new Event();
    export let onLateUpdate: Event = new Event();

    let initialized: boolean;

    export function init(appElement: HTMLDivElement, threeCanvasParent: HTMLDivElement) {
        if (initialized) {
            return;
        }

        console.log(`[APEngine] init`);

        initialized = true;

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
        threeCanvasParent.appendChild(webglRenderer.domElement);
        
        // Create time module.
        time = new Time();

        // Create input module.
        input = new Input({
            appElement: webglRenderer.domElement,
            canvasElement: webglRenderer.domElement,
            time: time,
            getUIHtmlElements: () => []
        });
        input.debugLevel = 1;

        // Create audio manager.
        audioManager = new AudioManager();

        // Setup update loop.
        webglRenderer.setAnimationLoop(update);

        resize();

        // Listen for window resize event so that we can update the webgl canvas accordingly.
        window.addEventListener('resize', resize);
    }

    function update() {
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