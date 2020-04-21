import { Scene, Camera, WebGLRenderer } from 'three';
export declare class SceneRenderOperation {
    scene: Scene;
    camera: Camera;
    enabled: boolean;
    clearColor: boolean;
    clearDepth: boolean;
    clearStencil: boolean;
    constructor(scene?: Scene, camera?: Camera);
    render(webglRenderer: WebGLRenderer): void;
}
