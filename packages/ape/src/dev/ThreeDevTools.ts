import { Scene, WebGLRenderer } from "three";
 
export namespace ThreeDevTools {
    
    declare var __THREE_DEVTOOLS__: any;
    
    /**
     * Dispatch event to the Three JS Dev Tools (if it exists) so that it can observe the given scene and renderer.
     */
    export function observe(scene: Scene, renderer: WebGLRenderer) {
        // Observe a scene or a renderer
        if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
            console.log(`[ThreeDevTools] dispatch event to observe scene and renderer.`);
            __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
            __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
        }
    }
}