import { IDisposable } from "../misc/IDisposable";
import { Scene, WebGLRenderer } from "three";
import { SceneRenderOperation as RenderOperation } from "./SceneRenderOperation";
import { CameraDecorator } from "../gameobject/decorators/CameraDecorator";
export declare class SceneManager implements IDisposable {
    private _scenes;
    private _primaryScene;
    private _renderList;
    private _updatedGameObjects;
    /**
     * Scenes that are updated by APEngine.
     * GameObjects that are parented to scenes in this list will get their lifecycle functions invoked.
     */
    get scenes(): Readonly<Scene[]>;
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
    addRenderOperation(scene: Scene, cameraDecorator: CameraDecorator): RenderOperation;
    reorderRenderOperation(renderOp: RenderOperation, renderOrder: number): void;
    removeRenderOperation(scene: Scene, cameraDecorator: CameraDecorator): void;
    removeRenderOperationsUsingScene(scene: Scene): void;
    removeRenderOperationsUsingCamera(cameraDecorator: CameraDecorator): void;
    removeAllRenderOperations(): void;
    update(): void;
    lateUpdate(): void;
    render(webglRenderer: WebGLRenderer): void;
    dispose(): void;
}
