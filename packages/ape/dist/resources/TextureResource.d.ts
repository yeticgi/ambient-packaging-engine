import { Resource } from "./Resource";
import { Texture, TextureEncoding } from "three";
export interface ITextureConfig {
    url: string;
    encoding?: TextureEncoding;
    flipY?: boolean;
}
export declare class TextureResource extends Resource<Texture, ITextureConfig> {
    private _url;
    private _encoding;
    private _flipY;
    constructor(name: string, config: ITextureConfig);
    protected _loadObject(): Promise<Texture>;
    protected _unloadObject(): void;
}
