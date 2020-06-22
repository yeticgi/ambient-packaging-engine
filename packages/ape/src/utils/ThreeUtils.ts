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
    Vector3
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
        obj.traverse(child => {
            child.layers.set(layer);
        });
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
        obj.traverse(child => {
            child.layers.mask = layerMask;
        });
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
        obj.traverse((o) => {
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

export function getMaterials(mesh: Mesh): Material[] {
    if (Array.isArray(mesh.material)) {
        return mesh.material;
    } else {
        return [mesh.material];
    }
}