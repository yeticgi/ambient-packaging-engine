import { Vector2, Vector3 } from 'three';
import { Time } from '../Time';
import { IDisposable } from '../misc/IDisposable';
interface IOptions {
    time: Time;
    inputElement: HTMLElement;
    canvasElement: HTMLCanvasElement;
    getUIHtmlElements(): HTMLElement[];
}
export declare class Input implements IDisposable {
    /**
     * Debug level for Input class.
     * 0: Disabled, 1: Down/Up events, 2: Move events
     */
    debugLevel: number;
    private _mouseData;
    private _touchData;
    private _keyData;
    private _touchListenerCounts;
    private _wheelData;
    private _targetData;
    private _options;
    private _inputType;
    private _lastPrimaryTouchData;
    /**
     * @returns 'mouse' or 'touch'
     */
    get currentInputType(): InputType;
    /**
     * Sets the current input type to 'mouse' or 'touch'.
     */
    set currentInputType(inputType: InputType);
    /**
     * Calculates the Three.js screen position of the mouse from the given mouse event.
     * Unlike viewport positions, Three.js screen positions go from -1 to +1.
     * @param event The mouse event to get the viewport position out of.
     * @param view The HTML element that we want the position to be relative to.
     */
    static screenPosition(pagePos: Vector2, view: HTMLElement): Vector2;
    /**
     * Measures the distance between the two mouse events in pixels.
     * @param firstPagePos The first page position.
     * @param secondPagePos The second page position.
     */
    static mouseDistance(firstPagePos: Vector2, secondPagePos: Vector2): number;
    /**
     * Determines if the mouse is directly over the given HTML element.
     * @param clientPos The client position to test.
     * @param element The HTML element to test against.
     */
    static eventIsDirectlyOverElement(clientPos: Vector2, element: HTMLElement): boolean;
    /**
     * Determines if the mouse is over the given element.
     * @param clientPos The client position to test.
     * @param element The HTML element to test against.
     */
    static eventIsOverElement(clientPos: Vector2, element: HTMLElement): boolean;
    constructor(options: IOptions);
    /**
     * Set the element that the input module will attach it's event listeners to.
     * By default this is usually the three js webgl canvas but sometimes you want to attach the input event listeners
     * on to a higher order html element and that's where this function comes in handy.
     */
    setInputElement(element: HTMLElement): void;
    dispose(): void;
    /**
     * Determines if the input down event happened directly over the given element.
     * @param element The element to test.
     */
    isDownOnElement(element: HTMLElement): boolean;
    /**
     * Determines if the input down event happened directly over any of the given elements.
     * @param elements The elements to test.
     */
    isDownOnAnyElements(elements: HTMLElement[]): boolean;
    /**
     * Determines if the input down event happened directly over any of the input elements.
     */
    isDownOnAnyInputElement(): boolean;
    /**
     * Determines if the input is currently focusing the given html element.
     * @param element The element to test.
     */
    isFocusingOnElement(element: HTMLElement): boolean;
    /**
     * Determines if the input is currently focusing any of the given html elements.
     * @param elements The elements to test.
     */
    isFocusingOnAnyElements(elements: HTMLElement[]): boolean;
    /**
     * Determines if the input is currently focusing on any of the input elements.
     */
    isFocusingOnAnyInputElement(): boolean;
    /**
     * Determines if the given event is for any of the the given elements and should
     * therefore be intercepted.
     * @param event The event.
     * @param elements The elements.
     */
    isEventForAnyElement(event: MouseEvent | TouchEvent, elements: HTMLElement[]): boolean;
    /**
     * Determines if the given HTML element is contained by the given container element.
     * @param element The HTML element.
     * @param container The container.
     */
    static isElementContainedByOrEqual(element: Element, container: HTMLElement): boolean;
    /**
     * Returns true the frame that the button was pressed down.
     * If on mobile device and requresing Left Button, will return for the first finger touching the screen.
     */
    getMouseButtonDown(buttonId: MouseButtonId): boolean;
    getTouchDown(fingerIndex: number): boolean;
    /**
     * Returns true on the frame that the key was pressed.
     * @param key The key. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyDown(key: string): boolean;
    /**
     * Returns true the frame that the button was released.
     * If on mobile device and requresing Left Button, will return for the first finger touching the screen.
     */
    getMouseButtonUp(buttonId: MouseButtonId): boolean;
    getTouchUp(fingerIndex: number): boolean;
    /**
     * Returns true on the frame that the key was released.
     * @param key The key. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyUp(key: string): boolean;
    /**
     * Retruns true every frame the button is held down.
     * If on mobile device, will return the held state of the first finger touching the screen.
     */
    getMouseButtonHeld(buttonId: MouseButtonId): boolean;
    getTouchHeld(fingerIndex: number): boolean;
    /**
     * Returns true every frame that the given key is held down.
     * @param key The key. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyHeld(key: string): boolean;
    /**
     * Return true the frame that wheel movement was detected.
     */
    getWheelMoved(): boolean;
    /**
     * The wheel data for the current frame.
     */
    getWheelData(): WheelFrame;
    /**
     * Return the last known screen position of the mouse.
     * If on mobile device, will return the screen position of the first finger touching the screen.
     */
    getMouseScreenPos(): Vector2;
    /**
     * Return the last known page position of the mouse.
     * If on mobile device, will return the page position of the first finger touching the screen.
     */
    getMousePagePos(): Vector2;
    /**
     * Return the last known client position of the mouse.
     * If on mobile device, will return the client position of the first finger touching the screen.
     */
    getMouseClientPos(): Vector2;
    /**
     * Return the screen position of the touch. Will return null if touch not detected.
     * @param fingerIndex The index of the finger (first finger: 0, second finger: 1, ...)
     */
    getTouchScreenPos(fingerIndex: number): Vector2;
    /**
     * Return the page position of the touch. Will return null if touch not detected.
     * @param fingerIndex The index of the finger (first finger: 0, second finger: 1, ...)
     */
    getTouchPagePos(fingerIndex: number): Vector2;
    /**
     * Return the client position of the touch. Will return null if touch not detected.
     * @param fingerIndex The index of the finger (first finger: 0, second finger: 1, ...)
     */
    getTouchClientPos(fingerIndex: number): Vector2;
    /**
     * Return how many touches are currenty active.
     */
    getTouchCount(): number;
    getMouseData(): MouseData;
    /**
     * Returns the matching TouchData object for the provided finger index.
     */
    getTouchData(finderIndex: number): TouchData;
    /**
     * Returns the matching key data for the provided key value.
     * @param key The key that the data should be found for.
     *            See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyData(key: string): KeyData;
    /**
     * Gets the iterable list of keys that have been used in the application.
     * Useful to check if any keys have been pressed or released.
     */
    getKeys(): Iterable<KeyData>;
    /**
     * Gets the information about what HTML elements are currently being targeted.
     * Note that this only stores information about the last targeted elements.
     * As such, it should only be used to tell whether touch/mouse events
     * should be used or not.
     */
    getTargetData(): TargetData;
    /**
     * Force all current input states to release (set the up frame to the current frame).
     */
    forceReleaseInputs(): void;
    update(): void;
    /**
     * Loop through all current touch data and remove any that are no longer needed.
     * Unlike the mouse, touch pointers are unique everytime they are pressed down on the screen.
     * Remove any touch pointers that are passed their 'up' input state. No need to keep them around.
     */
    private _cullTouchData;
    private _copyToPrimaryTouchData;
    /**
     * Returns the matching MouseButtonData object for the provided mouse button number.
     */
    private _getMouseButtonState;
    /**
     * Calculates the Three.js screen position of the pointer from the given pointer event.
     * Unlike viewport positions, Three.js screen positions go from -1 to +1.
     * @param pageX
     * @param pageY
     */
    private _calculateScreenPos;
    private _handleMouseDown;
    private _handleMouseUp;
    private _handleMouseMove;
    private _getKeyState;
    private _handleKeyUp;
    private _handleKeyDown;
    private _handleWheel;
    private _handleTouchStart;
    private _handleTouchMove;
    private _handleTouchEnd;
    private _handleTouchCancel;
    private _handleContextMenu;
}
export declare enum InputType {
    Undefined = "undefined",
    Mouse = "mouse",
    Touch = "touch"
}
export declare enum MouseButtonId {
    Left = 0,
    Middle = 1,
    Right = 2
}
export declare class InputState {
    /**
     * The frame this input was down.
     */
    private _downFrame;
    /**
     * The frame this input was up.
     */
    private _upFrame;
    getDownFrame(): number;
    setDownFrame(frame: number): void;
    getUpFrame(): number;
    setUpFrame(frame: number): void;
    /**
     * Is the input down on the requested frame. Will only return true on the exact frame.
     * @see isHeldOnFrame() for true result for every frame the input is down.
     * @param frame The frame to compare against.
     */
    isDownOnFrame(frame: number): boolean;
    /**
     * Is the input held on the requested frame. Will return for every frame the input is held down.
     * @param frame The frame to compare against.
     */
    isHeldOnFrame(frame: number): boolean;
    /**
     * Is the input up on the requested frame. Will only return true on the exact frame.
     * @param frame The frame to compare against.
     */
    isUpOnFrame(frame: number): boolean;
    /**
     * Returns a new InputState with the same values as this one.
     */
    clone(): InputState;
}
interface WheelFrame {
    /**
     * The frame that the wheel moved on.
     */
    moveFrame: number;
    /**
     * Wheel delta in a Vector3 format. (x, y, z)
     */
    delta: Vector3;
    /**
     * Is the wheel being invoked with ctrl?
     * @see https://developer.mozilla.org/en-US/docs/Web/Events/wheel
     * WheelEvent has a standardized hack that allows trackpad two finger pinching to be detected as WheelEvent + ctrl key.
     * This boolean indicates whether the ctrl key was detected with the WheelEvent.
     */
    ctrl: boolean;
}
/**
 * Data about the HTML element that was targeted by a click.
 */
export interface TargetData {
    inputDown: HTMLElement;
    inputUp: HTMLElement;
    inputOver: HTMLElement;
}
interface TouchData {
    /**
     * The unique identifier for the touch.
     */
    identifier: number;
    /**
     * The index of the finger for the touch.
     */
    fingerIndex: number;
    /**
     * State of the touch input.
     */
    state: InputState;
    /**
     * Screen position of the touch.
     */
    screenPos: Vector2;
    /**
     * Page position of the touch.
     */
    pagePos: Vector2;
    /**
     * Client position of touch.
     */
    clientPos: Vector2;
}
interface MouseData {
    /**
     * State of the left mouse button.
     */
    leftButtonState: InputState;
    /**
     * State of the right mouse button.
     */
    rightButtonState: InputState;
    /**
     * State of the middle mouse button.
     */
    middleButtonState: InputState;
    /**
     * Screen position of the mouse.
     */
    screenPos: Vector2;
    /**
     * Page position of the mouse.
     */
    pagePos: Vector2;
    /**
     * Client position of mouse.
     */
    clientPos: Vector2;
}
/**
 * Interface for data about a key.
 */
interface KeyData {
    /**
     * The key that the data is for.
     */
    key: string;
    /**
     * The state of the key.
     */
    state: InputState;
}
export {};
