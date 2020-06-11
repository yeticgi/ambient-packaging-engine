import React, { Component } from 'react';
import './App.css';
import {
    ThreeContainer,
    ARButton
} from '@yeticgi/ape-reactcomponents';
import {
    APEngine,
    APEngineEvents,
    GameObject,
    MeshDecorator,
    APEResources,
    CameraDecorator,
    TapCode
} from '@yeticgi/ape';
import {
    Scene,
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
import { QRReader } from './QRReader';
import { Version } from './Version';
import { XRRetical } from '../decorators/XRRetical';
import { BuildInfo } from '../BuildInfo';

interface IAppState {
    engineInitialized: boolean,
    qrReaderOpen: boolean
}

export class App extends Component<{}, IAppState> {

    private sceneBackgroundColor: Color = new Color(0, 0, 0);

    constructor(props: any) {
        super(props);

        console.log(`APE WebXR QA v${BuildInfo.version}`);

        // Initialize APEngine.
        APEngine.init({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.onQRScanClick = this.onQRScanClick.bind(this);

        this.state = {
            engineInitialized: false,
            qrReaderOpen: false
        }
    }

    async componentDidMount() {
        
        // Add some audio resources.
        APEResources.audio.add('button', {
            url: 'public/sound/button.mp3',
            loop: false,
        });
        APEResources.audio.add('cubeTap', {
            url: 'public/sound/cube_tap.mp3',
            loop: false,
        });
        APEResources.audio.add('tapcode_entered', {
            url: 'public/sound/tapcode_entered.mp3',
            loop: false,
        });

        // Preload resources.
        await APEResources.preloadResources();

        this.createTestScene();
        
        // Show performance stats.
        APEngine.performanceStats.enabled = true;
        APEngine.performanceStats.position = 'bottom right';

        this.onEngineUpdate = this.onEngineUpdate.bind(this);
        APEngineEvents.onUpdate.addListener(this.onEngineUpdate);

        // Create a tap code that will play a sound effect when entered.
        const tapCode = new TapCode('3342', () => {
            // On tap code entered.
            APEResources.audio.get('tapcode_entered').then((resource) => resource.object.play());
        });
        tapCode.allowKeyboardEntry = true;
        tapCode.debugFlags.set(true, 'inputEvents', 'processing')

        this.setState({
            engineInitialized: true
        });
    }

    private createTestScene() {
        // Create scene.
        const scene = new Scene();
        scene.background = this.sceneBackgroundColor;

        // Add scene to the APEngine scene manager so that it and childed GameObjects 
        // gets updated by APEngine during the update loop.
        APEngine.sceneManager.addScene(scene);

        // Create camera.
        const camera = createCamera();
        camera.gameObject.position.y = 0.4;
        camera.gameObject.position.z = -0.5;
        scene.add(camera.gameObject);

        // Add a render operation to APEngine scene manager using the just created
        // scene and camera. This tells APEngine to draw the scene with the given camera
        // every update frame.
        APEngine.sceneManager.addRenderOperation(scene, camera);

        // Create ambient light.
        const ambient = new AmbientLight(0x222222);
        scene.add(ambient);

        // Create directional light.
        const dirLight = new DirectionalLight('#ffffff', 1.0);
        scene.add(dirLight);

        // Create cubes.
        const redCube = createCube('#ff0000', 0.1, new Vector3(0, 0.6, 0));
        redCube.name = 'redCube';
        const greenCube = createCube('#00ff00', 0.1, new Vector3(0, 0.4, 0));
        greenCube.name = 'greenCube';
        const blueCube = createCube('#0000ff', 0.1, new Vector3(0, 0.2, 0));
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

        scene.add(cubeParent);

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

        scene.add(retical);
    }

    private onEngineUpdate() {
        APEngine.sceneManager.primaryScene.background = APEngine.isXREnabled() ? null : this.sceneBackgroundColor;
    }

    private onQRScanClick() {
        console.log(`[App] Turning QR Reader ${this.state.qrReaderOpen ? 'off' : 'on'}.`);
        
        // Play button sound.
        APEResources.audio.get('button').then(
            resource => resource.object.play()
        );
        
        this.setState({
            qrReaderOpen: !this.state.qrReaderOpen
        });
    }

    render() {
        const QR = () => {
            if (this.state.qrReaderOpen) {
                return (
                    <QRReader 
                        onQRScanned={(code) => {
                            // Automatically close QR Reader upon successful code scan.
                            this.setState({
                                qrReaderOpen: false
                            });

                            alert(`Scanned QR code: ${code}`);
                        }}
                        onCloseClick={() => {
                            // Play button sound.
                            APEResources.audio.get('button').then(
                                resource => resource.object.play()
                            );

                            this.setState({
                                qrReaderOpen: false
                            });
                        }}
                        onError={(error) => {
                            // Automatically close QR Reader upon error.
                            this.setState({
                                qrReaderOpen: false
                            });

                            // Show alert dialog with error message to give user an explanation.
                            alert(`Could not start QR scanner.\n\nError: ${error ?? 'Unknown reason.'}`); 
                        }}
                    /> 
                );
            } else {
                return null;
            }
        };

        return (
            <div className='app'>
                <ThreeContainer webglCanvas={APEngine.webglRenderer.domElement}/>
                <div>
                    <Version />
                    <div id="hud-ul-grp">
                        <PauseButton />
                        <button className='appButton' onClick={this.onQRScanClick}>QR Scan</button>
                    </div>
                    <ARButton />
                    <QR />
                </div>
            </div>
        );
    }
}

function createCamera(): CameraDecorator {
    const cameraGO = new GameObject('Camera');
    const cameraDecorator = new CameraDecorator();
    cameraDecorator.configure({
        cameraType: 'perspective',
        fov: 75,
        near: 0.1,
        far: 1000
    });
    cameraGO.addDecorator(cameraDecorator);

    return cameraDecorator;
}

function createCube(color: Color | string | number, size: number, position: Vector3): GameObject {
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