import { IDisposable } from "../misc/IDisposable";
import { Scene, Camera, WebGLRenderer } from "three";
import { SceneRenderOperation as RenderOperation } from "./SceneRenderOperation";
export declare class SceneManager implements IDisposable {
    private _scenes;
    private _cameras;
    private _primaryCamera;
    private _primaryScene;
    private _renderList;
    /**
     * Scenes that are updated by APEngine.
     * GameObjects that are parented to scenes in this list will get their lifecycle functions invoked.
     */
    get scenes(): Readonly<Scene[]>;
    /**
     * Cameras that are updated by APEngine.
     * These camera will automatically get resized when APEngine window resize is triggered.
     */
    get cameras(): Readonly<Camera[]>;
    /**
     * The camera that is marked as primary.
     * If no camera is marked as primary, than the first camera is returned.
     */
    get primaryCamera(): Camera;
    set primaryCamera(cam: Camera);
    get sceneRenderList(): Readonly<RenderOperation[]>;
    /**
     * The scene that is marked as primary.
     * If no scene is marked as primary, than the first scene is returned.
     */
    get primaryScene(): Scene;
    set primaryScene(scene: Scene);
    constructor();
    addScene(scene: Scene): void;
    removeScene(scene: Scene): void;
    addCamera(camera: Camera): void;
    removeCamera(camera: Camera): void;
    addRenderOperation(scene: Scene, camera: Camera): RenderOperation;
    reorderRenderOperation(renderOp: RenderOperation, renderOrder: number): void;
    removeRenderOperation(scene: Scene, camera: Camera): void;
    removeRenderOperationsUsingScene(scene: Scene): void;
    removeRenderOperationsUsingCamera(camera: Camera): void;
    removeAllRenderOperations(): void;
    update(): void;
    lateUpdate(): void;
    render(webglRenderer: WebGLRenderer): void;
    resizeCameras(width: number, height: number): void;
    dispose(): void;
}
