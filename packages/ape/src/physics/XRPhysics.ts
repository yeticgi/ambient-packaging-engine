import {
    Vector3,
    Ray,
    WebGLRenderer,
    Matrix4,
    Quaternion
} from 'three';


export namespace XRPhysics {

    export interface RaycastHit {
        position: Vector3;
        rotation: Quaternion;
    }
    export async function gazeRaycast(renderer: WebGLRenderer, frame: any): Promise<RaycastHit | null> {
        // Reference: https://github.com/mrdoob/three.js/blob/dev/examples/webxr_ar_hittest.html
        if (frame) {
            const xr = <any>renderer.xr;
    
            const referenceSpace = xr.getReferenceSpace();
            const session = xr.getSession();
            const pose = frame.getViewerPose(referenceSpace);
    
            if (pose) {
                console.log(`[XRPhysics] gazeRaycast pose exists`);
                const matrix = new Matrix4();
                const ray = new Ray();
    
                matrix.fromArray(pose.transform.matrix);
    
                ray.origin.set(0, 0, 0);
                ray.direction.set(0, 0, -1);
                ray.applyMatrix4(matrix);
    
                const xrRay = new XRRay(ray.origin, ray.direction);

                const hits = await session.requestHitTest(xrRay, referenceSpace);
                
                if (hits.length) {
                    // Hit
                    const hitResult = hits[0];
                    const hitMatrix = new Matrix4();
                    hitMatrix.fromArray(hitResult.hitMatrix);

                    let position = new Vector3();
                    let rotation = new Quaternion();
                    let scale = new Vector3();

                    hitMatrix.decompose(position, rotation, scale);

                    return {
                        position,
                        rotation
                    };
                }
            }
        }

        return null;
    }
}