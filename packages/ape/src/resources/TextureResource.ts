import { Resource } from "./Resource";
import { Texture, TextureLoader, sRGBEncoding, TextureEncoding } from "three";

export interface ITextureConfig {
    url: string;
    encoding?: TextureEncoding;
}

export class TextureResource extends Resource<Texture> {
    private _url: string;
    private _encoding: TextureEncoding;

    constructor(name: string, config: unknown) {
        super(name, config);
        
        const textureConfig = config as ITextureConfig;

        this._url = textureConfig.url;
        this._encoding = textureConfig.encoding;
    }

    protected _loadObject(): Promise<Texture> {
        return new Promise<Texture>(((resolve: (value: Texture) => void, reject) => {
            const loader = new TextureLoader();
            loader.load(
                this._url, 
                (texture) => {
                    if (this._encoding) {
                        texture.encoding = sRGBEncoding;
                    }
                    resolve(texture);
                },
                (progressEvent) => {
                },
                (errorEvent) => {
                    reject(errorEvent);
                }
            );
        }));
    }

    protected _unloadObject(): void {
        this.object.dispose();
    }
}