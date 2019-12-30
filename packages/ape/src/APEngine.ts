import { IDisposable } from "./IDisposable";
import { ThreeManager } from "./three/ThreeManager";

export class APEngine implements IDisposable {

    public threeManager: ThreeManager;
    
    constructor(appElement: HTMLDivElement, threeCanvasParent: HTMLDivElement) {
        this.threeManager = new ThreeManager(appElement, threeCanvasParent);
    }

    dispose(): void {
        console.log("[APEngine] Dispose");
    }
}