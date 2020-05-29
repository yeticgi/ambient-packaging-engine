import {
    Vector3,
    Matrix4,
    Quaternion,
    WebGLRenderer
} from 'three';
import { IDisposable } from '../misc/IDisposable';
import { Event } from '../misc/Events';

export interface RaycastHit {
    position: Vector3;
    rotation: Quaternion;
}

// Reference 01: https://github.com/mrdoob/three.js/blob/dev/examples/webxr_ar_hittest.html
// Refernece 02: https://web.dev/ar-hit-test/
export class XRPhysics implements IDisposable {

    private _renderer: WebGLRenderer;
    private _xrSessionStartedEvent: Event;
    private _xrSessionEndedEvent: Event;
    private _getFrame: () => any;
    
    private _viewerHitTestSource: any = null;

    constructor(renderer: WebGLRenderer, onXRSessionStarted: Event, onXRSessionEnded: Event, getFrame: () => any) {
        this._renderer = renderer;
        this._xrSessionStartedEvent = onXRSessionStarted;
        this._xrSessionEndedEvent = onXRSessionEnded;
        this._getFrame = getFrame;

        this._onXRSessionStarted = this._onXRSessionStarted.bind(this);
        this._xrSessionStartedEvent.addListener(this._onXRSessionStarted);

        this._onXRSessionEnded = this._onXRSessionEnded.bind(this);
        this._xrSessionEndedEvent.addListener(this._onXRSessionEnded);
    }

    gazeRaycast(): RaycastHit | null {
        const frame = this._getFrame();

        if (frame) {
            const referenceSpace = this._renderer.xr.getReferenceSpace();

            if (this._viewerHitTestSource) {
                const hitTestResults = frame.getHitTestResults(this._viewerHitTestSource);

                if (hitTestResults.length) {
                    const hitPose = hitTestResults[0].getPose(referenceSpace);
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
        // Retrieve hit test source for viewer reference space.
        const session = this._renderer.xr.getSession();
        const referenceSpace = await session.requestReferenceSpace('viewer');
        this._viewerHitTestSource = await session.requestHitTestSource({
            space: referenceSpace
        });
    }
    
    private _onXRSessionEnded() {
        this._viewerHitTestSource = null;
    }

    dispose() {
        this._xrSessionStartedEvent.removeListener(this._onXRSessionStarted);
        this._xrSessionEndedEvent.removeListener(this._onXRSessionEnded);
    }
}