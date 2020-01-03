import { 
    Decorator,
    getOptionalValue,
    APEngine,
    MeshDecorator,
    IDecoratorOptions,
    MouseButtonId,
    Physics,
    findParentGameObject
 } from "@yeticgi/ape";
import { Rotator } from "./Rotator";

export class TestClick extends Decorator {

    private _down: boolean;

    configure(options: IDecoratorOptions) {
        super.configure(options);
    }

    onUpdate() {
        if (APEngine.input.getMouseButtonDown(MouseButtonId.Left)) {
            const screenPos = APEngine.input.getMouseScreenPos();
            const results = Physics.raycastAtScreenPos(screenPos, [this.gameObject], APEngine.camera);
            const firstHit = Physics.firstRaycastHit(results);

            if (firstHit) {
                const hitGameObject = findParentGameObject(firstHit.object);

                if (hitGameObject === this.gameObject) {
                    this._down = true;
                }
            }
        }

        if (APEngine.input.getMouseButtonUp(MouseButtonId.Left) && this._down) {
            const screenPos = APEngine.input.getMouseScreenPos();
            const results = Physics.raycastAtScreenPos(screenPos, [this.gameObject], APEngine.camera);
            const firstHit = Physics.firstRaycastHit(results);

            if (firstHit) {
                const hitGameObject = findParentGameObject(firstHit.object);

                if (hitGameObject === this.gameObject) {
                    this.clicked();
                }
            }

            this._down = false;
        }
    }

    private clicked() {
        console.log(`[TestClick] clicked on ${this.gameObject.name}`);

        const rotator = this.gameObject.getDecorator<Rotator>(Rotator);
        if (rotator) {
            rotator.enabled = !rotator.enabled;
        }
    }
}