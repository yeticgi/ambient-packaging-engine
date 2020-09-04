import {
    Object3D,
    Scene,
    Matrix4,
    Box2,
    Vector2,
    Box3,
    Layers,
    Mesh,
    SphereBufferGeometry,
    BoxBufferGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Material,
    Camera,
    Vector3,
    Quaternion,
    Euler
} from 'three';

/**
 * Set the parent of the object3d.
 * @param object3d the object to re-parent.
 * @param parent the object to parent to.
 * @param scene the scene that these objects exist in.
 */
export function setParent(object3d: Object3D, parent: Object3D, scene: Scene) {
    if (!object3d) return;
    if (!scene)
        throw new Error('utils.setParent needs a valid scene parameter.');

    // Detach
    if (object3d.parent && object3d.parent !== scene) {
        object3d.applyMatrix4(object3d.parent.matrixWorld);
        object3d.parent.remove(object3d);
        scene.add(object3d);
    }

    // Attach
    if (parent) {
        object3d.applyMatrix4(new Matrix4().getInverse(parent.matrixWorld));
        scene.remove(object3d);
        parent.add(object3d);
    }

    object3d.updateMatrixWorld(true);
}

/**
 * Find the scene object that the given object is parented to.
 * Will return null if no parent scene is found.
 * @param object3d The object to find the parent scene for.
 */
export function findParentScene(object3d: Object3D): Scene {
    if (!object3d) {
        return null;
    }

    if (object3d instanceof Scene) {
        return object3d;
    } else {
        return findParentScene(object3d.parent);
    }
}

/**
 * Is the object a child of the given parent object.
 * @param parent The parent object that we want to know if the other object is a child of.
 * @param object The object that we want to know if is a child of the parent object.
 */
export function isObjectChildOf(object: Object3D, parent: Object3D): boolean {
    if (!parent || !object.parent) {
        return false;
    }

    if (object.parent === parent) {
        return true;
    } else {
        return isObjectChildOf(object.parent, parent);
    }
}

/**
 * Convert the Box3 object to a box2 object. Basically discards the z components of the Box3's min and max.
 * @param box3 The Box3 to convert to a Box2.
 */
export function convertToBox2(box3: Box3): Box2 {
    return new Box2(
        new Vector2(box3.min.x, box3.min.y),
        new Vector2(box3.max.x, box3.max.y)
    );
}

/**
 * Set the layer number that the given object 3d is on (and optionally all of its children too).
 * @param obj The root object 3d to change the layer.
 * @param layer The layer to set the object 3d to.
 * @param children Should change all children of given object 3d as well?
 */
export function setLayer(obj: Object3D, layer: number, children?: boolean) {
    obj.layers.set(layer);
    if (children) {
        traverseSafe(obj, (child) => child.layers.set(layer));
    }
}

/**
 * Set the layer mask of the given object 3d (and optionally all of its children too).
 * @param obj The root object 3d to change the layer.
 * @param layerMask The layer mask to set the object 3d to.
 * @param children Should change all children of given object 3d as well?
 */
export function setLayerMask(
    obj: Object3D,
    layerMask: number,
    children?: boolean
) {
    obj.layers.mask = layerMask;
    if (children) {
        traverseSafe(obj, (child) => child.layers.mask = layerMask);
    }
}

/**
 * Debug print out all 32 layers for this object and wether or not it belongs to them.
 * @param obj The object to print out layers for.
 */
export function debugLayersToString(obj: Object3D): string {
    if (!obj) return;

    let output: string = '\n';
    for (let i = 0; i < 32; i++) {
        let l = new Layers();
        l.set(i);
        output += '[' + i + ']  ' + obj.layers.test(l) + '\n';
    }

    return output;
}

export function isObjectVisible(obj: Object3D) {
    if (!obj) {
        return false;
    }
    while (obj) {
        if (!obj.visible) {
            return false;
        }
        obj = obj.parent;
    }
    return true;
}

export function disposeObject3d<T extends Object3D>(obj: T) {
    if (obj) {
        traverseSafe(obj, (o) => {
            if (o instanceof Mesh) {
                if (o.geometry) {
                    o.geometry.dispose();
                }
                
                if (Array.isArray(o.material)) {
                    o.material.forEach((m) => m.dispose());
                } else {
                    o.material.dispose();
                }
            }
    
            if (o.parent) {
                o.parent.remove(o);
            }
        });
    }
}

/**
 * Dispose of each object 3d in the array and then clear the array.
 */
export function disposeObject3ds(objs: Object3D[]) {
    if (objs && objs.length > 0) {
        for (let i = 0; i < objs.length; i++) {
            disposeObject3d(objs[i]);
        }
        objs = [];
    }
}

export function createDebugSphere(radius: number, color: string, lit?: boolean): Mesh {
    const geometry = new SphereBufferGeometry(radius, 24, 24);
    let material: Material;

    if (lit) {
        material = new MeshStandardMaterial({
            color,
        });
    } else {
        material = new MeshBasicMaterial({
            color,
        });
    }

    return new Mesh(geometry, material);
}

export function createDebugCube(size: number, color: string, lit?: boolean): Mesh {
    const geometry = new BoxBufferGeometry(size, size, size);
    let material: Material;

    if (lit) {
        material = new MeshStandardMaterial({
            color,
        });
    } else {
        material = new MeshBasicMaterial({
            color,
        });
    }

    return new Mesh(geometry, material);
}

export function worldToScreenPosition(object3d: Object3D, camera: Camera): Vector2 {
    const pos = new Vector3().setFromMatrixPosition(object3d.matrixWorld);
    pos.project(camera);

    const halfWidth = window.innerWidth * 0.5;
    const halfHeight = window.innerHeight * 0.5;

    pos.x = (pos.x * halfWidth) + halfWidth;
    pos.y = -(pos.y * halfHeight) + halfHeight;
    pos.z = 0;

    return new Vector2(pos.x, pos.y);
}

/**
 * Return the world direction for the given local direction from the object's perspective.
 * @param localDirection The local direction.
 * @param obj The object to return the world direction for.
 */
export function objectWorldDirection(
    localDirection: Vector3,
    obj: Object3D
): Vector3 {
    const worldRotation = new Quaternion();
    worldRotation.setFromRotationMatrix(obj.matrixWorld);
    const forward = localDirection.clone().applyQuaternion(worldRotation);
    return forward;
}

export function getMaterials(mesh: Mesh): Material[] {
    if (Array.isArray(mesh.material)) {
        return mesh.material;
    } else {
        return [mesh.material];
    }
}

export function getWorldPosition(object3d: Object3D): Vector3 {
    const worldPos = new Vector3();
    object3d.getWorldPosition(worldPos);
    return worldPos;
}

export function setWorldPosition(object3d: Object3D, target: Vector3 | Object3D): void {
    const scene = findParentScene(object3d);

    if (!scene) {
        console.error(`Cannot set world position of object3d ${object3d.name} because it is not attached to a scene.`);
        return;
    }

    let matrixWorld: Matrix4;

    if (target instanceof Vector3) {
        matrixWorld = new Matrix4();
        matrixWorld.setPosition(target);
    } else {
        matrixWorld = target.matrixWorld;
    }

    const prevParent = object3d.parent;
    scene.attach(object3d);
    object3d.position.setFromMatrixPosition(matrixWorld);
    prevParent.attach(object3d);
}

export function rotationToFace(object3d: Object3D, worldPos: Vector3): Quaternion {
    const dummy = new Object3D();

    if (object3d.parent) {
        object3d.parent.add(dummy);
    }

    setWorldPosition(dummy, object3d);
    dummy.rotation.copy(object3d.rotation);
    dummy.scale.copy(object3d.scale);

    dummy.lookAt(worldPos);

    const faceRotation = dummy.quaternion.clone();

    if (dummy.parent) {
        dummy.parent.remove(dummy);
    }

    return faceRotation;
}

/**
 * Same function as Object3D.traverse except that it does not execute on children that have become undefined like the built-in function does.
 */
export function traverseSafe(object3d: Object3D, callback: (object3d: Object3D) => void) {
    callback(object3d);

    const children = object3d.children;
    for (let i = 0, l = children.length; i < l; i++) {
        if (children[i]) {
            traverseSafe(children[i], callback);
        }
    }
}

/**
 * Same function as Object3D.traverseVisible except that it does not execute on children that have become undefined like the built-in function does.
 */
export function traverseVisibleSafe(object3d: Object3D, callback: (object3d: Object3D) => void) {

    if (object3d.visible === false) return;

    callback(object3d);

    const children = object3d.children;
    for (let i = 0, l = children.length; i < l; i++) {
        if (children[i]) {
            traverseVisibleSafe(children[i], callback);
        }
    }
}