import { Decorator, getOptionalValue, APEngine, IDecoratorOptions } from "@yeticgi/ape";
import { Vector3 } from 'three';
import { XRRetical } from './XRRetical';

export class XRMoveToRetical extends Decorator {

    private _nonXrPosition: Vector3;

    configure(options: IDecoratorOptions) {
        super.configure(options);
    }

    onStart() {
        super.onStart();

        this._nonXrPosition = this.gameObject.position.clone();

        this._onSelect = this._onSelect.bind(this);

        APEngine.xrInput.onSelect.addListener(this._onSelect);
    }

    onDestroy() {
        super.onDestroy();
    }

    onUpdate() {
        super.onUpdate();

        if (!APEngine.isXREnabled()) {
            this.gameObject.position.copy(this._nonXrPosition);
        }
    }

    private _onSelect() {
        const retical = XRRetical.instance;
        if (retical) {
            this.gameObject.position.copy(retical.gameObject.position);
        }
    }
}