import { Resource, IResourceConfig } from "./Resource";
import { GLTFPrefab } from "./GLTFPrefab";
export interface IGLTFConfig extends IResourceConfig {
    gltfUrl: string;
    binUrl?: string;
    textureUrls?: string[];
}
export declare class GLTFResource extends Resource<GLTFPrefab> {
    private _gltfUrl;
    private _binUrl?;
    private _textureUrls?;
    constructor(name: string, config: unknown);
    protected _loadObject(): Promise<GLTFPrefab>;
    protected _unloadObject(): void;
}
