import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { IDisposable } from "./IDisposable";
import { ArgEvent } from "../misc/Events";
import { Vector3, Euler, MathUtils } from "three";

const VectorFields: string[] = ['x', 'y', 'z'];

export class TransformControlsGUI implements IDisposable {
    private _controls: TransformControls;
    private _rootEl: HTMLDivElement;

    onUnselectClick: ArgEvent<TransformControlsGUI> = new ArgEvent();

    constructor(controls: TransformControls) {
        this._controls = controls;

        this._controlsChange = this._controlsChange.bind(this);
        this._controlsObjectChange = this._controlsObjectChange.bind(this);

        this._controls.addEventListener('change', this._controlsChange);
        this._controls.addEventListener('objectChange', this._controlsObjectChange);

        // Create the gui.
        this._rootEl = document.createElement('div');
        document.body.appendChild(this._rootEl);
        this._rootEl.id = 'transform-controls-gui';

        this._rootEl.style.position = 'fixed';
        this._rootEl.style.right = '0';
        this._rootEl.style.bottom = '0'
        this._rootEl.style.minWidth = '250px';
        this._rootEl.style.maxWidth = '50%';
        this._rootEl.style.backgroundColor = '#333';
        this._rootEl.style.color = '#fff';
        this._rootEl.style.fontFamily = "Courier New";
        this._rootEl.style.padding = '4px';
        this._rootEl.style.fontSize = '14px';

        this._addHeader('Object Name');
        this._addParagraph('object-name');
        this._addSpacer();
        this._addHeader('Local Position');
        this._addVector3('local-position', (vector) => {
            this._controls.object.position.copy(vector);
        });
        this._addSpacer();
        this._addHeader('Local Rotation');
        this._addVector3('local-rotation', (vector) => {
            const rad = vector.clone().multiplyScalar(MathUtils.DEG2RAD);
            this._controls.object.rotation.setFromVector3(rad);
        });
        this._addSpacer();
        this._addHeader('Local Scale');
        this._addVector3('local-scale', (vector) => {
            this._controls.object.scale.copy(vector);
        });
        this._addSpacer();
        this._addHeader('Transform Mode');
        this._addButtonRow([
            {
                 text: 'Translate',
                 callback: (e) => {
                    this._controls.setMode('translate');
                 }
            },
            {
                 text: 'Rotate',
                 callback: (e) => {
                    this._controls.setMode('rotate');
                 }
            },
            {
                 text: 'Scale',
                 callback: (e) => {
                    this._controls.setMode('scale');
                 }
            },
        ]);
        this._addSpacer();
        this._addHeader('Transform Space');
        this._addButtonRow([
            {
                 text: 'Local',
                 callback: (e) => {
                    this._controls.setSpace('local');
                 }
            },
            {
                 text: 'World',
                 callback: (e) => {
                    this._controls.setSpace('world');
                 }
            },
        ]);
        this._addSpacer('24px');
        this._addButton('Unselect Object', (e) => {
            this.onUnselectClick.invoke(this);
        });

        this.refresh();
    }

    private _addHeader(title: string): void {
        const headerEl = document.createElement('div');
        this._rootEl.appendChild(headerEl);

        headerEl.style.backgroundColor = '#555';
        headerEl.style.width = '100%';
        headerEl.style.textAlign = 'left';
        headerEl.style.letterSpacing = '1px';
        headerEl.style.padding = '4px';
        headerEl.style.boxSizing = 'border-box';
        headerEl.textContent = title;
    }

    private _addSpacer(height?: string): void {
        const spacerEl = document.createElement('div');
        this._rootEl.appendChild(spacerEl);

        spacerEl.style.height = height ?? '16px';
    }

    private _addParagraph(id: string): void {
        const paragraphEl = document.createElement('p');
        this._rootEl.appendChild(paragraphEl);
        paragraphEl.id = id;

        paragraphEl.style.boxSizing = 'border-box';
        paragraphEl.style.margin = '4px 4px 0px 4px';
    }

    private _refreshParagraph(id: string, text: string): void {
        const paragraphEl = document.querySelector(`#${id}`) as HTMLParamElement;
        if (paragraphEl) {
            paragraphEl.textContent = text;
        }
    }

    private _addButton(text: string, callback: (e: MouseEvent) => void): void {
        const buttonEl = document.createElement('button');
        this._rootEl.appendChild(buttonEl);
        
        buttonEl.style.width = '100%';
        buttonEl.style.fontSize = '14px';

        buttonEl.textContent = text;
        buttonEl.onclick = (e) => callback(e);
    }

    private _addButtonRow(configs: { text: string, callback: (e: MouseEvent) => void }[]): void {
        const rowEl = document.createElement('div');
        this._rootEl.appendChild(rowEl);
        rowEl.style.display = 'flex';
        rowEl.style.flexDirection = 'row';

        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];

            const buttonEl = document.createElement('button');
            rowEl.appendChild(buttonEl);

            buttonEl.style.width = '100%';
            buttonEl.style.fontSize = '14px';

            buttonEl.textContent = config.text;
            buttonEl.onclick = (e) => config.callback(e);
        }
    }

    private _addVector3(id: string, callback: (vector: Vector3) => void): void {
        const vectorEl = document.createElement('div');
        this._rootEl.appendChild(vectorEl);
        vectorEl.id = id;

        vectorEl.style.display = 'flex';
        vectorEl.style.flexDirection = 'row';

        for (let i = 0; i < VectorFields.length; i++) {
            const field = VectorFields[i];

            const labelEl = document.createElement('label');
            vectorEl.appendChild(labelEl);
            labelEl.htmlFor = field;
            labelEl.textContent = `${field.toUpperCase()}:`;

            const inputEl = document.createElement('input');
            vectorEl.appendChild(inputEl);
            inputEl.type = 'number';
            inputEl.onchange = () => callback(this._getVector3(id));
            inputEl.style.width = '75px';
            inputEl.id = field;
            inputEl.name = field;
        }
    }

    private _getVector3(id: string): Vector3 {
        const vectorEl = document.querySelector(`#${id}`);
        if (vectorEl) {
            const vector = new Vector3();
            for (let i = 0; i < VectorFields.length; i++ ) {
                const field = VectorFields[i];

                const inputEl = vectorEl.querySelector(`#${field}`) as HTMLInputElement;
                vector.setComponent(i, Number.parseFloat(inputEl.value));
            }

            return vector;
        }

        return null;
    }

    private _refreshVector3(id: string, vector: Vector3): void {
        const vectorEl = document.querySelector(`#${id}`);
        if (vectorEl) {
            for (let i = 0; i < VectorFields.length; i++ ) {
                const field = VectorFields[i];

                const inputEl = vectorEl.querySelector(`#${field}`) as HTMLInputElement;
                inputEl.value = vector.getComponent(i).toFixed(3);
            }
        }
    }

    refresh(): void {
        if (!this._rootEl) {
            return;
        }

        this._refreshParagraph('object-name', this._controls.object.name);
        this._refreshVector3('local-position', this._controls.object.position);
        this._refreshVector3('local-rotation', new Vector3(
            this._controls.object.rotation.x * MathUtils.RAD2DEG,
            this._controls.object.rotation.y * MathUtils.RAD2DEG,
            this._controls.object.rotation.z * MathUtils.RAD2DEG
        ));
        this._refreshVector3('local-scale', this._controls.object.scale);
    }
    
    private _controlsChange(): void {
        this.refresh();
    }

    private _controlsObjectChange(): void {
        this.refresh();
    }

    dispose(): void {
        this._controls.removeEventListener('change', this._controlsChange);
        this._controls.removeEventListener('objectChange', this._controlsObjectChange);
        if (this._rootEl) {
            this._rootEl.remove();
            this._rootEl = null;
        }
    }
}