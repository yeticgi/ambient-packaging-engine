import { Resource } from "./Resource";
import { getOptionalValue } from "../utils/Utils";
import { Howl } from "howler";

export interface IAudioOptions {
    loop?: boolean
}

export class AudioResource extends Resource<Howl> {
    private _url: string;
    private _loop: boolean;

    constructor(name: string, url: string, options?: IAudioOptions) {
        super(name);

        this._url = url;

        if (!options) {
            options = {};
        }

        this._loop = getOptionalValue(options.loop, false);
    }

    protected _loadObject(): Promise<Howl> {
        return new Promise<Howl>(((resolve: (value: Howl) => void, reject) => {
            const howl = new Howl({
                src: this._url,
                loop: this._loop,
                onload: () => {
                    resolve(howl);
                },
                onloaderror: (soundId: number, error: any) => {
                    reject(error);
                }
            });
        }));
    }

    protected _unloadObject(): void {
        this.object.unload();
    }
}