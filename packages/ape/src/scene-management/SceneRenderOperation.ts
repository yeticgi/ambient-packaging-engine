import { Scene, Camera, WebGLRenderer } from 'three';

export class SceneRenderOperation {
    scene: Scene;
    camera: Camera;
    enabled: boolean = true;

    clearColor: boolean = false;
    clearDepth: boolean = false;
    clearStencil: boolean = false;

    constructor(scene?: Scene, camera?: Camera) {
        this.scene = scene;
        this.camera = camera;
    }

    render(webglRenderer: WebGLRenderer): void {
        if (!this.scene) {
            // No scene to render.
            return;
        }
        if (!this.camera) {
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

        webglRenderer.render(this.scene, this.camera);
    }
}