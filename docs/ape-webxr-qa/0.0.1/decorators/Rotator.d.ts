import { Decorator, IDecoratorOptions } from "@yeticgi/ape";
export interface IRotatorOptions extends IDecoratorOptions {
    xSpeed?: number;
    ySpeed?: number;
    zSpeed?: number;
}
export declare class Rotator extends Decorator {
    xSpeed: number;
    ySpeed: number;
    zSpeed: number;
    enabled: boolean;
    configure(options: IRotatorOptions): void;
    onUpdate(): void;
}
