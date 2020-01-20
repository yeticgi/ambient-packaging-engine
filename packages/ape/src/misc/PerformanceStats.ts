import Stats from 'stats.js';
import { IDisposable } from './IDisposable';

declare type StatsPosition = 'top left' | 'top right' | 'bottom left' |'bottom right';
export class PerformanceStats implements IDisposable {

    private _enabled: boolean = false;
    private _position: StatsPosition = null;
    private _stats: Stats | null = null;

    get enabled() {
        return this._enabled;
    }

    set enabled(enable: boolean) {
        if (this._enabled !== enable) {
            this._enabled = enable;

            if (this._enabled) {
                this._onEnable();
            } else {
                this._onDisable();
            }
        }
    }

    get position() {
        return this._position;
    }

    set position(pos: StatsPosition) {
        if (this._position !== pos) {
            this._position = pos;
            this._updatePosition();
        }
    }

    constructor() {
        this._onEnable = this._onEnable.bind(this);
        this._onDisable = this._onDisable.bind(this);
    }

    update() {
        if (this._enabled) {
            this._stats.update();
        }
    }

    dispose() {
        this.enabled = false;
    }

    private _onEnable() {
        console.log(`[PerformanceStats] Enabled`);

        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);
        this._updatePosition();
    }

    private _onDisable() {
        console.log(`[PerformanceStats] Disabled`);

        document.body.removeChild(this._stats.dom);
        this._stats = null;
    }

    private _updatePosition() {
        if (!this._stats) {
            return;
        }

        let pos = this._position;
        if (!pos) {
            pos = 'bottom left';
        }

        if (pos === 'top left') {
            this._stats.dom.style.top = '0px';
            this._stats.dom.style.left = '0px';
            this._stats.dom.style.right = '';
            this._stats.dom.style.bottom = '';
        } else if (pos === 'top right') {
            this._stats.dom.style.top = '0px';
            this._stats.dom.style.left = '';
            this._stats.dom.style.right = '0px';
            this._stats.dom.style.bottom = '';
        } else if (pos === 'bottom left') {
            this._stats.dom.style.top = '';
            this._stats.dom.style.left = '0px';
            this._stats.dom.style.right = '';
            this._stats.dom.style.bottom = '0px';
        } else if (pos === 'bottom right') {
            this._stats.dom.style.top = '';
            this._stats.dom.style.left = '';
            this._stats.dom.style.right = '0px';
            this._stats.dom.style.bottom = '0px';
        }
    }
}