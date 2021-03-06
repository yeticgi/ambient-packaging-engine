import {
    Vector2,
    Camera,
    Vector3,
    Ray,
    Raycaster,
    Object3D,
    Intersection,
    Plane,
} from 'three';

/**
 * Container for all custom physics functions for game engine.
 */
export namespace Physics {
    /**
     * Infinite mathematical plane whos normal points up towards the sky.
     */
    export const GroundPlane: Plane = new Plane(new Vector3(0, 1, 0));

    const _Raycaster: Raycaster = new Raycaster();

    /**
     * Defines the result of a raycast.
     */
    export interface RaycastResult {
        /**
         * The screen position used to perform this raycast.
         */
        pointerScreenPos: Vector2;

        /**
         * The ray used to perform this raycast.
         */
        ray: Ray;

        /**
         * The list of intersections from the raycast.
         */
        intersects: Intersection[];
    }

    /**
     * Calculates a ray from the given screen position and camera.
     * @pos The screen position that the ray should use for its direction vector.
     * @camera The camera that the ray should point from.
     */
    export function screenPosToRay(screenPos: Vector2, camera: Camera): Ray {
        _Raycaster.setFromCamera(screenPos, camera);
        return _Raycaster.ray.clone();
    }

    /**
     * Gets a point that is the given distance along the given ray.
     * @param ray The ray.
     * @param distance The distance along the ray from the origin.
     */
    export function pointOnRay(ray: Ray, distance: number): Vector3 {
        let pos = new Vector3(
            ray.direction.x,
            ray.direction.y,
            ray.direction.z
        );
        pos.multiplyScalar(distance);
        pos.add(ray.origin);

        return pos;
    }

    /**
     * Calculates the point at which the given ray intersects the given plane.
     * If the ray does not intersect the plane then null is returned.
     * @param ray The ray.
     * @param plane The plane that the ray should test against.
     */
    export function pointOnPlane(ray: Ray, plane: Plane): Vector3 | null {
        let point = new Vector3();
        point = ray.intersectPlane(plane, point);

        return point;
    }

    /**
     * Performs a raycast at the given screen position with the given camera against the given objects.
     * @param screenPos The screen position to raycast from.
     * @param objects The objects to raycast against.
     * @param camera The camera to use.
     * @param recursive — If true, it also checks all descendants of the objects. Otherwise it only checks intersecton with the objects. Default is false.
     */
    export function raycastAtScreenPos(
        screenPos: Vector2,
        objects: Object3D[],
        camera: Camera,
        recursive?: boolean
    ): RaycastResult {
        _Raycaster.setFromCamera(screenPos, camera);
        const intersects = _Raycaster.intersectObjects(objects, recursive);

        return {
            pointerScreenPos: screenPos,
            ray: _Raycaster.ray.clone(),
            intersects,
        };
    }

    /**
     * Performs a raycast with the given ray against the given objects.
     * @param ray The ray to use.
     * @param objects The objects to raycast against.
     * @param recursive — If true, it also checks all descendants of the objects. Otherwise it only checks intersecton with the objects. Default is false.
     */
    export function raycast(ray: Ray, objects: Object3D[], recursive?: boolean): RaycastResult {
        _Raycaster.set(ray.origin, ray.direction);
        const intersects = _Raycaster.intersectObjects(objects, recursive);

        return {
            pointerScreenPos: null,
            ray: _Raycaster.ray.clone(),
            intersects,
        };
    }

    /**
     * Returns the first intersection from the raycast test. If none exist, then null is returned.
     */
    export function firstRaycastHit(result: RaycastResult) {
        return result.intersects.length > 0 ? result.intersects[0] : null;
    }
}
