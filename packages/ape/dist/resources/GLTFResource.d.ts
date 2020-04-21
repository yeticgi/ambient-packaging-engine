import { Resource, IResourceConfig } from "./Resource";
import { Object3DPrefab } from "./Object3DPrefab";
export interface IGLTFConfig extends IResourceConfig {
    gltfUrl: string;
    binUrl?: string;
    textureUrls?: string[];
}
export declare class GLTFResource extends Resource<Object3DPrefab> {
    private _gltfUrl;
    private _binUrl?;
    private _textureUrls?;
    constructor(name: string, config: unknown);
    protected _loadObject(): Promise<Object3DPrefab>;
    protected _unloadObject(): void;
}
