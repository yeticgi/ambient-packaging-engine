import { IDisposable } from "../misc/IDisposable";
import { Scene, Camera, WebGLRenderer, PerspectiveCamera } from "three";
import { SceneRenderOperation as RenderOperation } from "./SceneRenderOperation";
import { GameObject } from "../gameobject/GameObject";

export class SceneManager implements IDisposable {

    private _scenes: Scene[] = [];
    private _cameras: Camera[] = [];
    private _primaryCamera: Camera = null;
    private _primaryScene: Scene = null;
    private _renderList: RenderOperation[] = [];
    
    /**
     * Scenes that are updated by APEngine. 
     * GameObjects that are parented to scenes in this list will get their lifecycle functions invoked.
     */
    get scenes(): Readonly<Scene[]> {
        return this._scenes;
    }

    /**
     * Cameras that are updated by APEngine.
     * These camera will automatically get resized when APEngine window resize is triggered.
     */
    get cameras(): Readonly<Camera[]> {
        return this._cameras;
    }

    /**
     * The camera that is marked as primary.
     * If no camera is marked as primary, than the first camera is returned.
     */
    get primaryCamera(): Camera {
        if (this._primaryCamera) {
            return this._primaryCamera;
        } else if (this._cameras.length > 0) {
            return this._cameras[0];
        } else {
            return null;
        }
    }

    set primaryCamera(cam: Camera) {
        if (this._primaryCamera !== cam) {
            this._primaryCamera = cam;
        }
    }

    get sceneRenderList(): Readonly<RenderOperation[]> {
        return this._renderList;
    }

    /**
     * The scene that is marked as primary.
     * If no scene is marked as primary, than the first scene is returned.
     */
    get primaryScene(): Scene {
        if (this._primaryScene) {
            return this._primaryScene;
        } else if (this._scenes.length > 0) {
            return this._scenes[0];
        } else {
            return null;
        }
    }

    set primaryScene(scene: Scene) {
        if (this._primaryScene !== scene) {
            this._primaryScene = scene;
        }
    }
    
    constructor() {
    }

    addScene(scene: Scene): void {
        if (!this._scenes.some(s => s === scene)) {
            this._scenes.push(scene);
        }
    }

    removeScene(scene: Scene): void {
        const index = this._scenes.findIndex(s => s === scene);
        if (index >= 0) {
            this._scenes.splice(index, 1);
        }

        this.removeRenderOperationsUsingScene(scene);
    }

    addCamera(camera: Camera): void {
        if (!this._cameras.some(c => c === camera)) {
            this._cameras.push(camera);
        }
    }

    removeCamera(camera: Camera): void {
        const index = this._cameras.findIndex(c => c === camera);
        if (index >= 0) {
            this._cameras.splice(index, 1);
        }

        this.removeRenderOperationsUsingCamera(camera);
    }

    addRenderOperation(scene: Scene, camera: Camera): RenderOperation {
        const renderOp = new RenderOperation(scene, camera);
        this._renderList.push(renderOp);
        return renderOp;
    }

    reorderRenderOperation(renderOp: RenderOperation, renderOrder: number) {
        if (this._renderList.some(op => op === renderOp)) {
            this._renderList.splice(renderOrder, 0, renderOp);
        }
    }

    removeRenderOperation(scene: Scene, camera: Camera): void {
        const index = this._renderList.findIndex(op => op.scene === scene && op.camera === camera);
        if (index >= 0) {
            this._renderList.splice(index, 1);
        }
    }

    removeRenderOperationsUsingScene(scene: Scene): void {
        this._renderList = this._renderList.filter((op) => {
            if (op.scene !== scene) {
                return true;
            }
        });
    }

    removeRenderOperationsUsingCamera(camera: Camera): void {
        this._renderList = this._renderList.filter((op) => {
            if (op.camera !== camera) {
                return true;
            }
        });
    }

    removeAllRenderOperations(): void {
        this._renderList = [];
    }

    update(): void {
        for (let scene of this._scenes) {
            if (scene) {
                scene.traverse((go) => {
                    if (go instanceof GameObject) {
                        go.onUpdate();
                    }
                });
            }
        }
    }

    lateUpdate(): void {
        for (let scene of this._scenes) {
            if (scene) {
                scene.traverse((go) => {
                    if (go instanceof GameObject) {
                        go.onLateUpdate();
                    }
                });
            }
        }
    }

    render(webglRenderer: WebGLRenderer): void {
        webglRenderer.clear();
        
        for (let renderOp of this._renderList) {
            if (renderOp) {
                renderOp.render(webglRenderer);
            }
        }
    }

    resizeCameras(width: number, height: number): void {
        for (let camera of this._cameras) {
            if (camera) {
                if (camera instanceof PerspectiveCamera) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                }
            }
        }
    }

    dispose(): void {
        for (let scene of this._scenes) {
            if (scene) {
                scene.dispose();
            }
        }

        this._scenes = [];
        this._cameras = [];
        this._renderList = [];
        this._primaryCamera = null;
        this._primaryScene = null;
    }
}