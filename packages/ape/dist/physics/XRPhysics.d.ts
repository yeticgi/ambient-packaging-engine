import { Vector3, WebGLRenderer, Quaternion } from 'three';
export declare namespace XRPhysics {
    interface RaycastHit {
        position: Vector3;
        rotation: Quaternion;
    }
    function gazeRaycast(renderer: WebGLRenderer, frame: any): Promise<RaycastHit | null>;
}
