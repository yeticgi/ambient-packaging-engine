import { IDisposable } from "./IDisposable";
import { ThreeManager } from "./three/ThreeManager";

export class APEngine implements IDisposable {

    public threeManager: ThreeManager;
    
    constructor(threeCanvasParent: HTMLDivElement) {
        this.threeManager = new ThreeManager(threeCanvasParent);
    }

    dispose(): void {
        console.log("[APEngine] Dispose");
    }
}