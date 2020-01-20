import { Howl } from "howler";
import { getOptionalValue } from "../utils/Utils";
import { ArgEvent } from "../misc/Events";
import { IDisposable } from "../misc/IDisposable";

export interface IAudioItemOptions {
    loop?: boolean
}

type AudioItemCallback = (item: AudioItem) => void; 
type AudioItemErrorCallback = (item: AudioItem, error: any) => void; 

export class AudioItem implements IDisposable {
    private _name: string;
    private _url: string;
    private _loop: boolean;
    private _audio: Howl;
    private _loaded: boolean;

    private _loadCallback: AudioItemCallback;
    private _loadErrorCallback: AudioItemErrorCallback;

    get name(): string {
        return this._name;
    }

    get audio(): Howl { 
        return this._audio;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    constructor(name: string, url: string, options?: IAudioItemOptions) {
        this._name = name;
        this._url = url;

        if (!options) {
            options = {};
        }

        this._loop = getOptionalValue(options.loop, false);
    }

    loadAudio(onLoaded?: AudioItemCallback, onLoadError?: AudioItemErrorCallback) {
        this._loadCallback = onLoaded;
        this._loadErrorCallback = onLoadError;

        if (!this._audio) {
            this._audio = new Howl({
                src: this._url,
                loop: this._loop,
                onload: this._onLoaded,
                onloaderror: this._onLoadError
            });
        }
    }
    
    unloadAudio() {
        if (this._audio){ 
            this._audio.unload();
        }
        
        this._loadCallback = null;
        this._loadErrorCallback = null;
    }
    
    dispose() {
        this.unloadAudio();
    }
    
    private _onLoaded(): void {
        this._loaded = true;

        if (this._loadCallback) {
            this._loadCallback(this);
        }

        this._loadCallback = null;
        this._loadErrorCallback = null;
    }

    private _onLoadError(soundId: number, error:any) {
        this._loaded = false;

        if (this._loadErrorCallback) {
            this._loadErrorCallback(this, error);
        }

        this._loadCallback = null;
        this._loadErrorCallback = null;
    }
}