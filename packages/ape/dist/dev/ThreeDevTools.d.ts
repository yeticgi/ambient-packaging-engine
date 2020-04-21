import { Scene, WebGLRenderer } from "three";
export declare namespace ThreeDevTools {
    /**
     * Dispatch event to the Three JS Dev Tools (if it exists) so that it can observe the given scene and renderer.
     */
    function observe(scene: Scene, renderer: WebGLRenderer): void;
}
