import { 
    Decorator,
    getOptionalValue,
    APEngine,
    MeshDecorator,
    IDecoratorOptions,
    MouseButtonId,
    Physics,
    GameObject,
    APEResources
} from "@yeticgi/ape";
import { Rotator } from "./Rotator";

export class TestClick extends Decorator {

    private _down: boolean;

    configure(options: IDecoratorOptions) {
        super.configure(options);
    }

    onAttach(gameObject: GameObject) {
        super.onAttach(gameObject);
    }

    onUpdate() {
        if (APEngine.input.getMouseButtonDown(MouseButtonId.Left)) {
            const screenPos = APEngine.input.getMouseScreenPos();
            const results = Physics.raycastAtScreenPos(screenPos, [this.gameObject], APEngine.sceneManager.primaryCamera, true);
            const firstHit = Physics.firstRaycastHit(results);

            if (firstHit) {
                const hitGameObject = GameObject.findParentGameObject(firstHit.object);

                if (hitGameObject === this.gameObject) {
                    this._down = true;
                }
            }
        }

        if (APEngine.input.getMouseButtonUp(MouseButtonId.Left) && this._down) {
            const screenPos = APEngine.input.getMouseScreenPos();
            const results = Physics.raycastAtScreenPos(screenPos, [this.gameObject], APEngine.sceneManager.primaryCamera, true);
            const firstHit = Physics.firstRaycastHit(results);

            if (firstHit) {
                const hitGameObject = GameObject.findParentGameObject(firstHit.object);

                if (hitGameObject === this.gameObject) {
                    this.clicked();
                }
            }

            this._down = false;
        }
    }

    onDestroy() {
    }

    private clicked() {
        const rotator = this.gameObject.getDecorator(Rotator);
        if (rotator) {
            rotator.enabled = !rotator.enabled;
        }
        
        APEResources.audio.get('cubeTap').then(
            resource => resource.object.play()
        );
    }
}