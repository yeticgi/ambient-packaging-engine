import { APEResources } from "./APEResources";
import { APEAssetTracker } from "./APEAssetTracker";
import { Resource, IResourceConfig } from "./Resource";
import { Group, Object3D } from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { IDisposable } from "../misc/IDisposable";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Object3DPrefab } from "./Object3DPrefab";

export interface IGLTFConfig extends IResourceConfig {
    url: string
}

export class GLTFResource extends Resource<Object3DPrefab> {
    private _url: string;

    constructor(name: string, config: unknown) {
        super(name, config);

        const gltfConfig = config as IGLTFConfig;

        this._url = gltfConfig.url;
    }

    protected _loadObject(): Promise<Object3DPrefab> {
        return new Promise<Object3DPrefab>((resolve: (value: Object3DPrefab) => void, reject) => {
            const gltfLoader = new GLTFLoader();

            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('public/draco/');
            gltfLoader.setDRACOLoader(dracoLoader);

            gltfLoader.load(
                this._url,
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