import { Vector3, Vector2 } from "three";
export declare const Vector3_Up: Vector3;
export declare const Vector3_Down: Vector3;
export declare const Vector3_Forward: Vector3;
export declare const Vector3_Back: Vector3;
export declare const Vector3_Left: Vector3;
export declare const Vector3_Right: Vector3;
export declare const Vector3_Zero: Vector3;
export declare const Vector3_One: Vector3;
export declare function interpolate(start: number, end: number, progress: number, ease?: (t: number) => number): number;
export declare function interpolateClamped(start: number, end: number, progress: number, ease?: (t: number) => number): number;
export declare function clamp(value: number, min?: number, max?: number): number;
export declare function inRange(value: number, min: number, max: number): boolean;
export declare function isEven(value: number): boolean;
export declare function isOdd(value: number): boolean;
export declare function clampDegAngle(value: number, min: number, max: number): number;
export declare function pointOnSphere(center: Vector3, radius: number, rotation: Vector2): Vector3;
export declare function pointOnCircle(center: Vector2, radius: number, angle: number): Vector2;
/**
 * Tests if point is inside the given polygon. Test is done in 2d space.
 * Reference: https://codepen.io/prisoner849/pen/ROdXzw?editors=1010
 */
export declare function pointInPolygon2D(point: Vector2, polyPoints: Vector2[]): boolean;
export declare function calculateRowOffsets(rowLength: number, cellWidth: number, alignment: 'start' | 'center' | 'end'): number[];
export declare function normalize(value: number, min: number, max: number): number;
export declare function normalizeClamped(value: number, min: number, max: number): number;
export declare function unnormalize(normal: number, min: number, max: number): number;
export declare function unnormalizeClamped(normal: number, min: number, max: number): number;
export declare function calculateFrustumPlanes(size: number, aspect: number): {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
/**
 * Split integer number into an array of mostly equal parts.
 * @example
 * splitInteger(10, 3) // [4, 3, 3]
 * splitInteger(142, 5) // [29, 29, 28, 28, 28]
 */
export declare function splitInteger(num: number, parts: number): number[];
