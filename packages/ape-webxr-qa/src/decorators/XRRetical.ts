import { Decorator, getOptionalValue, APEngine, IDecoratorOptions, XRPhysics, GameObject, MeshDecorator } from "@yeticgi/ape";
import { Vector3 } from 'three';

export class XRRetical extends Decorator {

    static instance: XRRetical | null;

    private _meshDecorator: MeshDecorator;
    private _raycasting: boolean;

    get isVisible() {
        return this._meshDecorator.mesh.visible;
    }

    configure(options: IDecoratorOptions) {
        super.configure(options);
    }

    onAttach(gameObject: GameObject) {
        super.onAttach(gameObject);

        XRRetical.instance = this;
    }

    onStart() {
        super.onStart();

        this._meshDecorator = this.gameObject.getDecorator(MeshDecorator);
        if (!this._meshDecorator) {
            console.error(`[XRRetical] Missing reference to MeshDecorator on GameObject ${this.gameObject.name}.`);
        }

        this._meshDecorator.mesh.visible = false;
    }

    onDestroy() {
        super.onDestroy();

        if (XRRetical.instance === this) {
            XRRetical.instance = null;
        }
    }

    onUpdate() {
        super.onUpdate();

        const xrEnabled = APEngine.isXREnabled();

        if (xrEnabled && !this._raycasting) {
            this._raycasting = true;
            const raycastPromise = XRPhysics.gazeRaycast(APEngine.webglRenderer, APEngine.getXRFrame());

            raycastPromise
                .then((gazeHit) => {
                if (gazeHit) {
                    this._meshDecorator.mesh.visible = true;
                    this.gameObject.position.copy(gazeHit.position);
                } else {
                }

                this._raycasting = false;
                })
                .catch((reason) => {
                    console.warn(`[XRRetical] gaze failed: ${reason}`);
                    this._raycasting = false;
                });
        } else {
            this._meshDecorator.mesh.visible = false;
        }
    }
}