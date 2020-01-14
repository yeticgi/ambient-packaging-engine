import { Decorator, IDecoratorOptions } from './Decorator';
import { Mesh } from 'three';
import { GameObject } from '../GameObject';

export interface IMeshDecoratorOptions extends IDecoratorOptions {
    mesh: Mesh
}

export class MeshDecorator extends Decorator {

    mesh: Mesh;

    configure(options: IMeshDecoratorOptions) {
        super.configure(options);

        this.mesh = options.mesh;
    }

    onAttach(gameObject: GameObject) {
        super.onAttach(gameObject);

        this.gameObject.add(this.mesh);
    }

    onStart() {
        super.onStart();
    }

    onDestroy() {
        super.onDestroy();
        
        this.gameObject.remove(this.mesh);
    }
}