import { Decorator, getOptionalValue, APEngine, IDecoratorOptions } from "@yeticgi/ape";

export interface IRotatorOptions extends IDecoratorOptions {
    xSpeed?: number,
    ySpeed?: number,
    zSpeed?: number,
}

export class Rotator extends Decorator {

    xSpeed: number;
    ySpeed: number;
    zSpeed: number;
    enabled: boolean = true;

    configure(options: IRotatorOptions) {
        super.configure(options);

        this.xSpeed = getOptionalValue(options.xSpeed, 0.0);
        this.ySpeed = getOptionalValue(options.ySpeed, 0.0);
        this.zSpeed = getOptionalValue(options.zSpeed, 0.0);
    }

    onUpdate() {
        if (!this.enabled) {
            return;
        }
        
        this.gameObject.rotation.x += this.xSpeed * APEngine.time.deltaTime;
        this.gameObject.rotation.y += this.ySpeed * APEngine.time.deltaTime;
        this.gameObject.rotation.z += this.zSpeed * APEngine.time.deltaTime;
    }
}