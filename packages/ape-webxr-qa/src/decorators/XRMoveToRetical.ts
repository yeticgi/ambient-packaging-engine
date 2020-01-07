import { Decorator, getOptionalValue, APEngine, IDecoratorOptions, MeshDecorator } from "@yeticgi/ape";
import { Vector3, Object3D } from 'three';
import { XRRetical } from './XRRetical';

export class XRMoveToRetical extends Decorator {

    private _nonXrPosition: Vector3;

    configure(options: IDecoratorOptions) {
        super.configure(options);

        this._onXRStarted = this._onXRStarted.bind(this);
        this._onXREnded = this._onXREnded.bind(this);

        APEngine.onXRSessionStarted.addListener(this._onXRStarted);
        APEngine.onXRSessionEnded.addListener(this._onXREnded);
    }

    onStart() {
        super.onStart();

        this._nonXrPosition = this.gameObject.position.clone();

        this._onSelect = this._onSelect.bind(this);

        APEngine.xrInput.onSelect.addListener(this._onSelect);
    }

    onDestroy() {
        super.onDestroy();

        APEngine.onXRSessionStarted.removeListener(this._onXRStarted);
        APEngine.onXRSessionEnded.removeListener(this._onXREnded);
    }

    onUpdate() {
        super.onUpdate();

        if (!APEngine.isXREnabled()) {
            this.gameObject.position.copy(this._nonXrPosition);
        }
    }

    private _onXRStarted() {
        // Hide objects when xr starts up.
        this._setMeshesVisible(false);
    }

    private _onXREnded() {
        // Make sure objects are visible when XR has ended.
        this._setMeshesVisible(true);
    }

    private _onSelect() {
        const retical = XRRetical.instance;
        if (retical) {
            this.gameObject.position.copy(retical.gameObject.position);
            this._setMeshesVisible(true);
        }
    }

    private _setMeshesVisible(visible: boolean) {
        const meshDecorators = this.gameObject.getDecoratorsInChildren(MeshDecorator, true);
        if (meshDecorators) {
            meshDecorators.forEach((meshDec) => {
                meshDec.mesh.visible = visible;
            });
        }
    }
}