import { Resource } from "./Resource";
import { Texture, TextureLoader, sRGBEncoding, TextureEncoding } from "three";
import { getOptionalValue } from "../utils/MiscUtils";

export interface ITextureConfig {
    url: string;
    encoding?: TextureEncoding;
    flipY?: boolean;
}

export class TextureResource extends Resource<Texture, ITextureConfig> {
    private _url: string;
    private _encoding: TextureEncoding;
    private _flipY: boolean;

    constructor(name: string, config: ITextureConfig) {
        super(name, config);

        this._url = config.url;
        this._encoding = config.encoding;
        this._flipY = getOptionalValue(this._flipY, true); // This is the defualt value as of ThreeJS r113
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

                    texture.flipY = this._flipY ? true : false;
                    texture.needsUpdate = true;

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
        console.log(`[TextureResource] ${this.name} unload object`);
        this.object.dispose();
    }
}