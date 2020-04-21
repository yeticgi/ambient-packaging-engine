import { ArgEvent } from '../misc/Events';
export interface IPropertyChangedEvent<T> {
    newValue: T;
    previousValue: T;
}
/**
 * Property Spectator is a simple wrapper object around any javascript value that has events for
 * when it is set/changed as well as polling function for changes.
 */
export declare class PropertySpectator<T> {
    private _value;
    private _prevValue;
    /**
     * Event invoked when the property value is changed.
     */
    onValueChanged: ArgEvent<IPropertyChangedEvent<T>>;
    constructor(value?: T);
    /**
     * The property's current value.
     */
    get value(): T;
    set value(obj: T);
    /**
     * The property's previous value.
     */
    get previousValue(): T;
    /**
     * Does the property currently have a value assigned.
     */
    get hasValue(): boolean;
}
