import React, { Component } from "react";
import ReactDOM from 'react-dom';
import "./App.css";
import { ThreeContainer } from '@yeticgi/ape-reactcomponents';
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
    Vector3
} from 'three';
import { Rotator } from "../decorators/Rotator";
import { TestClick } from "../decorators/TestClick";
import { PauseButton } from "./PauseButton";
import { AudioManifest } from "../audio/AudioManifest";

interface IAppState {
    engineInitialized: boolean
}

/**
 * Version number of the APE WebXR QA app.
 */
const version = "__ape-webxr-qa-version__";

export class App extends Component<{}, IAppState> {

    private appDivRef: React.RefObject<HTMLDivElement>;
    private threeCanvasParentRef: React.RefObject<HTMLDivElement>;

    private cube: GameObject;

    constructor(props: any) {
        super(props);

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
        
        this.setState({
            engineInitialized: true
        });
    }

    private createTestScene() {
        // Create scene.
        APEngine.scene = new Scene();
        const scene = APEngine.scene;
        scene.background = new Color(0, 0, 0);

        // Create camera.
        const width = window.innerWidth;
        const height = window.innerHeight;

        let fov = 75;
        let aspect = width / height;
        let near = 0.1;
        let far = 1000;
        APEngine.camera = new PerspectiveCamera(fov, aspect, near, far);
        const camera = APEngine.camera;
        camera.position.z = 5;
        scene.add(camera);
        
        // Create ambient light.
        const ambient = new AmbientLight(0x222222);
        scene.add(ambient);

        // Create directional light.
        const dirLight = new DirectionalLight('#ffffff', 1.0);
        scene.add(dirLight);

        // Create test cubes.
        this.createTestCube('#ff0000', new Vector3(0, 2, 0)).name = "redCube";
        this.createTestCube('#00ff00', new Vector3(0, 0, 0)).name = "greenCube";
        this.createTestCube('#0000ff', new Vector3(0, -2, 0)).name = "blueCube";
    }

    private createTestCube(color: Color | string | number, position: Vector3): GameObject {
        // Create test cube game object.
        const cubeGeometry = new BoxGeometry(1, 1, 1);
        const cubeMaterial = new MeshStandardMaterial({
            color
        });
        const cubeMesh = new Mesh(cubeGeometry, cubeMaterial);
        this.cube = new GameObject();
        this.cube.position.copy(position);
        
        const cubeMeshDecorator = new MeshDecorator();
        cubeMeshDecorator.configure({
            mesh: cubeMesh
        });
        this.cube.addDecorator(cubeMeshDecorator);

        const cubeRotator = new Rotator();
        cubeRotator.configure({
            xSpeed: 1.0,
            ySpeed: 1.0
        });
        this.cube.addDecorator(cubeRotator);

        const cubeClick = new TestClick();
        cubeClick.configure({});
        this.cube.addDecorator(cubeClick);

        APEngine.scene.add(this.cube);

        return this.cube;
    }

    private onEngineUpdate() {
        if (APEngine.input.getKeyDown('p')) {
            APEngine.time.paused = !APEngine.time.paused;
        }
    }

    render() {

        let ui: JSX.Element | null = null;

        if (this.state.engineInitialized) {
            ui = (
                <PauseButton />
            );
        }

        return (
            <div className="app" ref={this.appDivRef} >
                <ThreeContainer canvasParentRef={this.threeCanvasParentRef}/>
                {ui}
            </div>
        );
    }
}