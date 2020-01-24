import { Resource } from "./Resource";
import { getOptionalValue } from "../utils/Utils";
import { Texture, TextureLoader } from "three";

export interface ITextureConfig {
    url: string
}

export class TextureResource extends Resource<Texture> {
    private _url: string;

    constructor(name: string, config: unknown) {
        super(name, config);
        
        const textureConfig = config as ITextureConfig;

        this._url = textureConfig.url;
    }

    protected _loadObject(): Promise<Texture> {
        return new Promise<Texture>(((resolve: (value: Texture) => void, reject) => {
            const loader = new TextureLoader();
            loader.load(
                this._url, 
                (texture) => {
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