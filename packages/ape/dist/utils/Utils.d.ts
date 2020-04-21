import { Vector3, Vector2 } from "three";
export declare function hasValue(obj: any): boolean;
export declare function getOptionalValue(obj: any, defaultValue: any): any;
export declare function lerp(start: number, end: number, t: number): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function inRange(value: number, min: number, max: number): boolean;
export declare function clampDegAngle(value: number, min: number, max: number): number;
export declare function pointOnSphere(center: Vector3, radius: number, rotation: Vector2): Vector3;
export declare function pointOnCircle(center: Vector2, radius: number, angle: number): Vector2;
export declare function normalize(value: number, min: number, max: number): number;
export declare function normalizeClamped(value: number, min: number, max: number): number;
export declare function unnormalize(normal: number, min: number, max: number): number;
export declare function unnormalizeClamped(normal: number, min: number, max: number): number;
/**
 * Post the given data object as JSON to the provided URL.
 * @returns - Promise that resolves to a Response or null if an exception occured.
 */
export declare function postJsonData(url: string, data: any): Promise<Response>;
/**
 * Search through element's descendents and return the first child element that contains the given class name(s).
 * An element must contain all of the given class names in order to be matched.
 * @param element The element to search the descendents of.
 * @param className The class name(s) to search for. Can be either a single class name or many.
 */
export declare function getElementByClassName(element: Element, names: string): HTMLElement;
export declare function getFilename(path: string): string | null;
export declare function getExtension(path: string): string | null;
