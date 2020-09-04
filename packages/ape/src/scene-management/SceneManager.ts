import { IDisposable } from "../misc/IDisposable";
import { Scene, Camera, WebGLRenderer, PerspectiveCamera } from "three";
import { SceneRenderOperation as RenderOperation } from "./SceneRenderOperation";
import { GameObject } from "../gameobject/GameObject";
import { CameraDecorator } from "../gameobject/decorators/CameraDecorator";
import { traverseSafe } from "../utils/ThreeUtils";

export class SceneManager implements IDisposable {

    private _scenes: Scene[] = [];
    private _primaryScene: Scene = null;
    private _renderList: RenderOperation[] = [];
    
    /**
     * Scenes that are updated by APEngine. 
     * GameObjects that are parented to scenes in this list will get their lifecycle functions invoked.
     */
    get scenes(): Readonly<Scene[]> {
        return this._scenes;
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

    addRenderOperation(scene: Scene, cameraDecorator: CameraDecorator): RenderOperation {
        const renderOp = new RenderOperation(scene, cameraDecorator);
        this._renderList.push(renderOp);
        return renderOp;
    }

    reorderRenderOperation(renderOp: RenderOperation, renderOrder: number) {
        if (this._renderList.some(op => op === renderOp)) {
            this._renderList.splice(renderOrder, 0, renderOp);
        }
    }

    removeRenderOperation(scene: Scene, cameraDecorator: CameraDecorator): void {
        const index = this._renderList.findIndex(op => op.scene === scene && op.cameraDecorator === cameraDecorator);
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

    removeRenderOperationsUsingCamera(cameraDecorator: CameraDecorator): void {
        this._renderList = this._renderList.filter((op) => {
            if (op.cameraDecorator !== cameraDecorator) {
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
                traverseSafe(scene, (go) => {
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
                traverseSafe(scene, (go) => {
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

    dispose(): void {
        for (let scene of this._scenes) {
            if (scene) {
                scene.dispose();
            }
        }

        this._scenes = [];
        this._renderList = [];
        this._primaryScene = null;
    }
}