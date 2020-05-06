import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { IDisposable } from "./IDisposable";
import { ArgEvent } from "../misc/Events";
export declare class TransformControlsGUI implements IDisposable {
    private _controls;
    private _rootEl;
    onUnselectClick: ArgEvent<TransformControlsGUI>;
    constructor(controls: TransformControls);
    private _addHeader;
    private _addSpacer;
    private _addParagraph;
    private _setParagraph;
    private _addButton;
    private _addButtonRow;
    private _addVector3;
    private _setVector3;
    refresh(): void;
    private _controlsChange;
    private _controlsObjectChange;
    dispose(): void;
}
