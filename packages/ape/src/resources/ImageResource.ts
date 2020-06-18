import { Resource } from "./Resource";
import { loadImage } from "../utils/MiscUtils";

export interface IImageConfig {
    url: string
}

export class ImageResource extends Resource<HTMLImageElement, IImageConfig> {
    private _url: string;

    constructor(name: string, config: IImageConfig) {
        super(name, config);

        this._url = config.url;
    }

    protected _loadObject(): Promise<HTMLImageElement> {
        return loadImage(this._url);
    }

    protected _unloadObject(): void {
    }
}