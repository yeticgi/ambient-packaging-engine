// import { Howl } from "howler";
// import { getOptionalValue } from "../../utils/Utils";
// import { ArgEvent } from "../../misc/Events";
// import { IDisposable } from "../../misc/IDisposable";
// import { Group, Material, Object3D, Scene, Texture, Geometry } from "three";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// export interface IPrefabItemOptions {
// }

// type PrefabItemCallback = (item: PrefabItem) => void; 
// type PrefabItemErrorCallback = (item: PrefabItem, error: any) => void; 

// export class PrefabItem implements IDisposable {
//     private _name: string;
//     private _url: string;
//     private _prefab: Group;
//     private _loaded: boolean;

//     private _loadCallback: PrefabItemCallback;
//     private _loadErrorCallback: PrefabItemErrorCallback;

//     get name(): string {
//         return this._name;
//     }

//     get prefab(): Group { 
//         return this._prefab;
//     }

//     get loaded(): boolean {
//         return this._loaded;
//     }

//     constructor(name: string, url: string, options?: IPrefabItemOptions) {
//         this._name = name;
//         this._url = url;

//         if (!options) {
//             options = {};
//         }
//     }

//     loadPrefab(onLoaded?: PrefabItemCallback, onLoadError?: PrefabItemErrorCallback) {
//         this._loadCallback = onLoaded;
//         this._loadErrorCallback = onLoadError;

//         if (!this._prefab) {
            
//             const loader = new GLTFLoader();
//             loader.load(
//                 this._url,
//                 (gltf) => {
//                     this._prefab = new Group();
//                     this._prefab.name = `${this._name}`;

//                     // GLTF comes back as a scene by default.
//                     // Place all children of the loaded gltf into newly created prefab group.
//                     const scene = gltf.scene;
//                     for (let child of scene.children) {
//                         // Remove child from scene.
//                         scene.remove(child);
//                         // Place child in prefab group.
//                         this._prefab.add(child);
//                     }
                    
//                     if (onLoaded) {
//                         onLoaded(this);
//                     }
//                 },
//                 (progressEvent) => {
//                 },
//                 (errorEvent) {
//                     if (onLoadError) {
//                         onLoadError(this, errorEvent);
//                     }
//                 }
//             );
//         }
//     }
    
//     unloadPrefab() {
//         if (this._prefab){

//             // Find all geometry, materials, and textures used in the prefab.
//             const geometries: Geometry[] = [];
//             const materials: Material[] = [];
//             const textures: Texture[] = [];

//             // Dipose of them all.
//         }
        
//         this._loadCallback = null;
//         this._loadErrorCallback = null;
//     }
    
//     dispose() {
//         // this.unloadAudio();
//     }
    
//     private _onLoaded(): void {
//         this._loaded = true;

//         if (this._loadCallback) {
//             this._loadCallback(this);
//         }

//         this._loadCallback = null;
//         this._loadErrorCallback = null;
//     }

//     private _onLoadError(soundId: number, error:any) {
//         this._loaded = false;

//         if (this._loadErrorCallback) {
//             this._loadErrorCallback(this, error);
//         }

//         this._loadCallback = null;
//         this._loadErrorCallback = null;
//     }
// }