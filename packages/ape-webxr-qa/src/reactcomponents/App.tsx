import React, { Component } from 'react';
import './App.css';
import { 
    ThreeContainer,
    ARButton
} from '@yeticgi/ape-reactcomponents';
import {
    APEngine,
    GameObject,
    MeshDecorator
} from '@yeticgi/ape';
import {
    Scene,
    PerspectiveCamera,
    BoxGeometry,
    Mesh,
    Color,
    MeshStandardMaterial,
    DirectionalLight,
    AmbientLight,
    Vector3,
    RingBufferGeometry,
    MeshBasicMaterial
} from 'three';
import { Rotator } from '../decorators/Rotator';
import { TestClick } from '../decorators/TestClick';
import { XRMoveToRetical } from '../decorators/XRMoveToRetical';
import { PauseButton } from './PauseButton';
import { AudioManifest } from '../audio/AudioManifest';
import { Version } from './Version';
import { XRRetical } from '../decorators/XRRetical';

interface IAppState {
    engineInitialized: boolean
}

export class App extends Component<{}, IAppState> {

    /**
     * Version number of the APE WebXR QA app.
     */
    static readonly version: string = '__ape-webxr-qa-version__';

    private appDivRef: React.RefObject<HTMLDivElement>;
    private threeCanvasParentRef: React.RefObject<HTMLDivElement>;

    private sceneBackgroundColor: Color = new Color(0, 0, 0);

    constructor(props: any) {
        super(props);

        console.log(`APE WebXR QA v${App.version}`);

        this.appDivRef = React.createRef<HTMLDivElement>();
        this.threeCanvasParentRef = React.createRef<HTMLDivElement>();

        this.state = {
            engineInitialized: false
        }
    }

    componentDidMount() {
        APEngine.init(
            this.appDivRef.current!,
            this.threeCanvasParentRef.current!
        );

        this.onEngineUpdate = this.onEngineUpdate.bind(this);
        APEngine.onUpdate.addListener(this.onEngineUpdate);

        // Add audio items from manifest and start preloading audio.
        AudioManifest.addAudioItems(APEngine.audioManager);
        APEngine.audioManager.startLoading();

        this.createTestScene();
        
        // Show performance stats.
        APEngine.performanceStats.enabled = true;
        APEngine.performanceStats.position = 'bottom right';

        this.setState({
            engineInitialized: true
        });
    }

    private createTestScene() {
        // Create scene.
        APEngine.scene = new Scene();
        const scene = APEngine.scene;
        scene.background = this.sceneBackgroundColor;

        // Create camera.
        const width = window.innerWidth;
        const height = window.innerHeight;

        let fov = 75;
        let aspect = width / height;
        let near = 0.1;
        let far = 1000;
        APEngine.camera = new PerspectiveCamera(fov, aspect, near, far);
        const camera = APEngine.camera;
        camera.position.y = 0.4;
        camera.position.z = 0.5;
        scene.add(camera);

        // Create ambient light.
        const ambient = new AmbientLight(0x222222);
        scene.add(ambient);

        // Create directional light.
        const dirLight = new DirectionalLight('#ffffff', 1.0);
        scene.add(dirLight);

        // Create cubes.
        const redCube = this.createTestCube('#ff0000', 0.1, new Vector3(0, 0.6, 0));
        redCube.name = 'redCube';
        const greenCube = this.createTestCube('#00ff00', 0.1, new Vector3(0, 0.4, 0));
        greenCube.name = 'greenCube';
        const blueCube = this.createTestCube('#0000ff', 0.1, new Vector3(0, 0.2, 0));
        blueCube.name = 'blueCube';

        // Create parent for cubes.
        const cubeParent = new GameObject();
        cubeParent.name = 'cubeParent';

        const xrMoveToRetical = new XRMoveToRetical();
        xrMoveToRetical.configure({});
        cubeParent.addDecorator(xrMoveToRetical);

        cubeParent.add(redCube);
        cubeParent.add(greenCube);
        cubeParent.add(blueCube);

        APEngine.scene.add(cubeParent);

        // Create xr retical.
        const retical = new GameObject();
        retical.name = 'retical';

        const xrRetical = new XRRetical();
        xrRetical.configure({});
        retical.addDecorator(xrRetical);

        const reticleMesh = new Mesh(
            new RingBufferGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
            new MeshBasicMaterial()
        );
        const reticalMeshDecorator = new MeshDecorator();
        reticalMeshDecorator.configure({
            mesh: reticleMesh
        });
        retical.addDecorator(reticalMeshDecorator);

        APEngine.scene.add(retical);
    }

    private createTestCube(color: Color | string | number, size: number, position: Vector3): GameObject {
        // Create test cube game object.
        const cubeGeometry = new BoxGeometry(size, size, size);
        const cubeMaterial = new MeshStandardMaterial({
            color
        });
        const cubeMesh = new Mesh(cubeGeometry, cubeMaterial);
        const cube = new GameObject();
        cube.position.copy(position);

        const cubeMeshDecorator = new MeshDecorator();
        cubeMeshDecorator.configure({
            mesh: cubeMesh
        });
        cube.addDecorator(cubeMeshDecorator);

        const cubeRotator = new Rotator();
        cubeRotator.configure({
            xSpeed: 1.0,
            ySpeed: 1.0
        });
        cube.addDecorator(cubeRotator);

        const cubeClick = new TestClick();
        cubeClick.configure({});
        cube.addDecorator(cubeClick);

        return cube;
    }

    private onEngineUpdate() {
        APEngine.scene.background = APEngine.isXREnabled() ? null : this.sceneBackgroundColor;
    }

    render() {
        let engineDependentComponents: JSX.Element | null = null;

        if (this.state.engineInitialized) {
            engineDependentComponents = (
                <div>
                    <Version />
                    <ARButton />
                    <PauseButton />
                </div>
            );
        }

        return (
            <div className='app' ref={this.appDivRef} >
                <ThreeContainer canvasParentRef={this.threeCanvasParentRef} />
                {engineDependentComponents}
            </div>
        );
    }
}