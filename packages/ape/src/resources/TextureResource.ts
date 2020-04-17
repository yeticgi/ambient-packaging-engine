import { Resource } from "./Resource";
import { Texture, TextureLoader, sRGBEncoding, TextureEncoding } from "three";

export interface ITextureConfig {
    url: string;
    encoding?: TextureEncoding;
    flipY?: boolean;
}

export class TextureResource extends Resource<Texture> {
    private _url: string;
    private _encoding: TextureEncoding;
    private _flipY: boolean;

    constructor(name: string, config: unknown) {
        super(name, config);
        
        const textureConfig = config as ITextureConfig;

        this._url = textureConfig.url;
        this._encoding = textureConfig.encoding;
        this._flipY = textureConfig.flipY;
    }

    protected _loadObject(): Promise<Texture> {
        return new Promise<Texture>(((resolve: (value: Texture) => void, reject) => {
            const loader = new TextureLoader();
            loader.load(
                this._url, 
                (texture) => {
                    if (this._encoding) {
                        texture.encoding = this._encoding;
                        texture.needsUpdate = true;
                    }
                    if (this._flipY) {
                        texture.flipY = true;
                        texture.needsUpdate = true;
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