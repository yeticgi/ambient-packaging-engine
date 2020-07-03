import {
    WebGLRenderer,
    WebGLRendererParameters
} from 'three';
import { Time } from './Time';
import { Input } from './input/Input';
import { GameObject } from "./gameobject/GameObject";
import { XRInput } from './input/XRInput';
import { PerformanceStats } from './misc/PerformanceStats';
import { PerformanceResolutionScalar } from './misc/PerformanceResolutionScalar';
import { DeviceCamera } from './device-camera/DeviceCamera';
import { PointerEventSystem } from './input/PointerEventSystem';
import { APEngineBuildInfo } from './APEngineBuildInfo';
import { SceneManager } from './scene-management/SceneManager';
import { CameraDecorator } from './gameobject/decorators/CameraDecorator';
import { XRPhysics } from './physics/XRPhysics';
import { APEngineEvents } from './APEngineEvents';

export namespace APEngine {

    export const sceneManager = new SceneManager();
    
    export let webglRenderer: WebGLRenderer;
    export let time: Time;
    export let input: Input;
    export let xrInput: XRInput;
    export let xrPhysics: XRPhysics;
    export let performanceStats: PerformanceStats;
    export let performanceResolutionScalar: PerformanceResolutionScalar;
    export let deviceCamera: DeviceCamera;
    export let pointerEventSystem: PointerEventSystem;

    let _initialized: boolean = false;
    let _xrFrame: any;
    let _xrEnabled: boolean = false;
    let _maxPixelRatio: number = 0;
    let _audioMutedCount: number = 0;

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

        const width = window.innerWidth;
        const height = window.innerHeight;

        webglRenderer.setSize(width, height);
        webglRenderer.domElement.style.display = "block";
        
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
            inputElement: webglRenderer.domElement,
            canvasElement: webglRenderer.domElement,
            time: time,
            getUIHtmlElements: () => []
        });
        
        // Create xr input module.
        xrInput = new XRInput(webglRenderer);

        // Create xr physics module.
        xrPhysics = new XRPhysics(webglRenderer, APEngineEvents.onXRSessionStarted, APEngineEvents.onXRSessionEnded, getXRFrame);

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

        // Listen for page visibility change event so we can disable sounds, etc
        document.addEventListener('visibilitychange', visibilityChange);
    }

    function update(timestamp: any, frame: any) {
        performanceResolutionScalar.update();

        _xrFrame = frame;

        // Track state of XR presentation.
        const xrEnabled = webglRenderer.xr.isPresenting && !!_xrFrame;
        if (_xrEnabled !== xrEnabled) {
            _xrEnabled = xrEnabled;

            if (_xrEnabled) {
                webglRenderer.xr.enabled = true;
                APEngineEvents.onXRSessionStarted.invoke();
            } else {
                webglRenderer.xr.enabled = false;
                APEngineEvents.onXRSessionEnded.invoke();
            }
        }

        input.update();

        // Update pointer event system.
        pointerEventSystem.update(input, CameraDecorator.PrimaryCamera);
        
        // Update game objects in scenes.
        sceneManager.update();
        APEngineEvents.onUpdate.invoke();
        sceneManager.lateUpdate();
        APEngineEvents.onLateUpdate.invoke();

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

        xrPhysics.dispose();
        xrPhysics = null;

        deviceCamera.dispose();
        deviceCamera = null;

        performanceStats.dispose();
        performanceStats = null;

        _xrEnabled = false;
        _xrFrame = null;

        APEngineEvents.onUpdate.removeAllListeners();
        APEngineEvents.onLateUpdate.removeAllListeners();
        APEngineEvents.onXRSessionStarted.removeAllListeners();
        APEngineEvents.onXRSessionEnded.removeAllListeners();

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
        CameraDecorator.Cameras.forEach(camera => camera.resize());

        APEngineEvents.onResize.invoke();
    }

    function visibilityChange() {
        setAudioMuted(document.hidden);

        APEngineEvents.onVisibilityChanged.invoke(document.hidden);
    }

    export function setAudioMuted(muted:boolean) {
        if (muted) {
            _audioMutedCount++;
            if (_audioMutedCount > 0) {
                Howler.mute(true);
            }
        } else {
            _audioMutedCount--;
            if (_audioMutedCount <= 0) {
                _audioMutedCount = 0;
                Howler.mute(false);
            }
        }
    }

}