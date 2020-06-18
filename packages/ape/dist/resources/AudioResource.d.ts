/// <reference types="howler" />
import { Resource, IResourceConfig } from "./Resource";
export interface IAudioConfig extends IResourceConfig {
    url: string;
    loop?: boolean;
}
export declare class AudioResource extends Resource<Howl, IAudioConfig> {
    private _url;
    private _loop;
    constructor(name: string, config: IAudioConfig);
    protected _loadObject(): Promise<Howl>;
    protected _unloadObject(): void;
}
