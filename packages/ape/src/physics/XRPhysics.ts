import {
    Vector3,
    Matrix4,
    Quaternion
} from 'three';
import { APEngine } from '../APEngine';
import { IDisposable } from '../misc/IDisposable';

export interface RaycastHit {
    position: Vector3;
    rotation: Quaternion;
}

// Reference 01: https://github.com/mrdoob/three.js/blob/dev/examples/webxr_ar_hittest.html
// Refernece 02: https://web.dev/ar-hit-test/
export class XRPhysics implements IDisposable {
    
    private _hitTestSourceRequested: boolean = false;
    private _referenceSpace: any = null;
    private _hitTestSource: any = null;

    constructor() {
        this._onXRSessionStarted = this._onXRSessionStarted.bind(this);
        APEngine.onXRSessionStarted.addListener(this._onXRSessionStarted);

        this._onXRSessionEnded = this._onXRSessionEnded.bind(this);
        APEngine.onXRSessionEnded.addListener(this._onXRSessionEnded);
    }

    gazeRaycast(): RaycastHit | null {
        const renderer = APEngine.webglRenderer;
        const frame = APEngine.getXRFrame();

        if (frame) {
            if (this._referenceSpace && this._hitTestSource) {
                const hitTestResults = frame.getHitTestResults(this._hitTestSource);

                if (hitTestResults.length) {
                    const hitPose = hitTestResults[0].getPose(this._referenceSpace);
                    const hitMatrix = new Matrix4();
                    hitMatrix.fromArray(hitPose.transform.matrix);

                    const position = new Vector3();
                    const rotation = new Quaternion();
                    const scale = new Vector3();

                    hitMatrix.decompose(position, rotation, scale);

                    return {
                        position,
                        rotation
                    }
                }
            }
        }

        return null;
    }

    private async _onXRSessionStarted() {
        const session = APEngine.webglRenderer.xr.getSession();
        
        console.log(`[XRPhysics] Getting reference space...`);
        this._referenceSpace = await session.requestReferenceSpace('viewer');
        console.log(`[XRPhysics] Getting hit test source...`);
        this._hitTestSource = await session.requestHitTestSource({ space: this._referenceSpace });
        console.log(`[XRPhysics] Ready!`);
    }
    
    private _onXRSessionEnded() {
        this._hitTestSourceRequested = false;
        this._referenceSpace = null;
        this._hitTestSource = null;
    }

    dispose() {
        APEngine.onXRSessionStarted.removeListener(this._onXRSessionStarted);
        APEngine.onXRSessionEnded.removeListener(this._onXRSessionEnded);
    }
}