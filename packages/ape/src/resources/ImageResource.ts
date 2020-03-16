import { Resource } from "./Resource";

export interface IImageConfig {
    url: string
}

export class ImageResource extends Resource<string> {
    private _url: string;

    constructor(name: string, config: unknown) {
        super(name, config);
        
        const textureConfig = config as IImageConfig;

        this._url = textureConfig.url;
    }

    protected _loadObject(): Promise<string> {
        return new Promise<string>(((resolve: (value: string) => void, reject) => {
            const img = new Image();

            img.addEventListener('load', (event) => {
                resolve(this._url);
            });

            img.addEventListener('error', (event) => {
                reject(event);
            });
            
            img.src = this._url;
        }));
    }

    protected _unloadObject(): void {
    }
}