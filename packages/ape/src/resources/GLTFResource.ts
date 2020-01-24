import { Resource } from "./Resource";
import { getOptionalValue } from "../utils/Utils";
import { Howl } from "howler";
import { Group, Scene, Object3D } from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { ThreeResourceTracker } from "../utils/ThreeResourceTracker";
import { IDisposable } from "../misc/IDisposable";
import { APEngine } from "../APEngine";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export interface IGLTFOptions {
    
}

export class GLTFPrefab implements IDisposable {
    private _prefab: Object3D;

    /**
     * The GLTF prefab object.
     * It is NOT RECOMMENDED to use this in your scenes. 
     * If you want a clone of the prefab use the clone() function instead.
     */
    get prefab(): Object3D { return this._prefab; }

    constructor(name: string, gltf: GLTF) {
        this._prefab = new Group();
        this._prefab.name = `${name}`;

        // GLTF comes back as a scene by default.
        // Place all children of the loaded GLTF into newly created prefab group.
        const scene = gltf.scene;
        const sceneChildren = scene.children.slice();
        for (let child of sceneChildren) {
            // Remove child from scene.
            scene.remove(child);
            // Place child in prefab group.
            this._prefab.add(child);
        }

        APEngine.resourceTracker.track(this._prefab);

        // Dispose of the original GLTF scene.
        scene.dispose();
    }

    /**
     * Retrieve a clone of the GLTF Prefab object.
     * This will clone all object 3d and materials on the prefab.
     * Textures are NOT cloned.
     * 
     * If optional childObjectName is given then the returned clone is only of the specified child object and its children.
     * If the given child object name is not found then an exception will be thrown.
     */
    clone(childObjectName?: string): Group | Object3D {
        if (childObjectName) {
            const childObject = this.prefab.getObjectByName(childObjectName);
            if (childObject) {
                return childObject.clone();
            } else {
                throw `Could not find child object named ${childObjectName} in the prefab ${this._prefab}`;
            }
        } else {
            return this._prefab.clone();
        }
    }

    dispose(): void {
        APEngine.resourceTracker.untrack(this._prefab);
    }
}

export class GLTFResource extends Resource<GLTFPrefab> {
    private _url: string;

    constructor(name: string, url: string, options?: IGLTFOptions) {
        super(name);

        this._url = url;
    }

    protected _loadObject(): Promise<GLTFPrefab> {
        return new Promise<GLTFPrefab>((resolve: (value: GLTFPrefab) => void, reject) => {
            const gltfLoader = new GLTFLoader();

            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('public/draco/');
            gltfLoader.setDRACOLoader(dracoLoader);

            gltfLoader.load(
                this._url,
                (gltf) => {
                    const gltfPrefab = new GLTFPrefab(this.name, gltf);

                    resolve(gltfPrefab);
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