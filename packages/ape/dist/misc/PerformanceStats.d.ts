import { IDisposable } from './IDisposable';
declare type StatsPosition = 'top left' | 'top right' | 'bottom left' | 'bottom right';
export declare class PerformanceStats implements IDisposable {
    private _enabled;
    private _position;
    private _stats;
    get enabled(): boolean;
    set enabled(enable: boolean);
    get position(): StatsPosition;
    set position(pos: StatsPosition);
    constructor();
    update(): void;
    dispose(): void;
    private _onEnable;
    private _onDisable;
    private _updatePosition;
}
export {};
