import { Resource } from "./Resource";
import { loadImage } from "../utils/MiscUtils";

export interface IImageConfig {
    url: string
}

export class ImageResource extends Resource<HTMLImageElement> {
    private _url: string;

    constructor(name: string, config: unknown) {
        super(name, config);
        
        const textureConfig = config as IImageConfig;

        this._url = textureConfig.url;
    }

    protected _loadObject(): Promise<HTMLImageElement> {
        return loadImage(this._url);
    }

    protected _unloadObject(): void {
    }
}