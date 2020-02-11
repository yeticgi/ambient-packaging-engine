import { APEResources } from "./APEResources";
import { APEAssetTracker } from "./APEAssetTracker";
import { Resource, IResourceConfig } from "./Resource";
import { Group, Object3D, LoadingManager } from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { IDisposable } from "../misc/IDisposable";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Object3DPrefab } from "./Object3DPrefab";
import { getFilename, getExtension } from "../utils/Utils";

export interface IGLTFConfig extends IResourceConfig {
    gltfUrl: string;
    binUrl?: string;
    textureUrls?: string[];
}

export class GLTFResource extends Resource<Object3DPrefab> {
    private _gltfUrl: string;
    private _binUrl?: string;
    private _textureUrls?: string[];

    constructor(name: string, config: unknown) {
        super(name, config);

        const gltfConfig = config as IGLTFConfig;

        this._gltfUrl = gltfConfig.gltfUrl;
        this._binUrl = gltfConfig.binUrl;
        this._textureUrls = gltfConfig.textureUrls;
    }

    protected _loadObject(): Promise<Object3DPrefab> {
        return new Promise<Object3DPrefab>((resolve: (value: Object3DPrefab) => void, reject) => {
            const loader = new LoadingManager();

            loader.setURLModifier((url): string => {
                //Redirect gltf relative url to CDN asset location.
                const filename = getFilename(url);
                const ext = getExtension(url);
                let redirectUrl: string = null;

                if (ext === 'gltf') {
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

            const gltfLoader = new GLTFLoader(loader);

            const dracoLoader = new DRACOLoader(loader);
            dracoLoader.setDecoderPath('public/draco/');
            gltfLoader.setDRACOLoader(dracoLoader);

            gltfLoader.load(
                this._gltfUrl,
                (gltf) => {
                    const gltfGroup = new Group();
                    gltfGroup.name = this.name;

                    // GLTF comes back as a scene by default.
                    // Place all children of the loaded GLTF into newly created prefab group.
                    const scene = gltf.scene;
                    const sceneChildren = scene.children.slice();
                    for (let child of sceneChildren) {
                        // Remove child from scene.
                        scene.remove(child);
                        // Place child in prefab group.
                        gltfGroup.add(child);
                    }

                    // Dispose of the original GLTF scene.
                    scene.dispose();

                    const prefab = new Object3DPrefab(gltfGroup);
                    resolve(prefab);
                },
                (progressEvent) => {
                },
                (errorEvent) => {
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