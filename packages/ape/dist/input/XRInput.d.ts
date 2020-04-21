import { IDisposable } from "../misc/IDisposable";
import { WebGLRenderer } from "three";
import { Event } from '../misc/Events';
export declare class XRInput implements IDisposable {
    private _renderer;
    private _controller;
    /**
     * Should gaze raycasting be enabled.
     */
    gazeEnabled: boolean;
    onSelect: Event;
    constructor(renderer: WebGLRenderer);
    dispose(): void;
    private _onControllerSelect;
}
