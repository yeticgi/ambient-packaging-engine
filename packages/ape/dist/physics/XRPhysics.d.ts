import { Vector3, Quaternion, WebGLRenderer } from 'three';
import { IDisposable } from '../misc/IDisposable';
import { Event } from '../misc/Events';
export interface RaycastHit {
    position: Vector3;
    rotation: Quaternion;
}
export declare class XRPhysics implements IDisposable {
    private _renderer;
    private _xrSessionStartedEvent;
    private _xrSessionEndedEvent;
    private _getFrame;
    private _referenceSpace;
    private _hitTestSource;
    constructor(renderer: WebGLRenderer, onXRSessionStarted: Event, onXRSessionEnded: Event, getFrame: () => any);
    gazeRaycast(): RaycastHit | null;
    private _onXRSessionStarted;
    private _onXRSessionEnded;
    dispose(): void;
}
