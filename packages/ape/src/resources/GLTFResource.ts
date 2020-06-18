import { Resource, IResourceConfig } from "./Resource";
import { Group, LoadingManager } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { getFilename, getExtension } from "../utils/MiscUtils";
import { GLTFPrefab } from "./GLTFPrefab";

export interface IGLTFConfig extends IResourceConfig {
    gltfUrl: string;
    binUrl?: string;
    textureUrls?: string[];
}

export class GLTFResource extends Resource<GLTFPrefab, IGLTFConfig> {
    private _gltfUrl: string;
    private _binUrl?: string;
    private _textureUrls?: string[];

    constructor(name: string, config: IGLTFConfig) {
        super(name, config);

        this._gltfUrl = config.gltfUrl;
        this._binUrl = config.binUrl;
        this._textureUrls = config.textureUrls;
    }

    protected _loadObject(): Promise<GLTFPrefab> {
        return new Promise<GLTFPrefab>((resolve: (value: GLTFPrefab) => void, reject) => {
            const loadingManager = new LoadingManager();

            loadingManager.setURLModifier((url): string => {
                if (url.startsWith('data:')) {
                    // Do not redirect data uris.
                    return url;
                }
                if (url.startsWith('blob:')) {
                    // Do not redirect blobs.
                    return url;
                }

                //Redirect gltf relative url to CDN asset location.
                const filename = getFilename(url);
                const ext = getExtension(url);

                if (filename === 'draco_wasm_wrapper.js' || filename === 'draco_decoder.wasm' || filename === 'draco_decoder.js') {
                    // Do not redirect draco specific files.
                    return url;
                }
                let redirectUrl: string = null;
                
                if (ext === 'gltf' || ext === 'glb') {
                    redirectUrl = this._gltfUrl;
                } else if (ext === 'bin') {
                    if (this._binUrl) {
                        redirectUrl = this._binUrl;
                    }
                } else {
                    // Assume that url is for texture image.
                    if (this._textureUrls) {
                        redirectUrl = this._textureUrls.find((textureUrl) => filename === getFilename(textureUrl));
                    }
                }

                if (!redirectUrl) {
                    console.error(`[GLTFResource] ${this.name} could not find a redirect url for ${url}`);
                }
                
                return redirectUrl;
            });

            const gltfLoader = new GLTFLoader(loadingManager);

            const dracoLoader = new DRACOLoader(loadingManager);
            dracoLoader.setDecoderPath('public/draco/');
            dracoLoader.setDecoderConfig({ type: 'js' });
            gltfLoader.setDRACOLoader(dracoLoader);

            gltfLoader.load(
                this._gltfUrl,
                (gltf) => {
                    const prefab = new GLTFPrefab(gltf.scene, gltf.animations);
                    resolve(prefab);
                },
                () => {
                },
                (errorEvent) => {
                    console.error(`[GLTFResource] ${this.name} Error: ${errorEvent}`);
                    reject(errorEvent);
                }
            );
        });
    }

    protected _unloadObject(): void {
        console.log(`[GLTFResource] ${this.name} unload object`);
        this.object.dispose();
    }
}