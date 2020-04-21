import { Decorator, IDecoratorOptions } from './Decorator';
import { Mesh } from 'three';
import { GameObject } from '../GameObject';
export interface IMeshDecoratorOptions extends IDecoratorOptions {
    mesh: Mesh;
}
export declare class MeshDecorator extends Decorator {
    mesh: Mesh;
    configure(options: IMeshDecoratorOptions): void;
    onAttach(gameObject: GameObject): void;
    onStart(): void;
    onDestroy(): void;
}
