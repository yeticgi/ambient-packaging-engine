import React, { Component } from "react";
import ReactDOM from 'react-dom';
import "./App.css";
import { ThreeContainer } from '@yeticgi/ape-reactcomponents';
import { APEngine } from '@yeticgi/ape';
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
import { ThreeManager } from "@yeticgi/ape/dist/three/ThreeManager";

export class App extends Component {

    public apengine: APEngine;

    private appDivRef: React.RefObject<HTMLDivElement>;
    private threeCanvasParentRef: React.RefObject<HTMLDivElement>;
    private cube: Mesh;

    constructor(props: any) {
        super(props);

        this.appDivRef = React.createRef<HTMLDivElement>();
        this.threeCanvasParentRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        this.apengine = new APEngine(
            this.appDivRef.current!,
            this.threeCanvasParentRef.current!
        );

        // Listen to some events from APEngine.
        this.onUpdateBeforeRenderThree = this.onUpdateBeforeRenderThree.bind(this);
        this.onUpdatePostRenderThree = this.onUpdatePostRenderThree.bind(this);

        this.apengine.threeManager.onUpdateBeforeRender.addListener(this.onUpdateBeforeRenderThree);
        this.apengine.threeManager.onUpdatePostRender.addListener(this.onUpdatePostRenderThree);

        this.createTestScene();
    }

    private createTestScene() {
        // Create scene.
        this.apengine.threeManager.scene = new Scene();
        const scene = this.apengine.threeManager.scene;
        scene.background = new Color(0, 0, 0);

        // Create camera.
        const width = window.innerWidth;
        const height = window.innerHeight;

        let fov = 75;
        let aspect = width / height;
        let near = 0.1;
        let far = 1000;
        this.apengine.threeManager.camera = new PerspectiveCamera(fov, aspect, near, far);
        const camera = this.apengine.threeManager.camera;
        camera.position.z = 5;
        scene.add(camera);

        // Create test cube geometry.
        var cubeGeometry = new BoxGeometry(1, 1, 1);
        var cubeMaterial = new MeshStandardMaterial({
            color: '#00ff00'
        });
        this.cube = new Mesh(cubeGeometry, cubeMaterial);
        scene.add(this.cube);
        
        // Create ambient light.
        let ambient = new AmbientLight(0x222222);
        scene.add(ambient);

        // Create directional light.
        let dirLight = new DirectionalLight('#ffffff', 1.0);
        scene.add(dirLight);
    }

    private onUpdateBeforeRenderThree(threeManager: ThreeManager) {
        this.cube.rotation.x += (1 * threeManager.time.deltaTime);
        this.cube.rotation.y += (1 * threeManager.time.deltaTime);
    }

    private onUpdatePostRenderThree(threeManager: ThreeManager) {

    }

    render() {
        return (
            <div className="app" ref={this.appDivRef} >
                <ThreeContainer canvasParentRef={this.threeCanvasParentRef}/>
            </div>
        );
    }
}