import { Vector3, Vector2, MathUtils } from "three";
import { hasValue } from "./MiscUtils";

export const Vector3_Up = new Vector3(0, 1, 0);
export const Vector3_Down = new Vector3(0, -1, 0);
export const Vector3_Forward = new Vector3(0, 0, 1);
export const Vector3_Back = new Vector3(0, 0, -1);
export const Vector3_Left = new Vector3(-1, 0, 0);
export const Vector3_Right = new Vector3(1, 0, 0);
export const Vector3_Zero = new Vector3(0, 0, 0);
export const Vector3_One = new Vector3(1, 1, 1);

export function interpolate(start: number, end: number, progress: number, ease?: (t: number) => number): number {
    if (ease) {
        progress = ease(progress);
    }

    return (1 - progress) * start + progress * end;
}

export function interpolateClamped(start: number, end: number, progress: number, ease?: (t: number) => number): number {
    const value = interpolate(start, end, progress, ease);
    return clamp(value, start, end);
}

export function clamp(value: number, min?: number, max?: number): number {
    if (hasValue(min) && value < min) {
        value = min;
    }
    if (hasValue(max) && value > max) {
        value = max;
    }

    return value;
}

export function inRange(value: number, min: number, max: number): boolean {
    if (value <= max && value >= min) {
        return true;
    } else {
        return false;
    }
}

export function isEven(value: number): boolean {
    return value % 2 === 0;
}

export function isOdd(value: number): boolean {
    return !isEven(value);
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

/**
 * Tests if point is inside the given polygon. Test is done in 2d space.
 * Reference: https://codepen.io/prisoner849/pen/ROdXzw?editors=1010
 */
export function pointInPolygon2D(point: Vector2, polyPoints: Vector2[]): boolean {

    const x = point.x;
    const y = point.y;

    let inside = false;
    for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        let xi = polyPoints[i].x,
            yi = polyPoints[i].y;
        let xj = polyPoints[j].x,
            yj = polyPoints[j].y;

        let intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

export function calculateRowOffsets(rowLength: number, cellWidth: number, alignment: 'start' | 'center' | 'end'): number[] {
    if (rowLength <= 0) {
        return [];
    }

    const totalWidth: number = (rowLength - 1) * cellWidth;

    // Our start x and offset will be different based on which how we want to align the children.
    let startX: number;
    let offset: number;
    if (alignment == 'start') {
        startX = 0;
        offset = -cellWidth;
    } else if (alignment == 'center') {
        startX = -(totalWidth * 0.5);
        offset = cellWidth;
    } else {
        startX = 0;
        offset = cellWidth;
    }

    const rowOffsets: number[] = [];
    for (let i = 0; i < rowLength; i++) {
        rowOffsets.push(
            startX + (offset * i)
        );
    }

    return rowOffsets;
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