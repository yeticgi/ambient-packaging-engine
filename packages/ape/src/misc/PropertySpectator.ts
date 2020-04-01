import { ArgEvent } from '../misc/Events';
import isEqual from 'lodash/isEqual';

export interface IPropertyChangedEvent<T> {
    newValue: T;
    previousValue: T;
}

/**
 * Property Spectator is a simple wrapper object around any javascript value that has events for 
 * when it is set/changed as well as polling function for changes.
 */
export class PropertySpectator<T> {
    private _value: T = null;
    private _prevValue: T = null;

    /**
     * Event invoked when the property value is changed.
     */
    onValueChanged: ArgEvent<IPropertyChangedEvent<T>> = new ArgEvent();
    
    constructor(value?: T) {
        this._value = value;
    }

    /**
     * The property's current value.
     */
    get value(): T {
        return this._value;
    }

    set value(obj: T) {
        if (!isEqual(this._value, obj)) {
            this._prevValue = this._value;
            this._value = obj;

            this.onValueChanged.invoke({
                newValue: this._value,
                previousValue: this._prevValue
            });
        }
    }

    /**
     * The property's previous value.
     */
    get previousValue(): T {
        return this._prevValue;
    }

    /**
     * Does the property currently have a value assigned.
     */
    get hasValue(): boolean {
        return (this._value !== null && this._value !== undefined);
    }
}