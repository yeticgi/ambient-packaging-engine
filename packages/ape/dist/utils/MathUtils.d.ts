import { Vector3, Vector2 } from "three";
export declare function interpolate(start: number, end: number, t: number, ease?: (t: number) => number): number;
export declare function interpolateClamped(start: number, end: number, t: number, ease?: (t: number) => number): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function inRange(value: number, min: number, max: number): boolean;
export declare function clampDegAngle(value: number, min: number, max: number): number;
export declare function pointOnSphere(center: Vector3, radius: number, rotation: Vector2): Vector3;
export declare function pointOnCircle(center: Vector2, radius: number, angle: number): Vector2;
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
