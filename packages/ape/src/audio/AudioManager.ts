import { AudioItem, IAudioItemOptions } from "./AudioItem";
import { Howl } from "howler";
import { Event, ArgEvent } from "../misc/Events";
import { IDisposable } from "../misc/IDisposable";


export class AudioManager implements IDisposable {
    private _loaded: boolean;
    private _audioLoadedCount: number = 0;
    private _audioItems: Map<string, AudioItem> = new Map();

    onLoaded: ArgEvent<AudioManager> = new ArgEvent();

    get loaded(): boolean {
        return this._loaded;
    }

    addAudioItem(name: string, url: string, options?: IAudioItemOptions) {
        let audio: AudioItem = new AudioItem(name, url, options);
        this._audioItems.set(name, audio);
        console.log(`[AudioManager] added audio item: ${name}`);
    }

    removeAudioItem(name: string) {
        if (this._audioItems.has(name)) {
            let item = this._audioItems.get(name);
            item.unloadAudio();
            this._audioItems.delete(name);
        }
    }

    startLoading() {
        if (this._audioItems.size > 0) {
            this._audioItems.forEach((item) => {
                item.loadAudio(
                    this._onAudioLoaded,
                    this._onAudioLoadError
                );
            });
        } else {
            this._onLoaded();
        }
    }

    getAudio(name: string): Howl {
        if (this._audioItems.has(name)) {
            let item = this._audioItems.get(name);
            if (!item.loaded) {
                item.loadAudio();
            }
            return item.audio;
        } else {
            return null;
        }
    }

    dispose() {
        this._audioItems.forEach((item) => {
            item.dispose();
        });

        this._audioItems = new Map();
    }

    private _onAudioLoaded(item: AudioItem) {
        this._audioLoadedCount++;
        if (this._audioLoadedCount == this._audioItems.size) {
            this._onLoaded();
        }
    }

    private _onAudioLoadError(item: AudioItem, error: any) {
        console.error(`[AudioManager] Could not load audio item ${item.name}. error: ${error}`);
    }

    private _onLoaded() {
        this._loaded = true;
        this.onLoaded.invoke(this);
    }
}