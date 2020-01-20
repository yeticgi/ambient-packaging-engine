import { Vector3, Vector2, Math as ThreeMath } from "three";

export function getOptionalValue(obj: any, defaultValue: any): any {
    return obj !== undefined && obj !== null ? obj : defaultValue;
}

export function lerp(start: number, end: number, t: number): number {
    return (1.0 - t) * start + t * end;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function clampDegAngle(value: number, min: number, max: number): number {
    if (value < -360)
        value += 360;
    if (value > 360)
        value -= 360;
    return clamp(value, min, max);
}

export function pointOnSphere (center: Vector3, radius: number, rotation: Vector2) {
    /*
        Reference: https://stackoverflow.com/questions/11819833/finding-3d-coordinates-from-point-with-known-xyz-angles-radius-and-origin
        x = origin.x + radius * math.cos(math.rad(rotation.y)) * math.cos(math.rad(rotation.x))
        y = origin.y + radius * math.sin(math.rad(rotation.x)) 
        z = origin.z + radius * math.sin(math.rad(rotation.y)) * math.cos(math.rad(rotation.x))
     */

     const pos = new Vector3();
     pos.x = center.x + radius * Math.cos(ThreeMath.DEG2RAD * rotation.y) * Math.cos(ThreeMath.DEG2RAD * rotation.x);
     pos.y = center.y + radius * Math.sin(ThreeMath.DEG2RAD * rotation.x);
     pos.z = center.z + radius * Math.sin(ThreeMath.DEG2RAD * rotation.y) * Math.cos(ThreeMath.DEG2RAD * rotation.x);

     return pos;
}

export function normalize(value: number, min: number, max: number): number {
    value = clamp(value, min, max);
    return (value - min) / (max - min);
}

export function unnormalize(normal: number, min: number, max: number): number {
    normal = clamp(normal, 0.0, 1.0);
    return normal * (max - min) + min;
}

/**
 * Post the given data object as JSON to the provided URL.
 * @returns - Promise that resolves to a Response or null if an exception occured.
 */
export async function postJsonData(url: string, data: any): Promise<Response> {
    console.log(`[postJsonData] start...`);

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const init: RequestInit = {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'cors',
        headers: headers,

    }

    const request = new Request(url, init);
    console.log(request);

    try {
        // Until aux is CORS enabled, the response will always be opaque and thus checking the response for anything is pointless.
        const response = await fetch(request);
        console.log(`[postJsonData] response received.`);
        return response;
    } catch (error) {
        console.error(`[postJsonData] Could not fetch. error: ${error}`);
        return null;
    }
}