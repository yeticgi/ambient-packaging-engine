import { Resource, IResourceConfig } from "./Resource";
import { getOptionalValue } from "../utils/MiscUtils";
import { Howl } from "howler";

export interface IAudioConfig extends IResourceConfig {
    url: string,
    loop?: boolean
}

export class AudioResource extends Resource<Howl> {
    private _url: string;
    private _loop: boolean;

    constructor(name: string, config: unknown) {
        super(name, config);

        const audioConfig = config as IAudioConfig;

        this._url = audioConfig.url;
        this._loop = getOptionalValue(audioConfig.loop, false);
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