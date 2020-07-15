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
        const onProgress = (event: ProgressEvent<EventTarget>) => {
            this._progress.set(event.loaded, event.total);
        } 
        return loadImage(this._url, onProgress);
    }

    protected _unloadObject(): void {
    }
}