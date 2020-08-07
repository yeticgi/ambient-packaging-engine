import { Resource, IResourceConfig } from "./Resource";
import { Group, LoadingManager } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { getFilename, getExtension } from "../utils/MiscUtils";
import { GLTFPrefab } from "./GLTFPrefab";

export interface IGLTFConfig extends IResourceConfig {
    gltfUrl: string;
    binUrl?: string;
    textureUrls?: GLTFTextureRedirect[] | string[];
}

export interface GLTFTextureRedirect {
    filename: string;
    redirectUrl: string;
}

export class GLTFResource extends Resource<GLTFPrefab, IGLTFConfig> {
    private _gltfUrl: string;
    private _binUrl?: string;
    private _textureUrls?: GLTFTextureRedirect[] | string[];

    private static _sentTextureUrlObsoleteWarning: boolean = false;
    private static _dracoLoader: DRACOLoader = null;

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

                // Redirect gltf relative url to CDN asset location.
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
                        if (isStringArray(this._textureUrls)) {
                            if (!GLTFResource._sentTextureUrlObsoleteWarning) {
                                console.warn(`[GLTFResource] WARNING! OBSOLETE! It is highly recommended that GLTFResource textureUrls be in GLTFTextureRedirect format and not a plain string array.
                                The string array implementation was designed for a specific CDN use case and requires that filesnames match. This filename matching does 
                                not work if using local assets that are hashed at build time.
                                `);

                                GLTFResource._sentTextureUrlObsoleteWarning = true;
                            }

                            redirectUrl = this._textureUrls.find((textureUrl) => filename === getFilename(textureUrl));
                        } else {
                            const textureRedirect = this._textureUrls.find((tr) => filename === tr.filename);
                            if (textureRedirect) {
                                redirectUrl = textureRedirect.redirectUrl;
                            }
                        }
                    }
                }

                if (!redirectUrl) {
                    console.error(`[GLTFResource] ${this.name} could not find a redirect url for ${url}`);
                }
                
                return redirectUrl;
            });

            const gltfLoader = new GLTFLoader(loadingManager);

            if (!GLTFResource._dracoLoader) {
                GLTFResource._dracoLoader = new DRACOLoader(loadingManager);
                GLTFResource._dracoLoader.setDecoderPath('public/draco/');
                GLTFResource._dracoLoader.setDecoderConfig({ type: 'js' });
            }
            gltfLoader.setDRACOLoader(GLTFResource._dracoLoader);

            gltfLoader.load(
                this._gltfUrl,
                (gltf) => {
                    const prefab = new GLTFPrefab(gltf.scene, gltf.animations);
                    resolve(prefab);
                },
                (progressEvent) => {
                    this._progress = progressEvent.loaded / progressEvent.total;
                },
                (errorEvent) => {
                    console.error(`[GLTFResource] ${this.name} Error: ${errorEvent}`);
                    reject(errorEvent);
                }
            );
        });
    }

    protected _unloadObject(): void {
        this.object.dispose();
    }
}

function isStringArray(value: any): value is string[] {
    if (value && Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === 'string') {
            return true;
        }
    }

    return false;
}