import { Scene, WebGLRenderer } from 'three';
import { CameraDecorator } from '../gameobject/decorators/CameraDecorator';
export declare class SceneRenderOperation {
    scene: Scene;
    cameraDecorator: CameraDecorator;
    enabled: boolean;
    clearColor: boolean;
    clearDepth: boolean;
    clearStencil: boolean;
    constructor(scene?: Scene, cameraDecorator?: CameraDecorator);
    render(webglRenderer: WebGLRenderer): void;
}
