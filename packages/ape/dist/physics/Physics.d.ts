import { Vector2, Camera, Vector3, Ray, Object3D, Intersection, Plane } from 'three';
/**
 * Container for all custom physics functions for game engine.
 */
export declare namespace Physics {
    /**
     * Infinite mathematical plane whos normal points up towards the sky.
     */
    const GroundPlane: Plane;
    /**
     * Defines the result of a raycast.
     */
    interface RaycastResult {
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
    function screenPosToRay(screenPos: Vector2, camera: Camera): Ray;
    /**
     * Gets a point that is the given distance along the given ray.
     * @param ray The ray.
     * @param distance The distance along the ray from the origin.
     */
    function pointOnRay(ray: Ray, distance: number): Vector3;
    /**
     * Calculates the point at which the given ray intersects the given plane.
     * If the ray does not intersect the plane then null is returned.
     * @param ray The ray.
     * @param plane The plane that the ray should test against.
     */
    function pointOnPlane(ray: Ray, plane: Plane): Vector3 | null;
    /**
     * Performs a raycast at the given screen position with the given camera against the given objects.
     * @param screenPos The screen position to raycast from.
     * @param objects The objects to raycast against.
     * @param camera The camera to use.
     * @param recursive — If true, it also checks all descendants of the objects. Otherwise it only checks intersecton with the objects. Default is false.
     */
    function raycastAtScreenPos(screenPos: Vector2, objects: Object3D[], camera: Camera, recursive?: boolean): RaycastResult;
    /**
     * Performs a raycast with the given ray against the given objects.
     * @param ray The ray to use.
     * @param objects The objects to raycast against.
     * @param recursive — If true, it also checks all descendants of the objects. Otherwise it only checks intersecton with the objects. Default is false.
     */
    function raycast(ray: Ray, objects: Object3D[], recursive?: boolean): RaycastResult;
    /**
     * Returns the first intersection from the raycast test. If none exist, then null is returned.
     */
    function firstRaycastHit(result: RaycastResult): Intersection;
}
