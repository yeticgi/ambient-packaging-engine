import { Resource } from "./Resource";
import { getOptionalValue } from "../utils/Utils";
import { Howl } from "howler";
import { Group, Scene } from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { ThreeResourceTracker } from "../utils/ThreeResourceTracker";
import { IDisposable } from "../misc/IDisposable";
import { APEngine } from "../APEngine";

export interface IGLTFOptions {
    
}

export class GLTFPrefab implements IDisposable {
    private _prefab: Group;

    /**
     * The GLTF prefab object.
     * It is NOT RECOMMENDED to use this in your scenes. 
     * If you want a clone of the prefab use the clone() function instead.
     */
    get prefab(): Group { return this._prefab; }

    constructor(name: string, gltf: GLTF) {
        this._prefab = new Group();
        this._prefab.name = `${name}`;

        // GLTF comes back as a scene by default.
        // Place all children of the loaded GLTF into newly created prefab group.
        const scene = gltf.scene;
        for (let child of scene.children) {
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
     * Retrieve a clone of the GLTF Prefab.
     * This will clone all object 3d and materials on the prefab.
     * Textures are NOT cloned.
     */
    clone(): Group {
        const clone = this._prefab.clone();
        return clone;
    }

    dispose(): void {
        APEngine.resourceTracker.release(this._prefab);
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
            const loader = new GLTFLoader();
            loader.load(
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