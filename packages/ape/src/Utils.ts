import {
    Object3D,
    Scene,
    Matrix4,
    Box2,
    Vector2,
    Box3,
    Layers,
    BufferGeometry,
    Material,
    Geometry,
    Math as ThreeMath,
} from 'three';

export function getOptionalValue(obj: any, defaultValue: any): any {
    return obj !== undefined && obj !== null ? obj : defaultValue;
}

/**
 * Returns a promise that waits for the given condition function to return true.
 * If the condition function returns false, it will continue to be called at a regular interval until
 * the condition function returns true.
 * @param condition A function that must return true in order for the promise to resolve.
 * @param timeout An optional timeout value. Must be greater than 0. If condition is not met before timeout (ms), then the promise is rejected. Will default to 10 seconds (10000ms) by default. If you want a different timeout, you must provide a value. 
 * @param tickRate A optiona tick rate value. Must be greater than 0. How frequently the condition function should be called (in ms).
 */
export async function waitForCondition(condition: () => boolean, timeout?: number, tickRate?: number): Promise<void> {
    if (typeof tickRate !== 'number' || tickRate <= 0) {
        tickRate = 30;
    }

    if (typeof timeout !== 'number' || timeout <= 0) {
        timeout = 10000;
    }

    return new Promise<void>((resolve, reject) => {
        let tickTimeoutId: number;
        let timeoutId: number;

        const tick = () => {
            if (condition()) {
                window.clearTimeout(tickTimeoutId);
                window.clearTimeout(timeoutId);
                return resolve();
            } else {
                tickTimeoutId = window.setTimeout(tick, tickRate);
            }
        };

        tick();

        if (typeof timeout === 'number' && timeout > 0) {
            timeoutId = window.setTimeout(() => {
                // Timeout reached before promise was able to resolve.
                window.clearTimeout(tickTimeoutId);
                
                // Check for condition one last time in last ditch effort to resolve.
                if (condition()) {
                    return resolve();
                } else {
                    return reject('Timeout occured before condition could be met.');
                }
            }, timeout);
        }
    });
}

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
        object3d.applyMatrix(object3d.parent.matrixWorld);
        object3d.parent.remove(object3d);
        scene.add(object3d);
    }

    // Attach
    if (parent) {
        object3d.applyMatrix(new Matrix4().getInverse(parent.matrixWorld));
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

/**
 * Disposes the given material(s).
 * @param material The material(s) to dispose.
 */
export function disposeMaterial(material: Material | Material[]) {
    if (!material) return;
    if (Array.isArray(material)) {
        material.forEach(m => m.dispose());
    } else {
        material.dispose();
    }
}

/**
 * Releases any unmanaged resources used by the given mesh.
 * @param mesh The mesh to dispose.
 * @param disposeGeometry Whether to dispose the mesh's geometry. Default true.
 * @param disposeMat Whether to dispose the mesh's material(s). Default true.
 */
export function disposeMesh(
    mesh: {
        geometry: Geometry | BufferGeometry;
        material: Material | Material[];
    },
    disposeGeometry: boolean = true,
    disposeMat: boolean = true
) {
    if (!mesh) return;
    if (disposeGeometry) {
        mesh.geometry.dispose();
    }
    if (disposeMat) {
        disposeMaterial(mesh.material);
    }
}

export function disposeObject3D(
    object3d: Object3D,
    disposeGeometry: boolean = true,
    disposeMaterial: boolean = true
) {
    if (!object3d) return;

    if (disposeGeometry) {
        let geometry = (<any>object3d).geometry;
        if (geometry) {
            geometry.dispose();
        }
    }

    if (disposeMaterial) {
        let material = (<any>object3d).material;
        if (material) {
            if (Array.isArray(material)) {
                for (let i = 0; i < material.length; i++) {
                    material[i].dispose();
                }
            } else {
                material.dispose();
            }
        }
    }
}