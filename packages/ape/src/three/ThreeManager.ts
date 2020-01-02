import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    Mesh,
    Color,
    MeshStandardMaterial,
    DirectionalLight,
    AmbientLight
} from 'three';
import { IDisposable } from '../IDisposable';
import { Time } from './Time';
import { Input } from './Input';
import { ArgEvent, ArgEventListener } from '../Events';

/**
 * ThreeManager is a container class for the core three js functionality of the apengine.
 * 
 * There are some events that the three manager dispatches that are useful:
 * - `onUpdateBeforeRender`: Dispatched before we render a three js frame.
 * - `onUpdatePostRender`: Dispatched after we render a three js frame.
 */
export class ThreeManager implements IDisposable {

    /**
     * Singleton style reference to ThreeManager.
     */
    public static instance: ThreeManager = null;

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    time: Time;
    input: Input;

    onUpdateBeforeRender: ArgEvent<ThreeManager> = new ArgEvent();
    onUpdatePostRender: ArgEvent<ThreeManager> = new ArgEvent();

    private appElement: HTMLDivElement;

    constructor(appElement: HTMLDivElement, canvasParent: HTMLDivElement) {
        ThreeManager.instance = this;

        this.appElement = appElement;

        // Create renderer.
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = false;
        this.renderer.domElement.style.display = "block";
        canvasParent.appendChild(this.renderer.domElement);

        // Create time module.
        this.time = new Time();

        // Create input module.
        this.input = new Input({
            appElement: this.renderer.domElement,
            canvasElement: this.renderer.domElement,
            time: this.time,
            getUIHtmlElements: this.getUIHtmlElement
        });
        this.input.debugLevel = 2;

        // Setup update loop.
        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize();

        // Listen for window resize event so that we can update the webgl canvas accordingly.
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
    }
    
    dispose(): void {
        if (ThreeManager.instance === this) {
            ThreeManager.instance = null;
        }

        window.removeEventListener('resize', this.resize);

        this.scene.dispose();
    }

    private resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer.setPixelRatio(window.devicePixelRatio | 1);
        this.renderer.setSize(width, height);

        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    private update(): void {
        this.time.update();
        this.input.update();

        this.onUpdateBeforeRender.invoke(this);
        
        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        this.onUpdatePostRender.invoke(this);
    }

    private getUIHtmlElement(): HTMLElement[] {
        return [];
    }
}