import { Scene, Camera, WebGLRenderer } from 'three';
import { CameraDecorator } from '../gameobject/decorators/CameraDecorator';

export class SceneRenderOperation {
    scene: Scene;
    cameraDecorator: CameraDecorator;
    enabled: boolean = true;

    clearColor: boolean = false;
    clearDepth: boolean = false;
    clearStencil: boolean = false;

    constructor(scene?: Scene, cameraDecorator?: CameraDecorator) {
        this.scene = scene;
        this.cameraDecorator = cameraDecorator;
    }

    render(webglRenderer: WebGLRenderer): void {
        if (!this.scene) {
            // No scene to render.
            return;
        }
        if (!this.cameraDecorator || !this.cameraDecorator.camera) {
            // No camera to render scene with.
            return;
        }
        if (!this.enabled) {
            // Dont render if render operatio is disabled.
            return;
        }

        if (this.clearColor) {
            webglRenderer.clearColor();
        }

        if (this.clearDepth) {
            webglRenderer.clearDepth();
        }

        if (this.clearStencil) {
            webglRenderer.clearStencil();
        }

        webglRenderer.render(this.scene, this.cameraDecorator.camera);
    }
}