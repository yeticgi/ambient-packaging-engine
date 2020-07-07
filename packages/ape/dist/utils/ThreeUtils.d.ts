import { Object3D, Scene, Box2, Vector2, Box3, Mesh, Material, Camera, Vector3 } from 'three';
/**
 * Set the parent of the object3d.
 * @param object3d the object to re-parent.
 * @param parent the object to parent to.
 * @param scene the scene that these objects exist in.
 */
export declare function setParent(object3d: Object3D, parent: Object3D, scene: Scene): void;
/**
 * Find the scene object that the given object is parented to.
 * Will return null if no parent scene is found.
 * @param object3d The object to find the parent scene for.
 */
export declare function findParentScene(object3d: Object3D): Scene;
/**
 * Convert the Box3 object to a box2 object. Basically discards the z components of the Box3's min and max.
 * @param box3 The Box3 to convert to a Box2.
 */
export declare function convertToBox2(box3: Box3): Box2;
/**
 * Set the layer number that the given object 3d is on (and optionally all of its children too).
 * @param obj The root object 3d to change the layer.
 * @param layer The layer to set the object 3d to.
 * @param children Should change all children of given object 3d as well?
 */
export declare function setLayer(obj: Object3D, layer: number, children?: boolean): void;
/**
 * Set the layer mask of the given object 3d (and optionally all of its children too).
 * @param obj The root object 3d to change the layer.
 * @param layerMask The layer mask to set the object 3d to.
 * @param children Should change all children of given object 3d as well?
 */
export declare function setLayerMask(obj: Object3D, layerMask: number, children?: boolean): void;
/**
 * Debug print out all 32 layers for this object and wether or not it belongs to them.
 * @param obj The object to print out layers for.
 */
export declare function debugLayersToString(obj: Object3D): string;
export declare function isObjectVisible(obj: Object3D): boolean;
export declare function disposeObject3d<T extends Object3D>(obj: T): void;
/**
 * Dispose of each object 3d in the array and then clear the array.
 */
export declare function disposeObject3ds(objs: Object3D[]): void;
export declare function createDebugSphere(radius: number, color: string, lit?: boolean): Mesh;
export declare function createDebugCube(size: number, color: string, lit?: boolean): Mesh;
export declare function worldToScreenPosition(object3d: Object3D, camera: Camera): Vector2;
/**
 * Return the world direction for the given local direction from the object's perspective.
 * @param localDirection The local direction.
 * @param obj The object to return the world direction for.
 */
export declare function objectWorldDirection(localDirection: Vector3, obj: Object3D): Vector3;
export declare function getMaterials(mesh: Mesh): Material[];
