import { Decorator, APEngine, IDecoratorOptions, GameObject, MeshDecorator } from "@yeticgi/ape";

export class XRRetical extends Decorator {

    static instance: XRRetical | null;

    private _meshDecorator: MeshDecorator;

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

        if (APEngine.isXREnabled()) {
            const gazeHit = APEngine.xrPhysics.gazeRaycast();
            if (gazeHit) {
                this._meshDecorator.mesh.visible = true;
                this.gameObject.position.copy(gazeHit.position);
            }
        } else {
            this._meshDecorator.mesh.visible = false;
        }
    }
}