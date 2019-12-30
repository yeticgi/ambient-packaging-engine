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

export class ThreeManager implements IDisposable {

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;

    private cube: Mesh;

    constructor(canvasParent: HTMLDivElement) {
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
        
        // Create scene.
        this.scene = new Scene();
        this.scene.background = new Color(0, 0, 0);

        // Create camera.
        let fov = 75;
        let aspect = width / height;
        let near = 0.1;
        let far = 1000;
        this.camera = new PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.z = 5;
        this.scene.add(this.camera);

        // Create test cube geometry.
        var cubeGeometry = new BoxGeometry(1, 1, 1);
        var cubeMaterial = new MeshStandardMaterial({
            color: '#00ff00'
        });
        this.cube = new Mesh(cubeGeometry, cubeMaterial);
        this.scene.add(this.cube);
        
        // Create ambient light.
        let ambient = new AmbientLight(0x222222);
        this.scene.add(ambient);

        // Create directional light.
        let dirLight = new DirectionalLight('#ffffff', 1.0);
        this.scene.add(dirLight);

        // Setup update loop.
        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize();

        // Listen for window resize event so that we can update the webgl canvas accordingly.
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
    }
    
    dispose(): void {
        window.removeEventListener('resize', this.resize);

        this.scene.dispose();
    }

    private resize(): void {
        console.log('[ThreeManager] resize');
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer.setPixelRatio(window.devicePixelRatio | 1);
        this.renderer.setSize(width, height);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    private update(): void {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        
        this.renderer.render(this.scene, this.camera);
    }
}