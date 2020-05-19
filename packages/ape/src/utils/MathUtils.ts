import { Vector3, Vector2, MathUtils } from "three";

export function interpolate(start: number, end: number, t: number, ease?: (t: number) => number): number {
    if (ease) {
        t = ease(t);
    }

    return (1 - t) * start + t * end;
}

export function interpolateClamped(start: number, end: number, t: number, ease?: (t: number) => number): number {
    const value = interpolate(start, end, t, ease);
    return clamp(value, start, end);
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function inRange(value: number, min: number, max: number): boolean {
    if (value <= max && value >= min) {
        return true;
    } else {
        return false;
    }
}

export function clampDegAngle(value: number, min: number, max: number): number {
    if (value < -360)
        value += 360;
    if (value > 360)
        value -= 360;
    return clamp(value, min, max);
}

export function pointOnSphere(center: Vector3, radius: number, rotation: Vector2): Vector3 {
    /*
        Reference: https://stackoverflow.com/questions/11819833/finding-3d-coordinates-from-point-with-known-xyz-angles-radius-and-origin
        x = origin.x + radius * math.cos(math.rad(rotation.y)) * math.cos(math.rad(rotation.x))
        y = origin.y + radius * math.sin(math.rad(rotation.x)) 
        z = origin.z + radius * math.sin(math.rad(rotation.y)) * math.cos(math.rad(rotation.x))
     */

    const pos = new Vector3();
    pos.x = center.x + radius * Math.cos(MathUtils.DEG2RAD * rotation.y) * Math.cos(MathUtils.DEG2RAD * rotation.x);
    pos.y = center.y + radius * Math.sin(MathUtils.DEG2RAD * rotation.x);
    pos.z = center.z + radius * Math.sin(MathUtils.DEG2RAD * rotation.y) * Math.cos(MathUtils.DEG2RAD * rotation.x);

    return pos;
}

export function pointOnCircle(center: Vector2, radius: number, angle: number): Vector2 {
    const angleRad: number = angle * MathUtils.DEG2RAD;

    const point = new Vector2(
        center.x + radius * Math.sin(angleRad),
        center.y + radius * Math.cos(angleRad)
    );

    return point;
}

export function normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

export function normalizeClamped(value: number, min: number, max: number): number {
    value = clamp(value, min, max);
    return (value - min) / (max - min);
}

export function unnormalize(normal: number, min: number, max: number): number {
    return normal * (max - min) + min;
}

export function unnormalizeClamped(normal: number, min: number, max: number): number {
    normal = clamp(normal, 0.0, 1.0);
    return normal * (max - min) + min;
}

export function calculateFrustumPlanes(size: number, aspect: number): { left: number, right: number, top: number, bottom: number } {
    return {
        left: - size * aspect / 2,
        right: size * aspect / 2,
        top: size / 2,
        bottom: - size / 2,
    }
}