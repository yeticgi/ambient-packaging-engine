import { Clock, Vector2, Vector3, Scene, Box2, Layers, SphereBufferGeometry, MeshStandardMaterial, MeshBasicMaterial, Mesh, BoxBufferGeometry, Object3D, Quaternion, Matrix4, MathUtils, Plane, Raycaster, Frustum, PerspectiveCamera, OrthographicCamera, WebGLRenderer, AnimationMixer, LoopOnce, LoopRepeat, Skeleton, SkinnedMesh, Material, Texture, BufferGeometry, LoadingManager, TextureLoader } from 'three';
import { __awaiter } from 'tslib';
import find from 'lodash/find';
import some from 'lodash/some';
import Stats from 'stats.js';
import { Howler, Howl } from 'howler';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import jsQR from 'jsqr';
import isEqual from 'lodash/isEqual';
import remove from 'lodash/remove';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

// [Ryan] I would love to have multiple versions of Event and Listener that support more than one generic parameter.
// However, this is not supported by JavaScript. TypeScript's compiler complains about the class name already being declared even though
// the generic parameters are different. This is because when transpiled to JavaScript,all generic types are stripped.
// So the best way to handle this is if you need mutiple objects to store them in a custom JavaScript object / Typescript interface.
/**
 * Event that has no arguments.
 */
class Event {
    constructor() {
        this._listeners = [];
    }
    addListener(listener) {
        this._listeners.push(listener);
    }
    removeListener(listener) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    removeAllListeners() {
        this._listeners = [];
    }
    invoke() {
        const listeners = [...this._listeners];
        listeners.forEach(l => {
            l();
        });
    }
    dispose() {
        this.removeAllListeners();
    }
}
/**
 * Event that has no arguments and has listeners that return promises.
 */
class PromiseEvent {
    constructor() {
        this._listeners = [];
    }
    addListener(listener) {
        this._listeners.push(listener);
    }
    removeListener(listener) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    removeAllListeners() {
        this._listeners = [];
    }
    invoke() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [...this._listeners].map(l => l());
            yield Promise.all(promises);
        });
    }
    dispose() {
        this.removeAllListeners();
    }
}
/**
 * Event that takes typed argument.
 */
class ArgEvent {
    constructor() {
        this._listeners = [];
    }
    addListener(listener) {
        this._listeners.push(listener);
    }
    removeListener(listener) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    removeAllListeners() {
        this._listeners = [];
    }
    invoke(arg) {
        const listeners = [...this._listeners];
        listeners.forEach(l => {
            l(arg);
        });
    }
    dispose() {
        this.removeAllListeners();
    }
}
/**
 * Event that takes typed argument and has listeners that return promises.
 */
class PromiseArgEvent {
    constructor() {
        this._listeners = [];
    }
    addListener(listener) {
        this._listeners.push(listener);
    }
    removeListener(listener) {
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
    }
    removeAllListeners() {
        this._listeners = [];
    }
    invoke(arg) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [...this._listeners].map(l => l(arg));
            yield Promise.all(promises);
        });
    }
    dispose() {
        this.removeAllListeners();
    }
}
/**
 * Shout is a global event dispatcher.
 * Objects can listen for and dispatch global events (referred to as shouts).
 */
var Shout;
(function (Shout) {
    let listenersMap = new Map();
    function addEventListener(type, listener) {
        let listeners = listenersMap.get(type);
        if (listeners) {
            // Add listener to listeners array if it isnt already.
            let listenerExists = listeners.some((l) => l === listener);
            if (!listenerExists) {
                listeners.push(listener);
                return true;
            }
            else {
                // Listener already exists.
                return false;
            }
        }
        else {
            // Add listeners array for shout type to the Map with the new listener added.
            listeners = [];
            listeners.push(listener);
            listenersMap.set(type, listeners);
            return true;
        }
    }
    Shout.addEventListener = addEventListener;
    function removeEventListener(type, listener) {
        let listeners = listenersMap.get(type);
        if (listeners) {
            let index = listeners.findIndex((l) => l === listener);
            if (index >= 0) {
                listeners.splice(index, 1);
                return true;
            }
        }
        return false;
    }
    Shout.removeEventListener = removeEventListener;
    function dispatchEvent(type, arg) {
        let listeners = listenersMap.get(type);
        if (listeners) {
            // Make a shallow copy in case dispatching alters the array.
            let listenersCopy = listeners.slice();
            listenersCopy.forEach((l) => l(arg));
        }
    }
    Shout.dispatchEvent = dispatchEvent;
    function removeAllEventListeners() {
        listenersMap = new Map();
    }
    Shout.removeAllEventListeners = removeAllEventListeners;
})(Shout || (Shout = {}));

class Time {
    constructor() {
        /**
         * Scalar value for how fast time passes. 0 = paused, 0.5 = half speed, 1.0 = normal, 2.0 = 2x fast, 4.0 = 4x fast, etc.
         */
        this.timeScale = 1.0;
        this.onUpdate = new ArgEvent();
        this._frameCount = 0;
        this._timeSinceStart = 0;
        this._deltaTime = 0;
        this._timeWaitPromises = [];
        this._frameWaitPromises = [];
        this._frameCount = 0;
        this._timeSinceStart = 0;
        this._deltaTime = 0;
        this._clock = new Clock(true);
    }
    /**
     * Number of frames that have passed since this game view was created.
     */
    get frameCount() {
        return this._frameCount;
    }
    /**
     * Number of seconds that have passed since this game view was created. This is affected by timeScale.
     */
    get timeSinceStart() {
        return this._timeSinceStart;
    }
    /**
     * Time in seconds that has passed since the last frame. This is affected by timeScale.
     */
    get deltaTime() {
        return this._deltaTime;
    }
    update() {
        // Track time.
        this._frameCount += 1;
        const clockDelta = this._clock.getDelta();
        this._deltaTime = clockDelta * this.timeScale;
        this._timeSinceStart += this._deltaTime;
        // Check frame wait promises and resolve any that are complete.
        if (this._frameWaitPromises.length > 0) {
            this._frameWaitPromises = this._frameWaitPromises.filter((fw) => {
                if (fw.frame <= this._frameCount) {
                    fw.resolve();
                    return false;
                }
                else {
                    return true;
                }
            });
        }
        // Check time wait promises and resolve any that are complete.
        if (this._timeWaitPromises.length > 0) {
            this._timeWaitPromises = this._timeWaitPromises.filter((tw) => {
                if (tw.resolveTime <= this._timeSinceStart) {
                    tw.resolve();
                    return false;
                }
                else {
                    return true;
                }
            });
        }
        this.onUpdate.invoke(this);
    }
    /**
     * Return a promise that waits the given number of seconds before resolving.
     * @param seconds Number of seconds to wait before resolving the promise.
     */
    waitForSeconds(seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (seconds <= 0) {
                return;
            }
            return new Promise((resolve) => {
                this._timeWaitPromises.push({
                    resolveTime: this._timeSinceStart + seconds,
                    resolve
                });
            });
        });
    }
    /**
     * Return a promise that resolves once the next frame has started.
     */
    waitForNextFrame() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this._frameWaitPromises.push({
                    frame: this._frameCount + 1,
                    resolve
                });
            });
        });
    }
    /**
     * Return a promise that resolves once the the given number of frames has passed.
     */
    waitForFrames(frameCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this._frameWaitPromises.push({
                    frame: this._frameCount + frameCount,
                    resolve
                });
            });
        });
    }
    dispose() {
    }
}

class Input {
    constructor(options) {
        /**
         * Debug level for Input class.
         * 0: Disabled, 1: Down/Up events, 2: Move events
         */
        this.debugLevel = 0;
        this.stopTouchPropogation = true;
        this._inputType = InputType.Undefined;
        this._options = options;
        this._mouseData = {
            leftButtonState: new InputState(),
            rightButtonState: new InputState(),
            middleButtonState: new InputState(),
            screenPos: new Vector2(0, 0),
            pagePos: new Vector2(0, 0),
            clientPos: new Vector2(0, 0),
        };
        this._targetData = {
            inputDown: null,
            inputUp: null,
            inputOver: null,
        };
        this._touchData = [];
        this._keyData = new Map();
        this._touchListenerCounts = new Map();
        this._wheelData = new WheelData();
        this._lastPrimaryTouchData = {
            fingerIndex: 0,
            identifier: 0,
            clientPos: new Vector2(0, 0),
            pagePos: new Vector2(0, 0),
            screenPos: new Vector2(0, 0),
            state: new InputState(),
        };
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);
        this._handleWheel = this._handleWheel.bind(this);
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
        this._handleTouchCancel = this._handleTouchCancel.bind(this);
        this._handleContextMenu = this._handleContextMenu.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleKeyUp = this._handleKeyUp.bind(this);
        this.setInputElement(this._options.inputElement);
        document.addEventListener('keydown', this._handleKeyDown);
        document.addEventListener('keyup', this._handleKeyUp);
        // Context menu is only important on the view
        this._options.canvasElement.addEventListener('contextmenu', this._handleContextMenu);
    }
    /**
     * @returns 'mouse' or 'touch'
     */
    get currentInputType() {
        return this._inputType;
    }
    /**
     * Sets the current input type to 'mouse' or 'touch'.
     */
    set currentInputType(inputType) {
        this._inputType = inputType;
    }
    /**
     * Calculates the Three.js screen position of the mouse from the given mouse event.
     * Unlike viewport positions, Three.js screen positions go from -1 to +1.
     * @param event The mouse event to get the viewport position out of.
     * @param view The HTML element that we want the position to be relative to.
     */
    static screenPosition(pagePos, view) {
        let globalPos = new Vector2(pagePos.x, pagePos.y);
        let viewRect = view.getBoundingClientRect();
        let viewPos = globalPos.sub(new Vector2(viewRect.left, viewRect.top));
        return new Vector2((viewPos.x / viewRect.width) * 2 - 1, -(viewPos.y / viewRect.height) * 2 + 1);
    }
    /**
     * Measures the distance between the two mouse events in pixels.
     * @param firstPagePos The first page position.
     * @param secondPagePos The second page position.
     */
    static mouseDistance(firstPagePos, secondPagePos) {
        return firstPagePos.distanceTo(secondPagePos);
    }
    /**
     * Determines if the mouse is directly over the given HTML element.
     * @param clientPos The client position to test.
     * @param element The HTML element to test against.
     */
    static eventIsDirectlyOverElement(clientPos, element) {
        let mouseOver = document.elementFromPoint(clientPos.x, clientPos.y);
        return mouseOver === element;
    }
    /**
     * Determines if the mouse is over the given element.
     * @param clientPos The client position to test.
     * @param element The HTML element to test against.
     */
    static eventIsOverElement(clientPos, element) {
        let elements = document.elementsFromPoint(clientPos.x, clientPos.y);
        return some(elements, e => e === element);
    }
    /**
     * Set the element that the input module will attach it's event listeners to.
     * By default this is usually the three js webgl canvas but sometimes you want to attach the input event listeners
     * on to a higher order html element and that's where this function comes in handy.
     */
    setInputElement(element) {
        if (this._options.inputElement) {
            this._options.inputElement.removeEventListener('mousedown', this._handleMouseDown);
            this._options.inputElement.removeEventListener('mousemove', this._handleMouseMove);
            this._options.inputElement.removeEventListener('mouseup', this._handleMouseUp);
            this._options.inputElement.removeEventListener('mouseleave', this._handleMouseLeave);
            this._options.inputElement.removeEventListener('wheel', this._handleWheel);
            this._options.inputElement.removeEventListener('touchstart', this._handleTouchStart);
        }
        this._options.inputElement = element;
        if (this._options.inputElement) {
            this._options.inputElement.addEventListener('mousedown', this._handleMouseDown);
            this._options.inputElement.addEventListener('mousemove', this._handleMouseMove);
            this._options.inputElement.addEventListener('mouseup', this._handleMouseUp);
            this._options.inputElement.addEventListener('mouseleave', this._handleMouseLeave);
            this._options.inputElement.addEventListener('wheel', this._handleWheel);
            this._options.inputElement.addEventListener('touchstart', this._handleTouchStart);
        }
    }
    dispose() {
        console.log('[Input] dispose');
        this.setInputElement(null);
        document.removeEventListener('keydown', this._handleKeyDown);
        document.removeEventListener('keyup', this._handleKeyUp);
        // Context menu is only important on the view
        this._options.canvasElement.removeEventListener('contextmenu', this._handleContextMenu);
        this._options = null;
    }
    /**
     * Determines if the input down event happened directly over the given element.
     * @param element The element to test.
     */
    isDownOnElement(element) {
        const downElement = this._targetData.inputDown;
        return Input.isElementContainedByOrEqual(downElement, element);
    }
    /**
     * Determines if the input down event happened directly over any of the given elements.
     * @param elements The elements to test.
     */
    isDownOnAnyElements(elements) {
        const downElement = this._targetData.inputDown;
        const matchingElement = elements.find(e => Input.isElementContainedByOrEqual(downElement, e));
        return !!matchingElement;
    }
    /**
     * Determines if the input down event happened directly over any of the input elements.
     */
    isDownOnAnyInputElement() {
        const downElement = this._targetData.inputDown;
        const inputElements = [this._options.canvasElement, ...this._options.getUIHtmlElements()];
        const matchingElement = inputElements.find(e => Input.isElementContainedByOrEqual(downElement, e));
        return !!matchingElement;
    }
    /**
     * Determines if the input is currently focusing the given html element.
     * @param element The element to test.
     */
    isFocusingOnElement(element) {
        const overElement = this._targetData.inputOver;
        return Input.isElementContainedByOrEqual(overElement, element);
    }
    /**
     * Determines if the input is currently focusing any of the given html elements.
     * @param elements The elements to test.
     */
    isFocusingOnAnyElements(elements) {
        const overElement = this._targetData.inputOver;
        const matchingElement = elements.find(e => Input.isElementContainedByOrEqual(overElement, e));
        return !!matchingElement;
    }
    /**
     * Determines if the input is currently focusing on any of the input elements.
     */
    isFocusingOnAnyInputElement() {
        const overElement = this._targetData.inputOver;
        const inputElements = [this._options.canvasElement, ...this._options.getUIHtmlElements()];
        const matchingElement = inputElements.find(e => Input.isElementContainedByOrEqual(overElement, e));
        return !!matchingElement;
    }
    /**
     * Determines if the given event is for any of the the given elements and should
     * therefore be intercepted.
     * @param event The event.
     * @param elements The elements.
     */
    isEventForAnyElement(event, elements) {
        let el;
        if (event instanceof MouseEvent) {
            el = document.elementFromPoint(event.clientX, event.clientY);
        }
        else {
            el = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        }
        const matchingElement = elements.find(e => Input.isElementContainedByOrEqual(el, e));
        return !!matchingElement;
    }
    /**
     * Determines if the given HTML element is contained by the given container element.
     * @param element The HTML element.
     * @param container The container.
     */
    static isElementContainedByOrEqual(element, container) {
        if (element === container) {
            return true;
        }
        else {
            if (!element) {
                return false;
            }
            else {
                return this.isElementContainedByOrEqual(element.parentElement, container);
            }
        }
    }
    /**
     * Returns true the frame that the button was pressed down.
     * If on mobile device and requresing Left Button, will return for the first finger touching the screen.
     */
    getMouseButtonDown(buttonId) {
        if (this._inputType == InputType.Mouse) {
            let buttonState = this._getMouseButtonState(buttonId);
            if (buttonState) {
                return buttonState.isDownOnFrame(this._options.time.frameCount);
            }
        }
        else if (this._inputType == InputType.Touch) {
            if (buttonId == MouseButtonId.Left) {
                return this._lastPrimaryTouchData.state.isDownOnFrame(this._options.time.frameCount);
            }
        }
        return false;
    }
    getTouchDown(fingerIndex) {
        let touchData = this.getTouchData(fingerIndex);
        if (touchData) {
            return touchData.state.isDownOnFrame(this._options.time.frameCount);
        }
        return false;
    }
    /**
     * Returns true on the frame that the key was pressed.
     * @param key The key. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyDown(key) {
        let keyData = this.getKeyData(key);
        if (keyData) {
            return keyData.state.isDownOnFrame(this._options.time.frameCount);
        }
        return false;
    }
    /**
     * Returns true the frame that the button was released.
     * If on mobile device and requresing Left Button, will return for the first finger touching the screen.
     */
    getMouseButtonUp(buttonId) {
        if (this._inputType == InputType.Mouse) {
            let buttonState = this._getMouseButtonState(buttonId);
            if (buttonState) {
                return buttonState.isUpOnFrame(this._options.time.frameCount);
            }
        }
        else if (this._inputType == InputType.Touch) {
            if (buttonId == MouseButtonId.Left) {
                return this._lastPrimaryTouchData.state.isUpOnFrame(this._options.time.frameCount);
            }
        }
        return false;
    }
    getTouchUp(fingerIndex) {
        let touchData = this.getTouchData(fingerIndex);
        if (touchData) {
            return touchData.state.isUpOnFrame(this._options.time.frameCount);
        }
        return false;
    }
    /**
     * Returns true on the frame that the key was released.
     * @param key The key. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyUp(key) {
        let keyData = this.getKeyData(key);
        if (keyData) {
            return keyData.state.isUpOnFrame(this._options.time.frameCount);
        }
        return false;
    }
    /**
     * Retruns true every frame the button is held down.
     * If on mobile device, will return the held state of the first finger touching the screen.
     */
    getMouseButtonHeld(buttonId) {
        if (this._inputType == InputType.Mouse) {
            let buttonState = this._getMouseButtonState(buttonId);
            if (buttonState) {
                return buttonState.isHeldOnFrame(this._options.time.frameCount);
            }
        }
        else if (this._inputType == InputType.Touch) {
            if (buttonId == MouseButtonId.Left) {
                return this._lastPrimaryTouchData.state.isHeldOnFrame(this._options.time.frameCount);
            }
        }
        return false;
    }
    getTouchHeld(fingerIndex) {
        let touchData = this.getTouchData(fingerIndex);
        if (touchData) {
            return touchData.state.isHeldOnFrame(this._options.time.frameCount);
        }
        return false;
    }
    /**
     * Returns true every frame that the given key is held down.
     * @param key The key. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyHeld(key) {
        let keyData = this.getKeyData(key);
        if (keyData) {
            return keyData.state.isHeldOnFrame(this._options.time.frameCount);
        }
        return false;
    }
    /**
     * Return true the frame that wheel movement was detected.
     */
    getWheelMoved() {
        return (this._wheelData.getFrame(this._options.time.frameCount) != null);
    }
    /**
     * The wheel data for the current frame.
     */
    getWheelData() {
        // Deep clone the internal wheel data.
        let wheelFrame = this._wheelData.getFrame(this._options.time.frameCount);
        if (wheelFrame)
            return JSON.parse(JSON.stringify(wheelFrame));
        else
            return null;
    }
    /**
     * Return the last known screen position of the mouse.
     * If on mobile device, will return the screen position of the first finger touching the screen.
     */
    getMouseScreenPos() {
        if (this._inputType == InputType.Mouse) {
            return this._mouseData.screenPos;
        }
        else if (this._inputType == InputType.Touch) {
            return this._lastPrimaryTouchData.screenPos;
        }
        return null;
    }
    /**
     * Return the last known page position of the mouse.
     * If on mobile device, will return the page position of the first finger touching the screen.
     */
    getMousePagePos() {
        if (this._inputType == InputType.Mouse) {
            return this._mouseData.pagePos;
        }
        else if (this._inputType == InputType.Touch) {
            return this._lastPrimaryTouchData.pagePos;
        }
        return null;
    }
    /**
     * Return the last known client position of the mouse.
     * If on mobile device, will return the client position of the first finger touching the screen.
     */
    getMouseClientPos() {
        if (this._inputType == InputType.Mouse) {
            return this._mouseData.clientPos;
        }
        else if (this._inputType == InputType.Touch) {
            return this._lastPrimaryTouchData.clientPos;
        }
        return null;
    }
    /**
     * Return the screen position of the touch. Will return null if touch not detected.
     * @param fingerIndex The index of the finger (first finger: 0, second finger: 1, ...)
     */
    getTouchScreenPos(fingerIndex) {
        let touchData = this.getTouchData(fingerIndex);
        if (touchData) {
            return touchData.screenPos;
        }
        return null;
    }
    /**
     * Return the page position of the touch. Will return null if touch not detected.
     * @param fingerIndex The index of the finger (first finger: 0, second finger: 1, ...)
     */
    getTouchPagePos(fingerIndex) {
        let touchData = this.getTouchData(fingerIndex);
        if (touchData) {
            return touchData.pagePos;
        }
        return null;
    }
    /**
     * Return the client position of the touch. Will return null if touch not detected.
     * @param fingerIndex The index of the finger (first finger: 0, second finger: 1, ...)
     */
    getTouchClientPos(fingerIndex) {
        let touchData = this.getTouchData(fingerIndex);
        if (touchData) {
            return touchData.clientPos;
        }
        return null;
    }
    /**
     * Return how many touches are currenty active.
     */
    getTouchCount() {
        return this._touchData.length;
    }
    getMouseData() {
        return this._mouseData;
    }
    /**
     * Returns the matching TouchData object for the provided finger index.
     */
    getTouchData(finderIndex) {
        if (this._touchData.length > 0) {
            let touchData = find(this._touchData, (d) => {
                return d.fingerIndex === finderIndex;
            });
            if (touchData) {
                return touchData;
            }
        }
        return null;
    }
    /**
     * Returns the matching key data for the provided key value.
     * @param key The key that the data should be found for.
     *            See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    getKeyData(key) {
        return this._keyData.get(key);
    }
    /**
     * Gets the iterable list of keys that have been used in the application.
     * Useful to check if any keys have been pressed or released.
     */
    getKeys() {
        return this._keyData.values();
    }
    /**
     * Gets the information about what HTML elements are currently being targeted.
     * Note that this only stores information about the last targeted elements.
     * As such, it should only be used to tell whether touch/mouse events
     * should be used or not.
     */
    getTargetData() {
        return this._targetData;
    }
    /**
     * Force all current input states to release (set the up frame to the current frame).
     */
    forceReleaseInputs() {
        const currentFrame = this._options.time.frameCount;
        // Release currently held mouse buttons.
        if (this._mouseData.leftButtonState.isHeldOnFrame(currentFrame)) {
            this._mouseData.leftButtonState.setUpFrame(currentFrame);
        }
        if (this._mouseData.middleButtonState.isHeldOnFrame(currentFrame)) {
            this._mouseData.middleButtonState.setUpFrame(currentFrame);
        }
        if (this._mouseData.rightButtonState.isHeldOnFrame(currentFrame)) {
            this._mouseData.rightButtonState.setUpFrame(currentFrame);
        }
        // Release currenty held touches.
        for (let i = 0; i < this._touchData.length; i++) {
            let touchData = this._touchData[i];
            if (touchData.state.isHeldOnFrame(currentFrame)) {
                touchData.state.setUpFrame(currentFrame);
            }
        }
    }
    update() {
        this._cullTouchData();
        this._wheelData.removeOldFrames(this._options.time.frameCount);
    }
    /**
     * Loop through all current touch data and remove any that are no longer needed.
     * Unlike the mouse, touch pointers are unique everytime they are pressed down on the screen.
     * Remove any touch pointers that are passed their 'up' input state. No need to keep them around.
     */
    _cullTouchData() {
        let touchRemoved = false;
        this._touchData = this._touchData.filter((t) => {
            let upFrame = t.state.getUpFrame();
            // Up frame must have been set.
            if (upFrame !== -1) {
                // Current frame must be higher than the touch's up frame.
                if (this._options.time.frameCount > upFrame) {
                    if (this.debugLevel >= 1) {
                        console.log('removing touch finger: ' +
                            t.fingerIndex +
                            '. frame: ' +
                            this._options.time.frameCount);
                    }
                    touchRemoved = true;
                    return false;
                }
            }
            return true;
        });
        if (touchRemoved && this._touchData.length > 0) {
            // Normalize the finger index range of the remaining touch data.
            this._touchData = this._touchData.sort((a, b) => {
                return a.fingerIndex - b.fingerIndex;
            });
            for (let i = 0; i < this._touchData.length; i++) {
                this._touchData[i].fingerIndex = i;
            }
        }
    }
    _copyToPrimaryTouchData(data) {
        this._lastPrimaryTouchData.fingerIndex = data.fingerIndex;
        this._lastPrimaryTouchData.identifier = data.identifier;
        this._lastPrimaryTouchData.clientPos = data.clientPos.clone();
        this._lastPrimaryTouchData.pagePos = data.pagePos.clone();
        this._lastPrimaryTouchData.screenPos = data.screenPos.clone();
        this._lastPrimaryTouchData.state = data.state.clone();
    }
    /**
     * Returns the matching MouseButtonData object for the provided mouse button number.
     */
    _getMouseButtonState(button) {
        if (button == MouseButtonId.Left)
            return this._mouseData.leftButtonState;
        if (button == MouseButtonId.Right)
            return this._mouseData.rightButtonState;
        if (button == MouseButtonId.Middle)
            return this._mouseData.middleButtonState;
        console.warn('unsupported mouse button number: ' + button);
        return null;
    }
    /**
     * Returns the matching MouseButtonData objects for the given mouse buttons number.
     * See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
     * @param buttons The number that represents the buttons that are held down.
     */
    _getMouseButtonStates(buttons) {
        let states = [];
        if ((buttons & 1) === 1) {
            states.push(this._getMouseButtonState(MouseButtonId.Left));
        }
        if ((buttons & 2) === 2) {
            states.push(this._getMouseButtonState(MouseButtonId.Right));
        }
        if ((buttons & 4) === 4) {
            states.push(this._getMouseButtonState(MouseButtonId.Middle));
        }
        return states;
    }
    /**
     * Calculates the Three.js screen position of the pointer from the given pointer event.
     * Unlike viewport positions, Three.js screen positions go from -1 to +1.
     * @param pageX
     * @param pageY
     */
    _calculateScreenPos(pageX, pageY) {
        return Input.screenPosition(new Vector2(pageX, pageY), this._options.canvasElement);
    }
    _handleMouseDown(event) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Mouse;
        if (this._inputType != InputType.Mouse)
            return;
        if (this.isEventForAnyElement(event, [
            this._options.canvasElement,
            ...this._options.getUIHtmlElements(),
        ])) {
            event.preventDefault();
        }
        let buttonState = this._getMouseButtonState(event.button);
        if (buttonState) {
            buttonState.setDownFrame(this._options.time.frameCount);
            if (this.debugLevel >= 1) {
                console.log('mouse button ' +
                    event.button +
                    ' down. fireInputOnFrame: ' +
                    this._options.time.frameCount);
            }
            this._targetData.inputDown = event.target;
            this._mouseData.clientPos = new Vector2(event.clientX, event.clientY);
            this._mouseData.pagePos = new Vector2(event.pageX, event.pageY);
            this._mouseData.screenPos = this._calculateScreenPos(event.pageX, event.pageY);
        }
    }
    _handleMouseUp(event) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Mouse;
        if (this._inputType != InputType.Mouse)
            return;
        if (this.isEventForAnyElement(event, [
            this._options.canvasElement,
            ...this._options.getUIHtmlElements(),
        ])) {
            event.preventDefault();
        }
        let buttonState = this._getMouseButtonState(event.button);
        if (buttonState) {
            buttonState.setUpFrame(this._options.time.frameCount);
            if (this.debugLevel >= 1) {
                console.log('mouse button ' +
                    event.button +
                    ' up. fireInputOnFrame: ' +
                    this._options.time.frameCount);
            }
            this._targetData.inputUp = event.target;
            this._mouseData.clientPos = new Vector2(event.clientX, event.pageY);
            this._mouseData.pagePos = new Vector2(event.pageX, event.pageY);
            this._mouseData.screenPos = this._calculateScreenPos(event.pageX, event.pageY);
        }
    }
    _handleMouseLeave(event) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Mouse;
        if (this._inputType != InputType.Mouse)
            return;
        if (this.isEventForAnyElement(event, [
            this._options.canvasElement,
            ...this._options.getUIHtmlElements(),
        ])) {
            event.preventDefault();
        }
        // Clear all the button states when the mouse leaves the window
        let buttonStates = [
            this._mouseData.leftButtonState,
            this._mouseData.rightButtonState,
            this._mouseData.middleButtonState,
        ];
        for (let buttonState of buttonStates) {
            buttonState.setUpFrame(this._options.time.frameCount);
        }
        if (this.debugLevel >= 1) {
            console.log('mouse button ' + event.button + ' leave. fireInputOnFrame: ' + this._options.time.frameCount);
        }
        this._targetData.inputUp = event.target;
        this._mouseData.clientPos = new Vector2(event.clientX, event.pageY);
        this._mouseData.pagePos = new Vector2(event.pageX, event.pageY);
        this._mouseData.screenPos = this._calculateScreenPos(event.pageX, event.pageY);
    }
    _handleMouseMove(event) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Mouse;
        if (this._inputType != InputType.Mouse)
            return;
        if (this.isEventForAnyElement(event, [
            this._options.canvasElement,
            ...this._options.getUIHtmlElements(),
        ])) {
            event.preventDefault();
        }
        // Resend the mouse down events if the button is actually down
        // but is not recorded as such.
        const buttonStates = this._getMouseButtonStates(event.buttons);
        let hadButtonDown = false;
        for (let state of buttonStates) {
            let down = state.getDownFrame();
            let up = state.getUpFrame();
            if (up > down || down === -1) {
                state.setDownFrame(this._options.time.frameCount);
                hadButtonDown = true;
            }
        }
        if (hadButtonDown) {
            if (this.debugLevel >= 1) {
                console.log('mouse buttons ' + event.buttons + ' already down. fireInputOnFrame: ' + this._options.time.frameCount);
            }
        }
        this._mouseData.clientPos = new Vector2(event.clientX, event.clientY);
        this._mouseData.pagePos = new Vector2(event.pageX, event.pageY);
        this._mouseData.screenPos = this._calculateScreenPos(event.pageX, event.pageY);
        this._targetData.inputOver = event.target;
        if (this.debugLevel >= 2) {
            console.log('mouse move:');
            console.log('  screenPos: ' + JSON.stringify(this._mouseData.screenPos));
            console.log('  pagePos: ' + JSON.stringify(this._mouseData.pagePos));
            console.log('  clientPos: ' + JSON.stringify(this._mouseData.clientPos));
        }
    }
    _getKeyState(key) {
        return this._keyData.get(key);
    }
    _handleKeyUp(event) {
        let keyState = this._getKeyState(event.key);
        if (keyState) {
            keyState.state.setUpFrame(this._options.time.frameCount);
        }
        if (this.debugLevel >= 1) {
            console.log('key ' +
                event.key +
                ' up. fireInputOnFrame: ' +
                this._options.time.frameCount);
        }
    }
    _handleKeyDown(event) {
        let keyData = this._getKeyState(event.key);
        if (!keyData) {
            keyData = {
                key: event.key,
                state: new InputState(),
            };
            this._keyData.set(keyData.key, keyData);
        }
        if (!event.repeat) {
            keyData.state.setDownFrame(this._options.time.frameCount);
        }
        if (this.debugLevel >= 1) {
            console.log('key ' +
                event.key +
                ' down. fireInputOnFrame: ' +
                this._options.time.frameCount +
                '. repeating: ' +
                event.repeat);
        }
    }
    _handleWheel(event) {
        if (this.isFocusingOnElement(this._options.canvasElement)) {
            event.preventDefault();
        }
        let wheelFrame = {
            moveFrame: this._options.time.frameCount,
            delta: new Vector3(event.deltaX, event.deltaY, event.deltaZ),
            ctrl: event.ctrlKey,
        };
        this._wheelData.addFrame(wheelFrame);
        if (this.debugLevel >= 2) {
            if (wheelFrame.ctrl) {
                console.log(`wheel w/ ctrl fireOnFrame: ${wheelFrame.moveFrame}, delta: (${wheelFrame.delta.x}, ${wheelFrame.delta.y}, ${wheelFrame.delta.z})`);
            }
            else {
                console.log(`wheel fireOnFrame: ${wheelFrame.moveFrame}, delta: (${wheelFrame.delta.x}, ${wheelFrame.delta.y}, ${wheelFrame.delta.z})`);
            }
        }
    }
    _handleTouchStart(event) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Touch;
        if (this._inputType != InputType.Touch)
            return;
        const count = this._touchListenerCounts.get(event.target) || 0;
        if (count === 0) {
            event.target.addEventListener('touchmove', this._handleTouchMove);
            event.target.addEventListener('touchend', this._handleTouchEnd);
            event.target.addEventListener('touchcancel', this._handleTouchCancel);
            this._touchListenerCounts.set(event.target, event.changedTouches.length);
            if (this.debugLevel >= 1) {
                console.log('adding touch listeners for ', event.target);
            }
        }
        else if (count >= 0) {
            this._touchListenerCounts.set(event.target, count + event.changedTouches.length);
            if (this.debugLevel >= 1) {
                console.log(count + 1, ' touch events left for', event.target);
            }
        }
        if (this.isEventForAnyElement(event, [
            this._options.canvasElement,
            ...this._options.getUIHtmlElements(),
        ])) {
            event.preventDefault();
        }
        // For the touchstart event, it is a list of the touch points that became active with the current event.
        let changed = event.changedTouches;
        for (let i = 0; i < changed.length; i++) {
            let touch = changed.item(i);
            // Create new touch data.
            let data = {
                identifier: touch.identifier,
                fingerIndex: this.getTouchCount(),
                state: new InputState(),
                clientPos: new Vector2(touch.clientX, touch.clientY),
                pagePos: new Vector2(touch.pageX, touch.pageY),
                screenPos: this._calculateScreenPos(touch.pageX, touch.pageY),
            };
            // Set the down frame on the new touch data.
            data.state.setDownFrame(this._options.time.frameCount);
            if (data.fingerIndex === 0) {
                this._copyToPrimaryTouchData(data);
            }
            if (this.debugLevel >= 1) {
                console.log('touch finger ' +
                    data.identifier +
                    ' ' +
                    data.fingerIndex +
                    ' start. fireInputOnFrame: ' +
                    this._options.time.frameCount);
            }
            this._targetData.inputDown = this._targetData.inputOver = touch.target;
            this._touchData.push(data);
        }
    }
    _handleTouchMove(event) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Touch;
        if (this._inputType != InputType.Touch)
            return;
        if (this.stopTouchPropogation) {
            event.stopImmediatePropagation();
        }
        if (this.isEventForAnyElement(event, [
            this._options.canvasElement,
            ...this._options.getUIHtmlElements(),
        ])) {
            event.preventDefault();
        }
        // For the touchmove event, it is a list of the touch points that have changed since the last event.
        let changed = event.changedTouches;
        for (let i = 0; i < changed.length; i++) {
            let touch = changed.item(i);
            let existingTouch = find(this._touchData, d => {
                return d.identifier === touch.identifier;
            });
            existingTouch.clientPos = new Vector2(touch.clientX, touch.clientY);
            existingTouch.pagePos = new Vector2(touch.pageX, touch.pageY);
            existingTouch.screenPos = this._calculateScreenPos(touch.pageX, touch.pageY);
            // Must use elementFromPoint because touch event target never changes after initial contact.
            this._targetData.inputOver = (document.elementFromPoint(touch.clientX, touch.clientY));
            if (existingTouch.fingerIndex === 0) {
                this._copyToPrimaryTouchData(existingTouch);
            }
            if (this.debugLevel >= 2) {
                console.log('touch move:');
                console.log('  identifier: ' + existingTouch.identifier);
                console.log('  fingerIndex: ' + existingTouch.fingerIndex);
                console.log('  screenPos: ' + JSON.stringify(existingTouch.screenPos));
                console.log('  pagePos: ' + JSON.stringify(existingTouch.pagePos));
                console.log('  clientPos: ' + JSON.stringify(existingTouch.clientPos));
            }
        }
    }
    _handleTouchEnd(evt) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Touch;
        if (this._inputType != InputType.Touch)
            return;
        if (this.stopTouchPropogation) {
            event.stopImmediatePropagation();
        }
        const count = this._touchListenerCounts.get(evt.target) || 0;
        if (count <= evt.changedTouches.length) {
            evt.target.removeEventListener('touchmove', this._handleTouchMove);
            evt.target.removeEventListener('touchend', this._handleTouchEnd);
            evt.target.removeEventListener('touchcancel', this._handleTouchCancel);
            this._touchListenerCounts.set(evt.target, 0);
            if (this.debugLevel >= 1) {
                console.log('removing touch listeners for ', evt.target);
            }
        }
        else if (count > 0) {
            this._touchListenerCounts.set(evt.target, count - evt.changedTouches.length);
            if (this.debugLevel >= 1) {
                console.log(count - 1, ' touch events left for', evt.target);
            }
        }
        if (this.isEventForAnyElement(evt, [
            this._options.canvasElement,
            ...this._options.getUIHtmlElements(),
        ])) {
            evt.preventDefault();
        }
        // For the touchend event, it is a list of the touch points that have been removed from the surface.
        let changed = evt.changedTouches;
        for (let i = 0; i < changed.length; i++) {
            let touch = changed.item(i);
            // Must use elementFromPoint because touch event target never changes after initial contact.
            this._targetData.inputUp = this._targetData.inputOver = document.elementFromPoint(touch.clientX, touch.clientY);
            let existingTouch = find(this._touchData, d => {
                return d.identifier === touch.identifier;
            });
            existingTouch.state.setUpFrame(this._options.time.frameCount);
            existingTouch.clientPos = new Vector2(touch.clientX, touch.clientY);
            existingTouch.pagePos = new Vector2(touch.pageX, touch.pageY);
            existingTouch.screenPos = this._calculateScreenPos(touch.pageX, touch.pageY);
            if (existingTouch.fingerIndex === 0) {
                this._copyToPrimaryTouchData(existingTouch);
            }
            if (this.debugLevel >= 1) {
                console.log('touch finger ' +
                    existingTouch.identifier +
                    ' ' +
                    existingTouch.fingerIndex +
                    ' end. fireInputOnFrame: ' +
                    this._options.time.frameCount);
            }
        }
    }
    _handleTouchCancel(evt) {
        if (this._inputType == InputType.Undefined)
            this._inputType = InputType.Touch;
        if (this._inputType != InputType.Touch)
            return;
        if (this.stopTouchPropogation) {
            event.stopImmediatePropagation();
        }
        const count = this._touchListenerCounts.get(evt.target) || 0;
        if (count <= evt.changedTouches.length) {
            evt.target.removeEventListener('touchmove', this._handleTouchMove);
            evt.target.removeEventListener('touchend', this._handleTouchEnd);
            evt.target.removeEventListener('touchcancel', this._handleTouchCancel);
            this._touchListenerCounts.set(evt.target, 0);
            if (this.debugLevel >= 1) {
                console.log('removing touch listeners for ', evt.target);
            }
        }
        else if (count > 0) {
            this._touchListenerCounts.set(evt.target, count - evt.changedTouches.length);
            if (this.debugLevel >= 1) {
                console.log(count - 1, ' touch events left for', evt.target);
            }
        }
        let changed = evt.changedTouches;
        for (let i = 0; i < changed.length; i++) {
            // Handle a canceled touche the same as a touch end.
            let touch = changed.item(i);
            let existingTouch = find(this._touchData, d => {
                return d.identifier === touch.identifier;
            });
            existingTouch.state.setUpFrame(this._options.time.frameCount);
            existingTouch.clientPos = new Vector2(touch.clientX, touch.clientY);
            existingTouch.pagePos = new Vector2(touch.pageX, touch.pageY);
            existingTouch.screenPos = this._calculateScreenPos(touch.pageX, touch.pageY);
            if (existingTouch.fingerIndex === 0) {
                this._copyToPrimaryTouchData(existingTouch);
            }
            if (this.debugLevel >= 1) {
                console.log('touch finger ' +
                    existingTouch.fingerIndex +
                    ' canceled. fireInputOnFrame: ' +
                    this._options.time.frameCount);
            }
        }
    }
    _handleContextMenu(event) {
        // Prevent context menu from triggering.
        event.preventDefault();
        event.stopPropagation();
    }
}
var InputType;
(function (InputType) {
    InputType["Undefined"] = "undefined";
    InputType["Mouse"] = "mouse";
    InputType["Touch"] = "touch";
})(InputType || (InputType = {}));
var MouseButtonId;
(function (MouseButtonId) {
    MouseButtonId[MouseButtonId["Left"] = 0] = "Left";
    MouseButtonId[MouseButtonId["Middle"] = 1] = "Middle";
    MouseButtonId[MouseButtonId["Right"] = 2] = "Right";
})(MouseButtonId || (MouseButtonId = {}));
class InputState {
    constructor() {
        /**
         * The frame this input was down.
         */
        this._downFrame = -1;
        /**
         * The frame this input was up.
         */
        this._upFrame = -1;
    }
    getDownFrame() {
        return this._downFrame;
    }
    setDownFrame(frame) {
        this._downFrame = frame;
    }
    getUpFrame() {
        return this._upFrame;
    }
    setUpFrame(frame) {
        this._upFrame = frame;
    }
    /**
     * Is the input down on the requested frame. Will only return true on the exact frame.
     * @see isHeldOnFrame() for true result for every frame the input is down.
     * @param frame The frame to compare against.
     */
    isDownOnFrame(frame) {
        return frame === this._downFrame;
    }
    /**
     * Is the input held on the requested frame. Will return for every frame the input is held down.
     * @param frame The frame to compare against.
     */
    isHeldOnFrame(frame) {
        // Down frame must have been set.
        if (this._downFrame !== -1) {
            // Down frame must be more recent than the up frame.
            if (this._downFrame > this._upFrame) {
                // Frame must be same or higher than down frame.
                if (frame >= this._downFrame) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Is the input up on the requested frame. Will only return true on the exact frame.
     * @param frame The frame to compare against.
     */
    isUpOnFrame(frame) {
        return frame === this._upFrame;
    }
    /**
     * Returns a new InputState with the same values as this one.
     */
    clone() {
        let clone = new InputState();
        clone._downFrame = this._downFrame;
        clone._upFrame = this._upFrame;
        return clone;
    }
}
class WheelData {
    constructor() {
        this._wheelFrames = [];
    }
    /**
     * Add the WheelFrame to the WheelData frame array.
     * @param wheelFrame
     */
    addFrame(wheelFrame) {
        this._wheelFrames.push(wheelFrame);
    }
    /**
     * Returns the WheelFrame for the specified frame number.
     * @param frame The frame number to retrieve.
     */
    getFrame(frame) {
        let wheelFrame = find(this._wheelFrames, (f) => {
            return f.moveFrame === frame;
        });
        if (wheelFrame)
            return wheelFrame;
        else
            return null;
    }
    /**
     * Remove all WheelFrame objects that are older than the specified current frame.
     * @param curFrame The current frame number.
     */
    removeOldFrames(curFrame) {
        if (this._wheelFrames.length === 0)
            return;
        // console.log('removeOldFrames wheelFrameCount: ' + this._wheelFrames.length + ', curFrame: ' + curFrame);
        this._wheelFrames = this._wheelFrames.filter((f) => {
            return f.moveFrame >= curFrame;
        });
        // console.log('removeOldFrames after filter wheelFrameCount: ' + this._wheelFrames.length);
    }
}

class Decorator {
    constructor() {
        this._configured = false;
        this._willDestroy = false;
        this._destroyed = false;
        this._started = false;
        this._gameObject = null;
    }
    static destroy(decorator) {
        if (decorator._destroyed) {
            return;
        }
        if (!decorator._willDestroy) {
            decorator.onWillDestroy();
        }
        decorator.onDestroy();
    }
    get destroyed() {
        return this._destroyed;
    }
    get gameObject() {
        return this._gameObject;
    }
    get started() {
        return this._started;
    }
    configure(option) {
        this._configured = true;
    }
    /**
     * Called once when the Decorator is attached to a gameObject.
     */
    onAttach(gameObject) {
        if (!this._configured) {
            throw new Error(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} did not have configure() called before being attached to gameObject.`);
        }
        this._gameObject = gameObject;
    }
    /**
     * Called when the GameObject that this Decorator is attached to becomes visible.
     */
    onVisible() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onVisible`);
    }
    /**
     * Called when the GameObject that this Decorator is attached to becomes invisible.
     */
    onInvisible() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onInvisible`);
    }
    /**
     * Called once when the Decorator is first started.
     */
    onStart() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onStart`);
        this._started = true;
    }
    /**
     * Called for each three js frame.
     */
    onUpdate() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onUpdate`);
    }
    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate() {
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onLateUpdate`);
    }
    /**
     * Called when the GameObject that this Decorator is attached to is marked for destruction.
     */
    onWillDestroy() {
        this._willDestroy = true;
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onWillDestroy`);
    }
    /**
     * Called once when the Decorator is being destroyed.
     */
    onDestroy() {
        this._destroyed = true;
        // console.log(`[Decorator] ${this.constructor.name} on ${this.gameObject.name} onDestroy`);
    }
}

/**
 * Set the parent of the object3d.
 * @param object3d the object to re-parent.
 * @param parent the object to parent to.
 * @param scene the scene that these objects exist in.
 */
function setParent(object3d, parent, scene) {
    if (!object3d)
        return;
    if (!scene)
        throw new Error('utils.setParent needs a valid scene parameter.');
    // Detach
    if (object3d.parent && object3d.parent !== scene) {
        object3d.applyMatrix4(object3d.parent.matrixWorld);
        object3d.parent.remove(object3d);
        scene.add(object3d);
    }
    // Attach
    if (parent) {
        object3d.applyMatrix4(parent.matrixWorld.clone().invert());
        scene.remove(object3d);
        parent.add(object3d);
    }
    object3d.updateMatrixWorld(true);
}
/**
 * Find the scene object that the given object is parented to.
 * Will return null if no parent scene is found.
 * @param object3d The object to find the parent scene for.
 */
function findParentScene(object3d) {
    if (!object3d) {
        return null;
    }
    if (object3d instanceof Scene) {
        return object3d;
    }
    else {
        return findParentScene(object3d.parent);
    }
}
/**
 * Is the object a child of the given parent object.
 * @param parent The parent object that we want to know if the other object is a child of.
 * @param object The object that we want to know if is a child of the parent object.
 */
function isObjectChildOf(object, parent) {
    if (!parent || !object.parent) {
        return false;
    }
    if (object.parent === parent) {
        return true;
    }
    else {
        return isObjectChildOf(object.parent, parent);
    }
}
/**
 * Convert the Box3 object to a box2 object. Basically discards the z components of the Box3's min and max.
 * @param box3 The Box3 to convert to a Box2.
 */
function convertToBox2(box3) {
    return new Box2(new Vector2(box3.min.x, box3.min.y), new Vector2(box3.max.x, box3.max.y));
}
/**
 * Set the layer number that the given object 3d is on (and optionally all of its children too).
 * @param obj The root object 3d to change the layer.
 * @param layer The layer to set the object 3d to.
 * @param children Should change all children of given object 3d as well?
 */
function setLayer(obj, layer, children) {
    obj.layers.set(layer);
    if (children) {
        traverseSafe(obj, (child) => child.layers.set(layer));
    }
}
/**
 * Set the layer mask of the given object 3d (and optionally all of its children too).
 * @param obj The root object 3d to change the layer.
 * @param layerMask The layer mask to set the object 3d to.
 * @param children Should change all children of given object 3d as well?
 */
function setLayerMask(obj, layerMask, children) {
    obj.layers.mask = layerMask;
    if (children) {
        traverseSafe(obj, (child) => child.layers.mask = layerMask);
    }
}
/**
 * Debug print out all 32 layers for this object and wether or not it belongs to them.
 * @param obj The object to print out layers for.
 */
function debugLayersToString(obj) {
    if (!obj)
        return;
    let output = '\n';
    for (let i = 0; i < 32; i++) {
        let l = new Layers();
        l.set(i);
        output += '[' + i + ']  ' + obj.layers.test(l) + '\n';
    }
    return output;
}
function isObjectVisible(obj) {
    if (!obj) {
        return false;
    }
    while (obj) {
        if (!obj.visible) {
            return false;
        }
        obj = obj.parent;
    }
    return true;
}
function disposeObject3d(obj) {
    if (obj) {
        traverseSafe(obj, (o) => {
            if (o instanceof Mesh) {
                if (o.geometry) {
                    o.geometry.dispose();
                }
                if (Array.isArray(o.material)) {
                    o.material.forEach((m) => m.dispose());
                }
                else {
                    o.material.dispose();
                }
            }
            if (o.parent) {
                o.parent.remove(o);
            }
        });
    }
}
/**
 * Dispose of each object 3d in the array and then clear the array.
 */
function disposeObject3ds(objs) {
    if (objs && objs.length > 0) {
        for (let i = 0; i < objs.length; i++) {
            disposeObject3d(objs[i]);
        }
        objs = [];
    }
}
function createDebugSphere(radius, color, lit) {
    const geometry = new SphereBufferGeometry(radius, 24, 24);
    let material;
    if (lit) {
        material = new MeshStandardMaterial({
            color,
        });
    }
    else {
        material = new MeshBasicMaterial({
            color,
        });
    }
    return new Mesh(geometry, material);
}
function createDebugCube(size, color, lit) {
    const geometry = new BoxBufferGeometry(size, size, size);
    let material;
    if (lit) {
        material = new MeshStandardMaterial({
            color,
        });
    }
    else {
        material = new MeshBasicMaterial({
            color,
        });
    }
    return new Mesh(geometry, material);
}
function worldToScreenPosition(target, camera) {
    const pos = new Vector3();
    if (target instanceof Object3D) {
        pos.setFromMatrixPosition(target.matrixWorld);
    }
    else {
        pos.copy(target);
    }
    pos.project(camera);
    const halfWidth = window.innerWidth * 0.5;
    const halfHeight = window.innerHeight * 0.5;
    pos.x = (pos.x * halfWidth) + halfWidth;
    pos.y = -(pos.y * halfHeight) + halfHeight;
    pos.z = 0;
    return new Vector2(pos.x, pos.y);
}
/**
 * Return the world direction for the given local direction from the object's perspective.
 * @param localDirection The local direction.
 * @param obj The object to return the world direction for.
 */
function objectWorldDirection(localDirection, obj) {
    const worldRotation = new Quaternion();
    worldRotation.setFromRotationMatrix(obj.matrixWorld);
    const forward = localDirection.clone().applyQuaternion(worldRotation);
    return forward;
}
function getMaterials(mesh) {
    if (Array.isArray(mesh.material)) {
        return mesh.material;
    }
    else {
        return [mesh.material];
    }
}
function getWorldPosition(object3d) {
    const worldPos = new Vector3();
    object3d.getWorldPosition(worldPos);
    return worldPos;
}
function setWorldPosition(object3d, target) {
    const scene = findParentScene(object3d);
    if (!scene) {
        console.error(`Cannot set world position of object3d ${object3d.name} because it is not attached to a scene.`);
        return;
    }
    let matrixWorld;
    if (target instanceof Vector3) {
        matrixWorld = new Matrix4();
        matrixWorld.setPosition(target);
    }
    else {
        matrixWorld = target.matrixWorld;
    }
    const prevParent = object3d.parent;
    scene.attach(object3d);
    object3d.position.setFromMatrixPosition(matrixWorld);
    prevParent.attach(object3d);
}
function rotationToFace(object3d, worldPos) {
    const dummy = new Object3D();
    if (object3d.parent) {
        object3d.parent.add(dummy);
    }
    setWorldPosition(dummy, object3d);
    dummy.rotation.copy(object3d.rotation);
    dummy.scale.copy(object3d.scale);
    dummy.lookAt(worldPos);
    const faceRotation = dummy.quaternion.clone();
    if (dummy.parent) {
        dummy.parent.remove(dummy);
    }
    return faceRotation;
}
/**
 * Same function as Object3D.traverse except that it does not execute on children that have become undefined like the built-in function does.
 */
function traverseSafe(object3d, callback) {
    callback(object3d);
    const children = object3d.children;
    for (let i = 0, l = children.length; i < l; i++) {
        if (children[i]) {
            traverseSafe(children[i], callback);
        }
    }
}
/**
 * Same function as Object3D.traverseVisible except that it does not execute on children that have become undefined like the built-in function does.
 */
function traverseVisibleSafe(object3d, callback) {
    if (object3d.visible === false)
        return;
    callback(object3d);
    const children = object3d.children;
    for (let i = 0, l = children.length; i < l; i++) {
        if (children[i]) {
            traverseVisibleSafe(children[i], callback);
        }
    }
}

var DestroyState;
(function (DestroyState) {
    DestroyState[DestroyState["None"] = -1] = "None";
    DestroyState[DestroyState["WillDestroy"] = 0] = "WillDestroy";
    DestroyState[DestroyState["Destroyed"] = 1] = "Destroyed";
})(DestroyState || (DestroyState = {}));
/**
 * GameObject is an APEngine specific implemention of Three's Object3D class that supports decorators.
 */
class GameObject extends Object3D {
    constructor(name) {
        super();
        this._decorators = [];
        this._destroyState = DestroyState.None;
        this._prevVisible = false;
        if (name) {
            this.name = name;
        }
    }
    /**
     * Destroy the given GameObject and all of its children.
     */
    static destroy(gameObject) {
        // Get array of all child gameObjects in ascending order,
        // including the given gameObject.
        traverseSafe(gameObject, (go) => {
            if (go instanceof GameObject) {
                if (go._destroyState === DestroyState.None) {
                    GameObject.__APEngine_destroyQueue.push(go);
                    go._destroyState = DestroyState.WillDestroy;
                    // Inform all gameObject decorators that it will be destroyed.
                    go._decorators.forEach(d => d.onWillDestroy());
                }
            }
        });
    }
    /**
     * Process the GameObject destroy queue.
     * This should ONLY be called by APEngine.
     */
    static __APEngine_ProcessGameObjectDestroyQueue() {
        if (this.__APEngine_destroyQueue.length > 0) {
            // Use a copy of the destroy queue in its current state so that 
            // any modifications to the destroy queue during processing are not affected.
            const count = this.__APEngine_destroyQueue.length;
            for (let i = 0; i < count; i++) {
                const gameObject = this.__APEngine_destroyQueue.pop();
                if (gameObject && gameObject._destroyState === DestroyState.WillDestroy) {
                    // Infrom the gameobject that it is being destroyed.
                    gameObject.onDestroy();
                    gameObject._destroyState = DestroyState.Destroyed;
                }
            }
        }
    }
    /**
     * Is the given GameObject visible to rendering?
     * This function taked into account the visibility of the gameObject's parents.
     */
    static isGameObjectVisible(gameObject) {
        let obj = gameObject;
        if (!obj) {
            return false;
        }
        while (obj) {
            if (!obj.visible) {
                return false;
            }
            obj = obj.parent;
        }
        return true;
    }
    /**
     * Find the GameObject that is a parent of the given object.
     * If the object is a GameObject, then the object itself is returned.
     * If the object has no GameObject parents, then null is returned.
     */
    static findParentGameObject(obj) {
        if (obj instanceof GameObject) {
            return obj;
        }
        if (obj.parent) {
            return GameObject.findParentGameObject(obj.parent);
        }
        return null;
    }
    /**
     * Find a GameObject that has the given name at or underneath the given root/scene.
     */
    static findGameObjectByName(root, name) {
        if (root instanceof GameObject && root.name === name) {
            return root;
        }
        for (let child of root.children) {
            const go = GameObject.findGameObjectByName(child, name);
            if (go) {
                return go;
            }
        }
        return null;
    }
    get destroyed() {
        return this._destroyState !== DestroyState.None;
    }
    addDecorator(decorator) {
        if (this._decorators.some((d) => d === decorator)) {
            // Decorator is already added.
            return;
        }
        // Add decorator to the array.
        this._decorators.push(decorator);
        decorator.onAttach(this);
        return decorator;
    }
    getDecorator(type) {
        if (!this.destroyed) {
            for (let i = 0; i < this._decorators.length; i++) {
                const decorator = this._decorators[i];
                if (decorator instanceof type && !decorator.destroyed) {
                    return decorator;
                }
            }
        }
        return null;
    }
    getDecorators(type) {
        let decorators = [];
        if (!this.destroyed) {
            for (let i = 0; i < this._decorators.length; i++) {
                const decorator = this._decorators[i];
                if (decorator instanceof type && !decorator.destroyed) {
                    decorators.push(decorator);
                }
            }
        }
        if (decorators.length > 0) {
            return decorators;
        }
        else {
            return null;
        }
    }
    getDecoratorInChildren(type, includeInvisible) {
        // Check this gameObject for matching decorator.
        if (includeInvisible || this.visible) {
            const decorator = this.getDecorator(type);
            if (decorator) {
                return decorator;
            }
        }
        // Recursively search through child gameObjects for matching decorator.
        for (const child of this.children) {
            if (child instanceof GameObject) {
                const decorator = child.getDecoratorInChildren(type, includeInvisible);
                if (decorator) {
                    return decorator;
                }
            }
        }
        // No matching decorator found in this gameObject or its children.
        return null;
    }
    getDecoratorsInChildren(type, includeInvisible) {
        const decorators = [];
        if (!includeInvisible) {
            traverseVisibleSafe(this, (o) => {
                if (o instanceof GameObject) {
                    const decs = o.getDecorators(type);
                    if (decs) {
                        decorators.push(...decs);
                    }
                }
            });
        }
        else {
            traverseSafe(this, (o) => {
                if (o instanceof GameObject) {
                    const decs = o.getDecorators(type);
                    if (decs) {
                        decorators.push(...decs);
                    }
                }
            });
        }
        if (decorators.length > 0) {
            return decorators;
        }
        else {
            return null;
        }
    }
    getDecoratorInParent(type, includeInvisible) {
        // Check this gameObject for matching decorator.
        if (includeInvisible || this.visible) {
            const decorator = this.getDecorator(type);
            if (decorator) {
                return decorator;
            }
        }
        // Recursively search through parent gameObjects for matching decorator.
        if (this.parent && this.parent instanceof GameObject) {
            const decorator = this.parent.getDecoratorInParent(type, includeInvisible);
            if (decorator) {
                return decorator;
            }
        }
        // No matching decorator found in this gameObject or its parents.
        return null;
    }
    /**
     * Called for each three js frame.
     */
    onUpdate() {
        if (this.destroyed) {
            return;
        }
        let isVisible = GameObject.isGameObjectVisible(this);
        this._decorators.forEach((d) => {
            if (!d.destroyed && isVisible) {
                if (!d.started) {
                    this._prevVisible = true;
                    d.onVisible();
                    d.onStart();
                    if (!d.started) {
                        console.error(`Decorator ${d.constructor.name} does not have super.onStart() called.`);
                    }
                }
                else {
                    isVisible = this.visibleChangeCheck();
                }
                if (isVisible) {
                    d.onUpdate();
                }
            }
        });
        this.cleanupDestroyedDecorators();
    }
    /**
     * Called for each three js frame but after all onUpdate calls have been made.
     */
    onLateUpdate() {
        if (this.destroyed) {
            return;
        }
        const isVisible = this.visibleChangeCheck();
        this._decorators.forEach((d) => {
            if (!d.destroyed && isVisible) {
                d.onLateUpdate();
            }
        });
        this.cleanupDestroyedDecorators();
    }
    /**
     * Run a visibility change check. Returns the current state of gameobject visibility.
     */
    visibleChangeCheck() {
        const isVisible = GameObject.isGameObjectVisible(this);
        if (this._prevVisible !== isVisible) {
            this._decorators.forEach((d) => {
                if (!d.destroyed) {
                    if (isVisible) {
                        d.onVisible();
                    }
                    else {
                        d.onInvisible();
                    }
                }
            });
            this._prevVisible = isVisible;
        }
        return isVisible;
    }
    onDestroy() {
        // Destroy our decorators.
        this._decorators.forEach((c) => {
            Decorator.destroy(c);
        });
        this._decorators = [];
        if (this.parent) {
            // Remove ourself from parent object (and thus the scene).
            this.parent.remove(this);
        }
    }
    cleanupDestroyedDecorators() {
        this._decorators = this._decorators.filter((c) => {
            return !c.destroyed;
        });
    }
}
GameObject.__APEngine_destroyQueue = [];

class XRInput {
    constructor(renderer) {
        this.onSelectStart = new ArgEvent();
        this.onSelect = new ArgEvent();
        this.onSelectEnd = new ArgEvent();
        this._renderer = renderer;
        this._onControllerSelectStart = this._onControllerSelectStart.bind(this);
        this._onControllerSelect = this._onControllerSelect.bind(this);
        this._onControllerSelectEnd = this._onControllerSelectEnd.bind(this);
        // Setup AR controller.
        this.controller = this._renderer.xr.getController(0);
        this.controller.addEventListener('selectstart', this._onControllerSelectStart);
        this.controller.addEventListener('select', this._onControllerSelect);
        this.controller.addEventListener('selectend', this._onControllerSelectEnd);
    }
    /**
     * Return the controller's pose at the current time.
     * This is a snapshot of the controller's pose and will not change as the controller moves.
     */
    getCurrentControllerPose() {
        if (this.controller) {
            const controllerPose = {
                position: new Vector3(),
                rotation: new Quaternion(),
                scale: new Vector3()
            };
            this.controller.matrixWorld.decompose(controllerPose.position, controllerPose.rotation, controllerPose.scale);
            return controllerPose;
        }
        else {
            return null;
        }
    }
    dispose() {
        if (this.controller) {
            this.controller.removeEventListener('selectstart', this._onControllerSelectStart);
            this.controller.removeEventListener('select', this._onControllerSelect);
            this.controller.removeEventListener('selectend', this._onControllerSelectEnd);
        }
    }
    _onControllerSelectStart() {
        this.onSelectStart.invoke(this.getCurrentControllerPose());
    }
    _onControllerSelect() {
        this.onSelect.invoke(this.getCurrentControllerPose());
    }
    _onControllerSelectEnd() {
        this.onSelectEnd.invoke(this.getCurrentControllerPose());
    }
}

class PerformanceStats {
    constructor() {
        this._enabled = false;
        this._position = null;
        this._stats = null;
        this._onEnable = this._onEnable.bind(this);
        this._onDisable = this._onDisable.bind(this);
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(enable) {
        if (this._enabled !== enable) {
            this._enabled = enable;
            if (this._enabled) {
                this._onEnable();
            }
            else {
                this._onDisable();
            }
        }
    }
    get position() {
        return this._position;
    }
    set position(pos) {
        if (this._position !== pos) {
            this._position = pos;
            this._updatePosition();
        }
    }
    update() {
        if (this._enabled) {
            this._stats.update();
        }
    }
    dispose() {
        this.enabled = false;
    }
    _onEnable() {
        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);
        this._updatePosition();
    }
    _onDisable() {
        document.body.removeChild(this._stats.dom);
        this._stats = null;
    }
    _updatePosition() {
        if (!this._stats) {
            return;
        }
        let pos = this._position;
        if (!pos) {
            pos = 'bottom left';
        }
        if (pos === 'top left') {
            this._stats.dom.style.top = '0px';
            this._stats.dom.style.left = '0px';
            this._stats.dom.style.right = '';
            this._stats.dom.style.bottom = '';
        }
        else if (pos === 'top right') {
            this._stats.dom.style.top = '0px';
            this._stats.dom.style.left = '';
            this._stats.dom.style.right = '0px';
            this._stats.dom.style.bottom = '';
        }
        else if (pos === 'bottom left') {
            this._stats.dom.style.top = '';
            this._stats.dom.style.left = '0px';
            this._stats.dom.style.right = '';
            this._stats.dom.style.bottom = '0px';
        }
        else if (pos === 'bottom right') {
            this._stats.dom.style.top = '';
            this._stats.dom.style.left = '';
            this._stats.dom.style.right = '0px';
            this._stats.dom.style.bottom = '0px';
        }
    }
}

function hasValue(obj) {
    return obj !== undefined && obj !== null;
}
function getOptionalValue(obj, defaultValue) {
    return obj !== undefined && obj !== null ? obj : defaultValue;
}
/**
 * Post the given data object as JSON to the provided URL.
 * @returns - Promise that resolves to a Response or null if an exception occured.
 */
function postJsonData(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[postJsonData] start...`);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const init = {
            method: 'POST',
            body: JSON.stringify(data),
            mode: 'cors',
            headers: headers,
        };
        const request = new Request(url, init);
        console.log(request);
        try {
            // Until aux is CORS enabled, the response will always be opaque and thus checking the response for anything is pointless.
            const response = yield fetch(request);
            console.log(`[postJsonData] response received.`);
            return response;
        }
        catch (error) {
            console.error(`[postJsonData] Could not fetch. error: ${error}`);
            return null;
        }
    });
}
/**
 * Search through element's descendents and return the first child element that contains the given class name(s).
 * An element must contain all of the given class names in order to be matched.
 * @param element The element to search the descendents of.
 * @param className The class name(s) to search for. Can be either a single class name or many.
 */
function getElementByClassName(element, names) {
    if (element instanceof HTMLElement) {
        // Check element for class names.
        const elementClassList = element.classList;
        if (elementClassList.length > 0) {
            const classNames = names.split(' ');
            let classFoundCount = 0;
            for (const className of classNames) {
                if (elementClassList.contains(className)) {
                    classFoundCount++;
                    if (classFoundCount === classNames.length) {
                        return element;
                    }
                }
            }
        }
    }
    // Check descendents of element.
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        const match = getElementByClassName(children[i], names);
        if (match !== null) {
            return match;
        }
    }
    // No matching element.
    return null;
}
function getFilename(path) {
    const lastSlashIndex = path.lastIndexOf('/');
    let filename = null;
    if (lastSlashIndex < 0) {
        filename = path;
    }
    else {
        filename = path.substr(lastSlashIndex + 1);
    }
    // Make sure that it is a file by check for an extension.
    const ext = getExtension(filename);
    if (ext !== null) {
        return filename;
    }
    else {
        return null;
    }
}
function getExtension(path) {
    if (path.includes('.')) {
        const ext = path.split('.').pop();
        if (ext) {
            if (!ext.includes('/')) {
                return ext;
            }
        }
    }
    return null;
}
/**
 * Load the image from the given url (or from the cache if the browser as it stored).
 * @param url Location of the image to load.
 */
function loadImage(url, onProgress) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(((resolve, reject) => {
            const img = new Image();
            img.addEventListener('load', (event) => {
                resolve(img);
            });
            img.addEventListener('progress', (event) => {
                if (onProgress) {
                    onProgress(event);
                }
            });
            img.addEventListener('error', (event) => {
                reject(event);
            });
            img.src = url;
        }));
    });
}
function copyToClipboard(text) {
    // Create text area element to contain text content.
    const textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.textContent = text;
    document.body.appendChild(textArea);
    // Select text area element and execute document's copy command.
    textArea.select();
    document.execCommand('copy');
    // Remove text area element from document.
    textArea.remove();
}
function appendLine(text, line) {
    if (!text || text.length === 0) {
        return line;
    }
    else if (text.length > 0) {
        text += `\n${line}`;
    }
    return text;
}
function sortAZ(array, propertyKey) {
    array.sort((a, b) => {
        return a[propertyKey] > b[propertyKey] ? 1 : -1;
    });
}
function sortZA(array, propertyKey) {
    array.sort((a, b) => {
        return a[propertyKey] < b[propertyKey] ? 1 : -1;
    });
}

const Vector3_Up = new Vector3(0, 1, 0);
const Vector3_Down = new Vector3(0, -1, 0);
const Vector3_Forward = new Vector3(0, 0, 1);
const Vector3_Back = new Vector3(0, 0, -1);
const Vector3_Left = new Vector3(-1, 0, 0);
const Vector3_Right = new Vector3(1, 0, 0);
const Vector3_Zero = new Vector3(0, 0, 0);
const Vector3_One = new Vector3(1, 1, 1);
function interpolate(start, end, progress, ease) {
    if (ease) {
        progress = ease(progress);
    }
    return (1 - progress) * start + progress * end;
}
function interpolateClamped(start, end, progress, ease) {
    const value = interpolate(start, end, progress, ease);
    return clamp(value, start, end);
}
function clamp(value, min, max) {
    if (hasValue(min) && value < min) {
        value = min;
    }
    if (hasValue(max) && value > max) {
        value = max;
    }
    return value;
}
function inRange(value, min, max) {
    if (value <= max && value >= min) {
        return true;
    }
    else {
        return false;
    }
}
function isEven(value) {
    return value % 2 === 0;
}
function isOdd(value) {
    return !isEven(value);
}
function clampDegAngle(value, min, max) {
    if (value < -360)
        value += 360;
    if (value > 360)
        value -= 360;
    return clamp(value, min, max);
}
function pointOnSphere(center, radius, rotation) {
    /*
        Reference: https://stackoverflow.com/questions/11819833/finding-3d-coordinates-from-point-with-known-xyz-angles-radius-and-origin
        x = origin.x + radius * math.cos(math.rad(rotation.y)) * math.cos(math.rad(rotation.x))
        y = origin.y + radius * math.sin(math.rad(rotation.x))
        z = origin.z + radius * math.sin(math.rad(rotation.y)) * math.cos(math.rad(rotation.x))
     */
    const pos = new Vector3();
    pos.x = center.x + radius * Math.cos(MathUtils.DEG2RAD * rotation.y) * Math.cos(MathUtils.DEG2RAD * rotation.x);
    pos.y = center.y + radius * Math.sin(MathUtils.DEG2RAD * rotation.x);
    pos.z = center.z + radius * Math.sin(MathUtils.DEG2RAD * rotation.y) * Math.cos(MathUtils.DEG2RAD * rotation.x);
    return pos;
}
function pointOnCircle(center, radius, angle) {
    const angleRad = angle * MathUtils.DEG2RAD;
    const point = new Vector2(center.x + radius * Math.sin(angleRad), center.y + radius * Math.cos(angleRad));
    return point;
}
/**
 * Tests if point is inside the given polygon. Test is done in 2d space.
 * Reference: https://codepen.io/prisoner849/pen/ROdXzw?editors=1010
 */
function pointInPolygon2D(point, polyPoints) {
    const x = point.x;
    const y = point.y;
    let inside = false;
    for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        let xi = polyPoints[i].x, yi = polyPoints[i].y;
        let xj = polyPoints[j].x, yj = polyPoints[j].y;
        let intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }
    return inside;
}
function calculateRowOffsets(rowLength, cellWidth, alignment) {
    if (rowLength <= 0) {
        return [];
    }
    const totalWidth = (rowLength - 1) * cellWidth;
    // Our start x and offset will be different based on which how we want to align the children.
    let startX;
    let offset;
    if (alignment == 'start') {
        startX = 0;
        offset = -cellWidth;
    }
    else if (alignment == 'center') {
        startX = -(totalWidth * 0.5);
        offset = cellWidth;
    }
    else {
        startX = 0;
        offset = cellWidth;
    }
    const rowOffsets = [];
    for (let i = 0; i < rowLength; i++) {
        rowOffsets.push(startX + (offset * i));
    }
    return rowOffsets;
}
function normalize(value, min, max) {
    return (value - min) / (max - min);
}
function normalizeClamped(value, min, max) {
    value = clamp(value, min, max);
    return (value - min) / (max - min);
}
function unnormalize(normal, min, max) {
    return normal * (max - min) + min;
}
function unnormalizeClamped(normal, min, max) {
    normal = clamp(normal, 0.0, 1.0);
    return normal * (max - min) + min;
}
function calculateFrustumPlanes(size, aspect) {
    return {
        left: -size * aspect / 2,
        right: size * aspect / 2,
        top: size / 2,
        bottom: -size / 2,
    };
}
/**
 * Split integer number into an array of mostly equal parts.
 * @example
 * splitInteger(10, 3) // [4, 3, 3]
 * splitInteger(142, 5) // [29, 29, 28, 28, 28]
 */
function splitInteger(num, parts) {
    if (!Number.isInteger(num)) {
        return null;
    }
    if (num < parts) {
        return null;
    }
    const mod = num % parts;
    const splitArray = [];
    if (mod === 0) {
        const value = num / parts;
        for (let i = 0; i < parts; i++) {
            splitArray.push(value);
        }
        return splitArray;
    }
    else {
        const value = (num - mod) / parts;
        for (let i = 0; i < parts; i++) {
            splitArray.push(value);
        }
        for (let i = 0; i < mod; i++) {
            splitArray[i] = splitArray[i] + 1;
        }
        return splitArray;
    }
}

class PerformanceResolutionScalar {
    constructor(renderer, options) {
        this.enabled = true;
        this.targetFramerate = 60;
        this.minimumPixelRatio = 0.5;
        this.pixelRatioAdjustRate = 0.01;
        this._lastFrameTimestamp = -1;
        this._lastFrameTime = -1;
        this._renderer = renderer;
        this.debugUI = new PerformanceResolutionScalarDebugUI();
        this.debugUI.visible = false;
        if (!options) {
            options = {};
        }
        if (hasValue(options.startEnabled)) {
            this.enabled = options.startEnabled;
        }
        if (hasValue(options.targetFramerate)) {
            this.targetFramerate = options.targetFramerate;
        }
        if (hasValue(options.targetPixelRatio)) {
            this.targetPixelRatio = options.targetPixelRatio;
        }
        else {
            this.targetPixelRatio = renderer.getPixelRatio();
        }
        if (hasValue(options.minimumPixelRatio)) {
            this.minimumPixelRatio = options.minimumPixelRatio;
        }
        if (hasValue(options.pixelRatioAdjustRate)) {
            this.pixelRatioAdjustRate = options.pixelRatioAdjustRate;
        }
    }
    update() {
        const frameTimestamp = performance.now();
        if (this._lastFrameTimestamp > 0 && this.enabled) {
            const currentFrameTime = frameTimestamp - this._lastFrameTimestamp;
            const targetFrameTime = Math.ceil(1000 / this.targetFramerate);
            this.debugUI.customText("targetTime", `Target Frame Time: ${targetFrameTime.toFixed(2)}`);
            // Reference: https://software.intel.com/en-us/articles/dynamic-resolution-rendering-article/
            const t = (targetFrameTime - currentFrameTime) / targetFrameTime;
            this.debugUI.customText("t", `T: ${t.toFixed(2)}`);
            let ratioDelta = 0;
            if (t < 0) {
                ratioDelta = -this.pixelRatioAdjustRate;
            }
            else if (t > 0) {
                ratioDelta = this.pixelRatioAdjustRate;
            }
            // const ratioDelta: number =
            // this.pixelRatioAdjustRate * this._renderer.getPixelRatio() * t;
            this.debugUI.customText("ratioDelta", `Ratio Delta: ${ratioDelta.toFixed(2)}`);
            if (ratioDelta !== 0) {
                // Apply pixel ratio adjustment.
                const newPixelRatio = clamp(this._renderer.getPixelRatio() + ratioDelta, this.minimumPixelRatio, this.targetPixelRatio);
                // console.log(`new pixel ratio: ${newPixelRatio}`);
                if (this._renderer.getPixelRatio() !== newPixelRatio) {
                    // console.log("new pixel ratio: " + newPixelRatio);
                    this._renderer.setPixelRatio(newPixelRatio);
                }
            }
            this._lastFrameTime = currentFrameTime;
        }
        this._lastFrameTimestamp = frameTimestamp;
        this.debugUI.update(this);
    }
    getCurrentPixelRatio() {
        return this._renderer.getPixelRatio();
    }
    getLastFrameTime() {
        return this._lastFrameTime;
    }
}
class PerformanceResolutionScalarDebugUI {
    constructor() {
        this._rootEl = document.createElement("div");
        document.body.appendChild(this._rootEl);
        this._rootEl.style.position = "absolute";
        this._rootEl.style.left = 0 + "px";
        this._rootEl.style.bottom = 0 + "px";
        this._rootEl.style.minWidth = 180 + "px";
        this._rootEl.style.padding = 2 + "px";
        this._rootEl.style.backgroundColor = "#000";
        this._rootEl.style.fontFamily = "Courier New";
        this._pixelRatioEl = this._addTextElement(this._rootEl);
        this._minMaxEl = this._addTextElement(this._rootEl);
        this._frameTimeEl = this._addTextElement(this._rootEl);
    }
    get visible() {
        return this._rootEl.style.display === "block";
    }
    set visible(visible) {
        this._rootEl.style.display = visible ? "block" : "none";
    }
    _addTextElement(parent) {
        const textEl = document.createElement("p");
        textEl.style.color = "#fff";
        textEl.style.margin = 1 + "px";
        parent.appendChild(textEl);
        return textEl;
    }
    customText(id, text) {
        if (!this.visible) {
            return;
        }
        if (!this._customTextMap) {
            this._customTextMap = new Map();
        }
        let textEl = this._customTextMap.get(id);
        if (!textEl) {
            textEl = this._addTextElement(this._rootEl);
            this._customTextMap.set(id, textEl);
        }
        textEl.innerText = text;
    }
    update(scalar) {
        if (!this.visible) {
            return;
        }
        this._pixelRatioEl.innerText = `Pixel Ratio: ${scalar
            .getCurrentPixelRatio()
            .toFixed(2)}`;
        this._minMaxEl.innerText = `Min/Max: ${scalar.minimumPixelRatio} / ${scalar.targetPixelRatio}`;
        this._frameTimeEl.innerHTML = `Frame Time: ${scalar
            .getLastFrameTime()
            .toFixed(2)}`;
    }
}

/**
 * Returns a promise that waits for the given condition function to return true.
 * If the condition function returns false, it will continue to be called at a regular interval until
 * the condition function returns true.
 * @param condition A function that must return true in order for the promise to resolve.
 * @param timeout An optional timeout value. Must be greater than 0 to be used. If condition is not met before timeout (ms), then the promise is rejected.
 * @param tickRate A optional tick rate value. Must be greater than 0. How frequently the condition function should be called (in ms).
 */
function waitForCondition(condition, timeout, tickRate) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof tickRate !== 'number' || tickRate <= 0) {
            tickRate = 30;
        }
        return new Promise((resolve, reject) => {
            let tickTimeoutId;
            let timeoutId;
            const tick = () => {
                if (condition()) {
                    window.clearTimeout(tickTimeoutId);
                    window.clearTimeout(timeoutId);
                    return resolve();
                }
                else {
                    tickTimeoutId = window.setTimeout(tick, tickRate);
                }
            };
            tick();
            if (typeof timeout === 'number' && timeout > 0) {
                timeoutId = window.setTimeout(() => {
                    // Timeout reached before promise was able to resolve.
                    window.clearTimeout(tickTimeoutId);
                    // Check for condition one last time in last ditch effort to resolve.
                    if (condition()) {
                        return resolve();
                    }
                    else {
                        return reject('Timeout occured before condition could be met.');
                    }
                }, timeout);
            }
        });
    });
}
/**
 * Return a promise that waits the given number of seconds before resolving.
 * @param seconds Number of seconds to wait before resolving the promise.
 * @deprecated Use APEngine.time.waitForSeconds instead. This allows the promise to be responsive to pause/timescale.
 */
function waitForSeconds(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        console.warn(`DEPRECATED: Use APEngine.time.waitForSeconds instead. This allows the promise to be responsive to pause/timescale.`);
        if (seconds > 0) {
            return new Promise((resolve, reject) => {
                window.setTimeout(() => {
                    return resolve();
                }, (seconds * 1000));
            });
        }
        else {
            return Promise.resolve();
        }
    });
}

/**
 * Device Camera is a class that wraps modern rowser functionality to interact with device camera hardware.
 */
class DeviceCamera {
    constructor(constraints) {
        this._video = null;
        this._stream = null;
        this._playing = false;
        this.constraints = constraints;
    }
    /**
     * Is the device camera stream currently playing or not.
     */
    isPlaying() {
        return this._playing;
    }
    /**
     * The video element that is playing the device camera feed.
     */
    getVideoElement() {
        return this._video;
    }
    /**
     * Request to start device camera video stream. Promise will return true if successful, otherwise false.
     * Uses the DeviceCamera.constraints object when requesting the camera from the browser.
     *
     * May provide a timeout value in milliseconds.
     */
    startVideoStream(timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._video) {
                return {
                    started: true
                };
            }
            try {
                this._stream = yield navigator.mediaDevices.getUserMedia(this.constraints);
            }
            catch (error) {
                return {
                    started: false,
                    error: error
                };
            }
            this._video = document.createElement('video');
            this._video.srcObject = this._stream;
            // this._video.setAttribute('autoplay', 'false');
            this._video.setAttribute('playsinline', 'true');
            this._video.play();
            if (typeof timeout === 'number') {
                if (timeout <= 0) {
                    timeout = 6000;
                }
            }
            try {
                yield waitForCondition(() => {
                    if (this._video) {
                        return this._video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA;
                    }
                }, timeout);
                this._playing = true;
                return {
                    started: true
                };
            }
            catch (error) {
                this.stopVideoStream();
                this._playing = false;
                return {
                    started: false,
                    error: error
                };
            }
        });
    }
    /**
     * Stop running video streams and clean up related objects.
     */
    stopVideoStream() {
        if (this._video) {
            this._video = null;
        }
        if (this._stream) {
            const tracks = this._stream.getTracks();
            for (let track of tracks) {
                track.stop();
            }
            this._stream = null;
        }
        this._playing = false;
    }
    dispose() {
        this.stopVideoStream();
    }
}

/**
 * Container for all custom physics functions for game engine.
 */
var Physics;
(function (Physics) {
    /**
     * Infinite mathematical plane whos normal points up towards the sky.
     */
    Physics.GroundPlane = new Plane(new Vector3(0, 1, 0));
    const _Raycaster = new Raycaster();
    /**
     * Calculates a ray from the given screen position and camera.
     * @pos The screen position that the ray should use for its direction vector.
     * @camera The camera that the ray should point from.
     */
    function screenPosToRay(screenPos, camera) {
        _Raycaster.setFromCamera(screenPos, camera);
        return _Raycaster.ray.clone();
    }
    Physics.screenPosToRay = screenPosToRay;
    /**
     * Gets a point that is the given distance along the given ray.
     * @param ray The ray.
     * @param distance The distance along the ray from the origin.
     */
    function pointOnRay(ray, distance) {
        let pos = new Vector3(ray.direction.x, ray.direction.y, ray.direction.z);
        pos.multiplyScalar(distance);
        pos.add(ray.origin);
        return pos;
    }
    Physics.pointOnRay = pointOnRay;
    /**
     * Calculates the point at which the given ray intersects the given plane.
     * If the ray does not intersect the plane then null is returned.
     * @param ray The ray.
     * @param plane The plane that the ray should test against.
     */
    function pointOnPlane(ray, plane) {
        let point = new Vector3();
        point = ray.intersectPlane(plane, point);
        return point;
    }
    Physics.pointOnPlane = pointOnPlane;
    /**
     * Performs a raycast at the given screen position with the given camera against the given objects.
     * @param screenPos The screen position to raycast from.
     * @param objects The objects to raycast against.
     * @param camera The camera to use.
     * @param recursive — If true, it also checks all descendants of the objects. Otherwise it only checks intersecton with the objects. Default is false.
     */
    function raycastAtScreenPos(screenPos, objects, camera, recursive) {
        _Raycaster.setFromCamera(screenPos, camera);
        const intersects = _Raycaster.intersectObjects(objects, recursive);
        return {
            pointerScreenPos: screenPos,
            ray: _Raycaster.ray.clone(),
            intersects,
        };
    }
    Physics.raycastAtScreenPos = raycastAtScreenPos;
    /**
     * Performs a raycast with the given ray against the given objects.
     * @param ray The ray to use.
     * @param objects The objects to raycast against.
     * @param recursive — If true, it also checks all descendants of the objects. Otherwise it only checks intersecton with the objects. Default is false.
     */
    function raycast(ray, objects, recursive) {
        _Raycaster.set(ray.origin, ray.direction);
        const intersects = _Raycaster.intersectObjects(objects, recursive);
        return {
            pointerScreenPos: null,
            ray: _Raycaster.ray.clone(),
            intersects,
        };
    }
    Physics.raycast = raycast;
    /**
     * Returns the first intersection from the raycast test. If none exist, then null is returned.
     */
    function firstRaycastHit(result) {
        return result.intersects.length > 0 ? result.intersects[0] : null;
    }
    Physics.firstRaycastHit = firstRaycastHit;
})(Physics || (Physics = {}));

var APEngineEvents;
(function (APEngineEvents) {
    APEngineEvents.onUpdate = new Event();
    APEngineEvents.onLateUpdate = new Event();
    APEngineEvents.onResize = new Event();
    APEngineEvents.onXRSessionStarted = new Event();
    APEngineEvents.onXRSessionEnded = new Event();
    APEngineEvents.onVisibilityChanged = new ArgEvent();
})(APEngineEvents || (APEngineEvents = {}));

/**
 * Camera decorator creates and manages ThreeJS cameras.
 * You can change the camera type on the fly by setting the cameraType property.
 */
class CameraDecorator extends Decorator {
    constructor() {
        super(...arguments);
        this._frustum = new Frustum();
        this._projScreenMatrix = new Matrix4();
    }
    /**
     * The camera that is marked as primary.
     * If no camera is marked as primary, than the first camera is returned.
     */
    static get PrimaryCamera() {
        if (this._PrimaryCamera) {
            return this._PrimaryCamera;
        }
        else if (this._Cameras.length > 0) {
            return this._Cameras[0];
        }
        else {
            return null;
        }
    }
    static set PrimaryCamera(cam) {
        if (this._PrimaryCamera !== cam) {
            this._PrimaryCamera = cam;
        }
    }
    /**
     * Cameras that are updated by APEngine.
     * These camera will automatically get resized when APEngine window resize is triggered.
     */
    static get Cameras() {
        return this._Cameras;
    }
    /**
     * Is the camera orthographic or perspective.
     */
    get cameraType() { return this._cameraType; }
    set cameraType(value) {
        if (this._cameraType !== value) {
            this._cameraType = value;
            this._removeCamera();
            this._createCamera();
        }
    }
    /**
     * Field of View type for perspective camera. The field of view type dictates
     * how vertical fov is calculated based on the aspect ratio. No affect on orthographic cameras.
     */
    get fovType() { return this._fovType; }
    set fovType(value) {
        if (this._fovType !== value) {
            this._fovType = value;
            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this.resize();
            }
        }
    }
    /**
     * Vertical field of view for perspective camera. No affect on orthographic cameras.
     * If field of view type is set to horizontal, the vertical field of view will be dynamic.
     * This is the default FOV that Three JS cameras use.
     */
    get vFov() { return this._vFov; }
    set vFov(value) {
        if (this._vFov !== value) {
            this._vFov = value;
            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this._camera.fov = this._vFov;
                this._camera.updateProjectionMatrix();
            }
        }
    }
    /**
     * Horizontal field of view for perspective camera. No affect on orthographic cameras.
     * Only has an affect if the field of view type is set to horizontal.
     */
    get hFov() { return this._hFov; }
    set hFov(value) {
        if (this._hFov !== value) {
            this._hFov = value;
            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this.resize();
            }
        }
    }
    /**
     * Zoom level of the camera.
     */
    get zoom() { return this._zoom; }
    set zoom(value) {
        if (this._zoom !== value) {
            this._zoom = value;
            if (this._camera) {
                this._camera.zoom = this._zoom;
                this._camera.updateProjectionMatrix();
            }
        }
    }
    /**
     * Aspect ratio of perspective camera. Has no effect on orthographic camera.
     */
    get aspect() { return this._aspect; }
    set aspect(value) {
        if (this._aspect !== value) {
            this._aspect = value;
            if (this._camera && this._camera instanceof PerspectiveCamera) {
                this._camera.aspect = this._aspect;
                this._camera.updateProjectionMatrix();
            }
        }
    }
    /**
     * Far clipping plane
     */
    get far() { return this._far; }
    set far(value) {
        if (this._far !== value) {
            this._far = value;
            if (this._camera) {
                this._camera.far = this._far;
                this._camera.updateProjectionMatrix();
            }
        }
    }
    /**
     * Near clipping plane
     */
    get near() { return this._near; }
    set near(value) {
        if (this._near !== value) {
            this._near = value;
            if (this._camera) {
                this._camera.near = this._near;
                this._camera.updateProjectionMatrix();
            }
        }
    }
    /**
     * The frustum size of orthographic camera. This has no affect on perspective camera.
     */
    get size() { return this._size; }
    set size(value) {
        if (this._size !== value) {
            this._size = value;
            if (this._camera && this._camera instanceof OrthographicCamera) {
                const planes = calculateFrustumPlanes(this._size, this._aspect);
                this._camera.left = planes.left;
                this._camera.right = planes.right;
                this._camera.top = planes.top;
                this._camera.bottom = planes.bottom;
                this._camera.updateProjectionMatrix();
            }
        }
    }
    /**
     * ThreeJS camera that is managed by this camera decorator.
     */
    get camera() { return this._camera; }
    /**
     * The frustum for the camera. Useful for doing intersection tests with the area visible to the camera.
     */
    get frustum() { return this._frustum; }
    configure(options) {
        super.configure(options);
        this._cameraType = getOptionalValue(options.cameraType, 'perspective');
        this._fovType = getOptionalValue(options.fovType, 'vertical');
        this._vFov = getOptionalValue(options.vFov, 50);
        this._hFov = getOptionalValue(options.hFov, 50);
        this._zoom = getOptionalValue(options.zoom, 1);
        this._aspect = getOptionalValue(options.aspect, window.innerWidth / window.innerHeight);
        this._far = getOptionalValue(options.far, 2000);
        this._near = getOptionalValue(options.near, 0.1);
        this._size = getOptionalValue(options.size, 25);
    }
    onAttach(gameObject) {
        super.onAttach(gameObject);
        this._createCamera();
        this._updateFrustum();
        // Add camera decorator to global list of camera decorators.
        CameraDecorator._Cameras.push(this);
        this._onXRSessionStarted = this._onXRSessionStarted.bind(this);
        APEngineEvents.onXRSessionStarted.addListener(this._onXRSessionStarted);
        this._onXRSessionEnded = this._onXRSessionEnded.bind(this);
        APEngineEvents.onXRSessionEnded.addListener(this._onXRSessionEnded);
        this.resize();
    }
    onVisible() {
        super.onVisible();
    }
    onInvisible() {
        super.onInvisible();
    }
    onStart() {
        super.onStart();
    }
    onUpdate() {
        super.onUpdate();
        this._updateFrustum();
    }
    onLateUpdate() {
        super.onLateUpdate();
    }
    resize() {
        if (this._camera) {
            this.aspect = window.innerWidth / window.innerHeight;
            if (this._camera instanceof PerspectiveCamera) {
                if (this._fovType === 'horizontal') {
                    // Reference: https://github.com/mrdoob/three.js/issues/15968#issuecomment-475986352
                    this.vFov = Math.atan(Math.tan(this._hFov * Math.PI / 360) / this.aspect) * 360 / Math.PI;
                }
                else {
                    this._hFov = 2 * Math.atan(Math.tan(this.vFov * Math.PI / 180 / 2) * this.aspect) * 180 / Math.PI;
                }
            }
            else {
                // Update frustum planes for othrogtraphic camera using new aspect ratio.
                const planes = calculateFrustumPlanes(this._size, this._aspect);
                this._camera.left = planes.left;
                this._camera.right = planes.right;
                this._camera.top = planes.top;
                this._camera.bottom = planes.bottom;
                this._camera.updateProjectionMatrix();
            }
        }
    }
    _onXRSessionStarted() {
        // Store this camera decorator's game object matrix before the WebXRManager starts overtwriting camera positioning.
        this._nonXrPositon = this.gameObject.position.clone();
        this._nonXrRotation = this.gameObject.rotation.clone();
        this._nonXrScale = this.gameObject.scale.clone();
        // Reset the camera decorator game object to default position, rotation, and scale.
        // WebXRManager doesnt like if the xr camera to be parented to an object with an offset.
        this.gameObject.position.set(0, 0, 0);
        this.gameObject.rotation.set(0, 0, 0);
        this.gameObject.scale.set(1, 1, 1);
    }
    _onXRSessionEnded() {
        // Restore the camera decorator's game object to the position, rotation, and scale it was at before entering XR mode.
        this.gameObject.position.copy(this._nonXrPositon);
        this.gameObject.rotation.copy(this._nonXrRotation);
        this.gameObject.scale.copy(this._nonXrScale);
        this._nonXrPositon = null;
        this._nonXrRotation = null;
        this._nonXrScale = null;
    }
    _createCamera() {
        if (!this.gameObject) {
            // Dont create camera until this decorator is attached to a GameObject.
            return;
        }
        if (this._cameraType === 'perspective') {
            this._camera = new PerspectiveCamera(this._vFov, this._aspect, this._near, this._far);
        }
        else if (this._cameraType === 'orthographic') {
            const planes = calculateFrustumPlanes(this._size, this._aspect);
            this._camera = new OrthographicCamera(planes.left, planes.right, planes.top, planes.bottom, this._near, this._far);
        }
        else {
            console.error(`[CameraDecorator] Can't create camera. Unknown camera type: ${this._cameraType}`);
        }
        if (this._camera) {
            // Rotate camera 180 degrees on the y-axis so that it faces forward.
            this._camera.rotateY(180 * MathUtils.DEG2RAD);
            // Add camera to this gameObject.
            this.gameObject.add(this._camera);
        }
        this.resize();
    }
    _removeCamera() {
        if (!this._camera) {
            // No camera to remove.
            return;
        }
        if (this._camera.parent) {
            this._camera.parent.remove(this._camera);
        }
        this._camera = null;
    }
    _updateFrustum() {
        if (!this._camera) {
            // Need camera to update frustum.
            return;
        }
        this._projScreenMatrix.multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse);
        this._frustum.setFromProjectionMatrix(this._projScreenMatrix);
    }
    onDestroy() {
        super.onDestroy();
        this._removeCamera();
        // Remove camera decorator from global list of camera decorators.
        const index = CameraDecorator._Cameras.findIndex(cameraDecorator => cameraDecorator === this);
        if (index >= 0) {
            CameraDecorator._Cameras.splice(index, 1);
        }
        // If this camera is the primary camera, set primary camera back to null.
        if (CameraDecorator._PrimaryCamera === this) {
            CameraDecorator._PrimaryCamera = null;
        }
    }
}
CameraDecorator._PrimaryCamera = null;
CameraDecorator._Cameras = [];

/**
 * A class that can be used to easily listen for some basic input events for Three JS Oojects.
 */
class PointerEventSystem {
    constructor(name, priority, cameraDecorator) {
        /**
         * The camera to use for hit testing pointer event listeners.
         * If this is undefined, this pointer event system will use the primary camera (CameraDecorator.PrimaryCamera).
         */
        this.cameraDecorator = undefined;
        /**
         * The priority this pointer event system has over other pointer event systems.
         * During an update frame, pointer event systems are sorted by priority (highest to lowest) and hit testing is done
         * in that order. If a hit is detected in a pointer system above another, all lower pointer systems have their pointers released and are then ignored.
         * Lower priority pointer systems are only reached if the higher priority systems dont detect any hits.
         */
        this.priority = 0;
        this._enabled = true;
        this._listeners = new Set();
        this._pointerDown = null;
        this._pointerEnter = null;
        this._name = name;
        this.priority = priority;
        this.cameraDecorator = cameraDecorator;
        PointerEventSystem._activeSystems.push(this);
    }
    /**
     * List of all active pointer event systems.
     */
    static get activeSystems() {
        return this._activeSystems;
    }
    /**
     * Update all active pointer events systems.
     * This function sorts the systems based on priority (highest to lowest priority).
     */
    static updateActiveSystems(input) {
        if (!this._activeSystems || this._activeSystems.length === 0) {
            return;
        }
        if (this._activeSystems.length === 1) {
            // No need to sort, only one pointer event system is active.
            this._activeSystems[0]._update(input);
        }
        else {
            // If there is a focused system, update it first.
            // If the focuses system becomes no longer focuses then move on to updating
            // systems until one does.
            if (this._focusedSystem) {
                const isFocused = this._focusedSystem._update(input);
                if (!isFocused) {
                    // Focused system is no longer focused.
                    if (this.debug) {
                        console.log(`[PointerEventSystem] ${this._focusedSystem.name} has lost focus.`);
                    }
                    this._focusedSystem = null;
                }
                else {
                    // Focused system is still focused. Dont update other pointer event systems.
                    return;
                }
            }
            // Sort pointer event systems in descending priority order.
            const systems = Array.from(this._activeSystems);
            sortZA(systems, 'priority');
            // Loop through and update systems until one becomes focused.
            // If we find a new focused system, release any active pointers for remaining systems.
            for (const system of systems) {
                if (!this._focusedSystem) {
                    const isFocused = system._update(input);
                    if (isFocused) {
                        // Found a system that has gained focus.
                        this._focusedSystem = system;
                        if (this.debug) {
                            console.log(`[PointerEventSystem] ${this._focusedSystem.name} has gained focus.`);
                        }
                    }
                }
                else {
                    // A system already gained focus, release active pointers for this system.
                    system.releaseActivePointers();
                }
            }
        }
    }
    get name() { return this._name; }
    get pointerDown() { return this._pointerDown; }
    get pointerEnter() { return this._pointerEnter; }
    get enabled() { return this._enabled; }
    set enabled(value) {
        if (this._enabled === value) {
            return;
        }
        this._enabled = value;
        if (!this._enabled) {
            this.releaseActivePointers();
        }
    }
    addListener(listener) {
        if (!this._listeners.has(listener)) {
            this._listeners.add(listener);
        }
    }
    removeListener(listener) {
        if (this._pointerDown === listener) {
            this._pointerDown = null;
        }
        if (this._pointerEnter === listener) {
            this._pointerEnter = null;
        }
        this._listeners.delete(listener);
    }
    /**
     * Update event system. Returns true if the update causes the pointer event system to become focused.
     */
    _update(input) {
        if (!this._enabled) {
            // Input must be enabled for the pointer event system.
            return;
        }
        let cameraDecorator = this.cameraDecorator === undefined ? CameraDecorator.PrimaryCamera : this.cameraDecorator;
        if (!input || !cameraDecorator || !cameraDecorator.camera) {
            // Pointer event system needs both an input module and a camera.
            return;
        }
        if (input.currentInputType !== InputType.Mouse &&
            input.currentInputType !== InputType.Touch) {
            // Pointer Event System only works with mouse and touch input types.
            return;
        }
        // Retrieve the pointer's current screen position.
        let pointerScreenPos = (input.currentInputType === InputType.Mouse) ? input.getMouseScreenPos() : input.getTouchScreenPos(0);
        // Raycast against pointer event listeners using the pointer's screen position to find 
        // the event listener that is currently the closest to the camera.
        let closestIntersection;
        let closestListener;
        if (pointerScreenPos) {
            // Collect all active listener target objects.
            const allActiveListenerTargets = [];
            this._listeners.forEach((listener) => {
                const pointerTargets = listener.pointerTargets;
                if (pointerTargets) {
                    const activeTargets = pointerTargets.filter((target) => {
                        return isObjectVisible(target);
                    });
                    allActiveListenerTargets.push(...activeTargets);
                }
            });
            // Raycast againsts all pointer event listener target objects.
            const hits = Physics.raycastAtScreenPos(pointerScreenPos, allActiveListenerTargets, cameraDecorator.camera, false);
            closestIntersection = Physics.firstRaycastHit(hits);
            closestListener = closestIntersection ? this._findEventListenerForObject(closestIntersection.object) : null;
        }
        else {
            // No pointer screen position currently.
            closestIntersection = null;
            closestListener = null;
        }
        //
        // Pointer enter/exit events.
        //
        if (closestListener) {
            if (this._pointerEnter !== null && this._pointerEnter !== closestListener) {
                // Let the last pointer enter object know that the pointer has exited it.
                const pointerExit = this._pointerEnter;
                this._pointerEnter = null;
                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer exit`, pointerExit);
                }
                pointerExit.onPointerExit({
                    eventType: 'pointer exit',
                    object: closestIntersection.object,
                    pointerDown: this._pointerDown
                });
            }
            if (this._pointerEnter === null) {
                // Let the closest listener know that the pointer has entered it.
                this._pointerEnter = closestListener;
                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer enter`, this._pointerEnter);
                }
                this._pointerEnter.onPointerEnter({
                    eventType: 'pointer enter',
                    object: closestIntersection.object,
                    pointerDown: this._pointerDown
                });
            }
        }
        else {
            // Pointer is not over any listeners.
            if (this._pointerEnter !== null) {
                // Let the last pointer enter object know that the pointer has exited it.
                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer exit`, this._pointerEnter);
                }
                this._pointerEnter.onPointerExit({
                    eventType: 'pointer exit',
                    object: null,
                    pointerDown: this._pointerDown
                });
                this._pointerEnter = null;
            }
        }
        //
        // Pointer down/up/click events.
        //
        const isPrimaryDown = (input.currentInputType === InputType.Mouse) ? input.getMouseButtonDown(0) : input.getTouchDown(0);
        if (isPrimaryDown) {
            if (this._pointerEnter !== null && this._pointerEnter === closestListener && this._pointerDown === null) {
                // Let the closest listener know that the pointer is down on it.
                this._pointerDown = closestListener;
                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer down`, this._pointerDown);
                }
                this._pointerDown.onPointerDown({
                    eventType: 'pointer down',
                    object: closestIntersection.object,
                    pointerDown: this._pointerDown
                });
            }
        }
        const isPrimaryUp = (input.currentInputType === InputType.Mouse) ? input.getMouseButtonUp(0) : input.getTouchUp(0);
        if (isPrimaryUp) {
            if (this._pointerDown !== null) {
                // Let the last pointer down object know that the pointer is up.
                const pointerUp = this._pointerDown;
                this._pointerDown = null;
                if (PointerEventSystem.debug) {
                    console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer up`, pointerUp);
                }
                pointerUp.onPointerUp({
                    eventType: 'pointer up',
                    object: closestIntersection ? closestIntersection.object : null,
                    pointerDown: this._pointerDown
                });
                // Detect if pointer click occurs. 
                // Click means that an event listener that received the down event is now receiving the up event while being hovered over.
                const isClick = (closestListener !== null && pointerUp === closestListener);
                if (isClick) {
                    const pointerClick = pointerUp;
                    if (PointerEventSystem.debug) {
                        console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer click`, pointerClick);
                    }
                    pointerClick.onPointerClick({
                        eventType: 'pointer click',
                        object: closestIntersection.object,
                        pointerDown: this._pointerDown
                    });
                }
            }
        }
        return !!this._pointerDown;
    }
    /**
     * Release any held pointers. If active enter/down listener, then exit/up is invoked.
     */
    releaseActivePointers() {
        if (this._pointerDown) {
            const pointerUp = this._pointerDown;
            this._pointerDown = null;
            if (PointerEventSystem.debug) {
                console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer up`, pointerUp);
            }
            pointerUp.onPointerUp({
                eventType: 'pointer up',
                object: null,
                pointerDown: this._pointerDown
            });
        }
        if (this._pointerEnter) {
            const pointerExit = this._pointerEnter;
            this._pointerEnter = null;
            if (PointerEventSystem.debug) {
                console.log(`[PointerEventSystem] Name: ${this.name}, Event: pointer exit`, pointerExit);
            }
            pointerExit.onPointerExit({
                eventType: 'pointer exit',
                object: null,
                pointerDown: this._pointerDown
            });
        }
    }
    dispose() {
        this.releaseActivePointers();
        this._listeners = null;
        this.cameraDecorator = null;
        const index = PointerEventSystem._activeSystems.findIndex(pes => pes === this);
        if (index >= 0) {
            PointerEventSystem._activeSystems.splice(index, 1);
        }
        if (PointerEventSystem._focusedSystem === this) {
            PointerEventSystem._focusedSystem = null;
        }
    }
    _findEventListenerForObject(obj3d) {
        if (obj3d) {
            const listenerValues = Array.from(this._listeners);
            for (const listener of listenerValues) {
                const pointerTargets = listener.pointerTargets;
                if (pointerTargets && pointerTargets.length > 0) {
                    const matchFound = pointerTargets.some((target) => {
                        return target === obj3d;
                    });
                    if (matchFound) {
                        return listener;
                    }
                }
            }
        }
        return null;
    }
}
PointerEventSystem.debug = false;
PointerEventSystem._activeSystems = [];

var APEngineBuildInfo;
(function (APEngineBuildInfo) {
    /**
     * Version number of the app.
     */
    APEngineBuildInfo.version = '0.5.4';
    const _time = '1617910425428';
    /**
     * The date that this version of the app was built.
     */
    function date() {
        const timeNum = parseInt(_time);
        return new Date(timeNum);
    }
    APEngineBuildInfo.date = date;
})(APEngineBuildInfo || (APEngineBuildInfo = {}));

class SceneRenderOperation {
    constructor(scene, cameraDecorator) {
        this.enabled = true;
        this.clearColor = false;
        this.clearDepth = false;
        this.clearStencil = false;
        this.scene = scene;
        this.cameraDecorator = cameraDecorator;
    }
    render(webglRenderer) {
        if (!this.scene) {
            // No scene to render.
            return;
        }
        if (!this.cameraDecorator || !this.cameraDecorator.camera) {
            // No camera to render scene with.
            return;
        }
        if (!this.enabled) {
            // Dont render if render operatio is disabled.
            return;
        }
        if (this.clearColor) {
            webglRenderer.clearColor();
        }
        if (this.clearDepth) {
            webglRenderer.clearDepth();
        }
        if (this.clearStencil) {
            webglRenderer.clearStencil();
        }
        webglRenderer.render(this.scene, this.cameraDecorator.camera);
    }
}

class SceneManager {
    constructor() {
        this._scenes = [];
        this._primaryScene = null;
        this._renderList = [];
    }
    /**
     * Scenes that are updated by APEngine.
     * GameObjects that are parented to scenes in this list will get their lifecycle functions invoked.
     */
    get scenes() {
        return this._scenes;
    }
    get sceneRenderList() {
        return this._renderList;
    }
    /**
     * The scene that is marked as primary.
     * If no scene is marked as primary, than the first scene is returned.
     */
    get primaryScene() {
        if (this._primaryScene) {
            return this._primaryScene;
        }
        else if (this._scenes.length > 0) {
            return this._scenes[0];
        }
        else {
            return null;
        }
    }
    set primaryScene(scene) {
        if (this._primaryScene !== scene) {
            this._primaryScene = scene;
        }
    }
    addScene(scene) {
        if (!this._scenes.some(s => s === scene)) {
            this._scenes.push(scene);
        }
    }
    removeScene(scene) {
        const index = this._scenes.findIndex(s => s === scene);
        if (index >= 0) {
            this._scenes.splice(index, 1);
        }
        this.removeRenderOperationsUsingScene(scene);
    }
    addRenderOperation(scene, cameraDecorator) {
        const renderOp = new SceneRenderOperation(scene, cameraDecorator);
        this._renderList.push(renderOp);
        return renderOp;
    }
    reorderRenderOperation(renderOp, renderOrder) {
        const oldIndex = this._renderList.indexOf(renderOp);
        if (oldIndex >= 0) {
            this._renderList.splice(oldIndex, 1);
            this._renderList.splice(renderOrder, 0, renderOp);
        }
    }
    removeRenderOperation(scene, cameraDecorator) {
        const index = this._renderList.findIndex(op => op.scene === scene && op.cameraDecorator === cameraDecorator);
        if (index >= 0) {
            this._renderList.splice(index, 1);
        }
    }
    removeRenderOperationsUsingScene(scene) {
        this._renderList = this._renderList.filter((op) => {
            if (op.scene !== scene) {
                return true;
            }
        });
    }
    removeRenderOperationsUsingCamera(cameraDecorator) {
        this._renderList = this._renderList.filter((op) => {
            if (op.cameraDecorator !== cameraDecorator) {
                return true;
            }
        });
    }
    removeAllRenderOperations() {
        this._renderList = [];
    }
    update() {
        this._updatedGameObjects = [];
        for (let scene of this._scenes) {
            if (scene) {
                traverseSafe(scene, (go) => {
                    if (go instanceof GameObject) {
                        go.onUpdate();
                        this._updatedGameObjects.push(go);
                    }
                });
            }
        }
    }
    lateUpdate() {
        for (let i = 0; i < this._updatedGameObjects.length; i++) {
            if (this._updatedGameObjects[i]) {
                this._updatedGameObjects[i].onLateUpdate();
            }
        }
    }
    render(webglRenderer) {
        webglRenderer.clear();
        webglRenderer.info.autoReset = false;
        webglRenderer.info.reset();
        for (let renderOp of this._renderList) {
            if (renderOp) {
                renderOp.render(webglRenderer);
            }
        }
    }
    dispose() {
        this._scenes = [];
        this._renderList = [];
        this._primaryScene = null;
        this._updatedGameObjects = [];
    }
}

// Reference 01: https://github.com/mrdoob/three.js/blob/dev/examples/webxr_ar_hittest.html
// Refernece 02: https://web.dev/ar-hit-test/
class XRPhysics {
    constructor(renderer, onXRSessionStarted, onXRSessionEnded, getFrame) {
        this._viewerHitTestSource = null;
        this._renderer = renderer;
        this._xrSessionStartedEvent = onXRSessionStarted;
        this._xrSessionEndedEvent = onXRSessionEnded;
        this._getFrame = getFrame;
        this._onXRSessionStarted = this._onXRSessionStarted.bind(this);
        this._xrSessionStartedEvent.addListener(this._onXRSessionStarted);
        this._onXRSessionEnded = this._onXRSessionEnded.bind(this);
        this._xrSessionEndedEvent.addListener(this._onXRSessionEnded);
    }
    gazeRaycast() {
        const frame = this._getFrame();
        if (frame) {
            const referenceSpace = this._renderer.xr.getReferenceSpace();
            if (this._viewerHitTestSource) {
                const hitTestResults = frame.getHitTestResults(this._viewerHitTestSource);
                if (hitTestResults.length) {
                    const hitPose = hitTestResults[0].getPose(referenceSpace);
                    const hitMatrix = new Matrix4();
                    hitMatrix.fromArray(hitPose.transform.matrix);
                    const position = new Vector3();
                    const rotation = new Quaternion();
                    const scale = new Vector3();
                    hitMatrix.decompose(position, rotation, scale);
                    return {
                        position,
                        rotation
                    };
                }
            }
        }
        return null;
    }
    _onXRSessionStarted() {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve hit test source for viewer reference space.
            const session = this._renderer.xr.getSession();
            const referenceSpace = yield session.requestReferenceSpace('viewer');
            this._viewerHitTestSource = yield session.requestHitTestSource({
                space: referenceSpace
            });
        });
    }
    _onXRSessionEnded() {
        this._viewerHitTestSource = null;
    }
    dispose() {
        this._xrSessionStartedEvent.removeListener(this._onXRSessionStarted);
        this._xrSessionEndedEvent.removeListener(this._onXRSessionEnded);
    }
}

var APEngine;
(function (APEngine) {
    APEngine.sceneManager = new SceneManager();
    let _initialized = false;
    let _xrFrame;
    let _xrEnabled = false;
    let _maxPixelRatio = 0;
    let _audioMutedCount = 0;
    function isXREnabled() {
        return _xrEnabled;
    }
    APEngine.isXREnabled = isXREnabled;
    function getXRFrame() {
        return _xrFrame;
    }
    APEngine.getXRFrame = getXRFrame;
    function init(webglParams) {
        if (_initialized) {
            return;
        }
        console.info(`== APEngine v${APEngineBuildInfo.version} ==\nDate: ${APEngineBuildInfo.date().toString()}`);
        _initialized = true;
        // Create renderer.
        APEngine.webglRenderer = new WebGLRenderer(webglParams);
        APEngine.webglRenderer.autoClear = false;
        const width = window.innerWidth;
        const height = window.innerHeight;
        APEngine.webglRenderer.setSize(width, height);
        APEngine.webglRenderer.domElement.style.display = "block";
        // Create time module.
        APEngine.time = new Time();
        // Create performance stats module.
        APEngine.performanceStats = new PerformanceStats();
        // Create performance resolution scalar.
        APEngine.performanceResolutionScalar = new PerformanceResolutionScalar(APEngine.webglRenderer, {
            startEnabled: false
        });
        // Create input module.
        APEngine.input = new Input({
            inputElement: APEngine.webglRenderer.domElement,
            canvasElement: APEngine.webglRenderer.domElement,
            time: APEngine.time,
            getUIHtmlElements: () => []
        });
        // Create xr input module.
        APEngine.xrInput = new XRInput(APEngine.webglRenderer);
        // Create xr physics module.
        APEngine.xrPhysics = new XRPhysics(APEngine.webglRenderer, APEngineEvents.onXRSessionStarted, APEngineEvents.onXRSessionEnded, getXRFrame);
        // Create pointer event system.
        APEngine.pointerEventSystem = new PointerEventSystem('Default', 0);
        // Create device camera module.
        APEngine.deviceCamera = new DeviceCamera({
            video: {
                facingMode: 'environment'
            },
            audio: false
        });
        // Setup update loop.
        APEngine.webglRenderer.setAnimationLoop(update);
        resize();
        // Listen for window resize event so that we can update the webgl canvas accordingly.
        window.addEventListener('resize', resize);
        // Listen for page visibility change event so we can disable sounds, etc
        document.addEventListener('visibilitychange', visibilityChange);
    }
    APEngine.init = init;
    function update(timestamp, frame) {
        APEngine.performanceResolutionScalar.update();
        _xrFrame = frame;
        // Track state of XR presentation.
        const xrEnabled = APEngine.webglRenderer.xr.isPresenting && !!_xrFrame;
        if (_xrEnabled !== xrEnabled) {
            _xrEnabled = xrEnabled;
            if (_xrEnabled) {
                APEngine.webglRenderer.xr.enabled = true;
                APEngineEvents.onXRSessionStarted.invoke();
            }
            else {
                APEngine.webglRenderer.xr.enabled = false;
                APEngineEvents.onXRSessionEnded.invoke();
            }
        }
        APEngine.input.update();
        // Update pointer event system.
        PointerEventSystem.updateActiveSystems(APEngine.input);
        // Update game objects in scenes.
        APEngine.sceneManager.update();
        APEngineEvents.onUpdate.invoke();
        APEngine.sceneManager.lateUpdate();
        APEngineEvents.onLateUpdate.invoke();
        GameObject.__APEngine_ProcessGameObjectDestroyQueue();
        APEngine.sceneManager.render(APEngine.webglRenderer);
        APEngine.time.update();
        APEngine.performanceStats.update();
    }
    function getMaxPixelRatio() {
        return _maxPixelRatio;
    }
    APEngine.getMaxPixelRatio = getMaxPixelRatio;
    function setMaxPixelRatio(pixelRatio) {
        _maxPixelRatio = pixelRatio;
        resize();
    }
    APEngine.setMaxPixelRatio = setMaxPixelRatio;
    function dispose() {
        window.removeEventListener('resize', resize);
        APEngine.sceneManager.dispose();
        APEngine.webglRenderer.dispose();
        APEngine.webglRenderer = null;
        APEngine.time.dispose();
        APEngine.time = null;
        APEngine.input.dispose();
        APEngine.input = null;
        APEngine.xrInput.dispose();
        APEngine.xrInput = null;
        APEngine.xrPhysics.dispose();
        APEngine.xrPhysics = null;
        APEngine.deviceCamera.dispose();
        APEngine.deviceCamera = null;
        APEngine.performanceStats.dispose();
        APEngine.performanceStats = null;
        _xrEnabled = false;
        _xrFrame = null;
        APEngineEvents.onUpdate.removeAllListeners();
        APEngineEvents.onLateUpdate.removeAllListeners();
        APEngineEvents.onXRSessionStarted.removeAllListeners();
        APEngineEvents.onXRSessionEnded.removeAllListeners();
        _initialized = false;
    }
    APEngine.dispose = dispose;
    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        APEngine.webglRenderer.setSize(width, height);
        let pixelRatio = window.devicePixelRatio;
        if ((_maxPixelRatio > 0) && (pixelRatio > _maxPixelRatio)) {
            pixelRatio = _maxPixelRatio;
        }
        APEngine.webglRenderer.setPixelRatio(pixelRatio);
        CameraDecorator.Cameras.forEach(camera => camera.resize());
        APEngineEvents.onResize.invoke();
    }
    function visibilityChange() {
        setAudioMuted(document.hidden);
        APEngineEvents.onVisibilityChanged.invoke(document.hidden);
    }
    function setAudioMuted(muted) {
        if (muted) {
            _audioMutedCount++;
            if (_audioMutedCount > 0) {
                Howler.mute(true);
            }
        }
        else {
            _audioMutedCount--;
            if (_audioMutedCount <= 0) {
                _audioMutedCount = 0;
                Howler.mute(false);
            }
        }
    }
    APEngine.setAudioMuted = setAudioMuted;
})(APEngine || (APEngine = {}));

var ThreeDevTools;
(function (ThreeDevTools) {
    /**
     * Dispatch event to the Three JS Dev Tools (if it exists) so that it can observe the given scene and renderer.
     */
    function observe(scene, renderer) {
        // Observe a scene or a renderer
        if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
            console.log(`[ThreeDevTools] dispatch event to observe scene and renderer.`);
            __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
            __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
        }
    }
    ThreeDevTools.observe = observe;
})(ThreeDevTools || (ThreeDevTools = {}));

class ActionTracker {
    constructor(animator) {
        this._actions = [];
        this._animator = animator;
    }
    get count() { return this._actions.length; }
    contains(action) {
        return this._actions.some(a => a === action);
    }
    getByIndex(index) {
        return this._actions[index];
    }
    getActionsWithWeight() {
        return this._actions.filter((action) => {
            return action.getEffectiveWeight() > 0;
        });
    }
    tryGet(index) {
        if (index >= 0 && index < this._actions.length) {
            return this._actions[index];
        }
        else {
            return null;
        }
    }
    add(action) {
        let added = false;
        if (!this.contains(action)) {
            this._actions.push(action);
            added = true;
            if (this._animator.debug) {
                console.log(`${this._animator.gameObject.name} added action ${action.getClip().name}.`);
            }
            this.print();
        }
        return added;
    }
    remove(action) {
        let removed = false;
        const startCount = this._actions.length;
        this._actions = this._actions.filter((a) => {
            return a !== action;
        });
        if (startCount !== this._actions.length) {
            removed = true;
            if (this._animator.debug) {
                console.log(`${this._animator.gameObject.name} removed action ${action.getClip().name}.`);
            }
            this.print();
        }
        return removed;
    }
    print() {
        if (this._animator.debug) {
            let message = `${this._animator.gameObject.name} actions: ${this._actions.length}`;
            for (const action of this._actions) {
                message += `\n  ${action.getClip().name}`;
                message += `\n    effectiveWeight: ${action.getEffectiveWeight()}`;
            }
            console.log(message);
        }
    }
}
class AnimatorDecorator extends Decorator {
    constructor() {
        super(...arguments);
        this.debug = false;
        this._clips = new Map();
        this._actionTracker = new ActionTracker(this);
        this._timeScale = 1.0;
        this.onAnimationLoop = new ArgEvent();
        this.onAnimationFinished = new ArgEvent();
    }
    get clips() { return Array.from(this._clips.values()); }
    /**
     * The global time scale of the animator.
     */
    get timeScale() {
        return this._timeScale;
    }
    /**
     * The global time scale of the animator.
     */
    set timeScale(value) {
        this._timeScale = value;
        if (this._mixer) {
            this._mixer.timeScale = value;
        }
    }
    /**
     * The global time of the animator in seconds.
     */
    get time() {
        return this._mixer.time;
    }
    /**
     * The global time of the animator in seconds.
     */
    set time(value) {
        this._mixer.setTime(value);
    }
    configure(options) {
        super.configure(options);
        if (options.clips) {
            for (const clip of options.clips) {
                this.addClip(clip);
            }
        }
    }
    addClip(clip) {
        if (!this._clips.has(clip.name)) {
            this._clips.set(clip.name, clip);
        }
        else {
            console.error(`Animator already has a clip named ${clip.name} on GameObject ${this.gameObject.name}. All clips on an Animator must have a unique name.`);
        }
    }
    getClip(clipName) {
        return this._clips.get(clipName);
    }
    onAttach(gameObject) {
        super.onAttach(gameObject);
        this._onActionLoop = this._onActionLoop.bind(this);
        this._onActionFinished = this._onActionFinished.bind(this);
        this._mixer = new AnimationMixer(this.gameObject);
        this._mixer.addEventListener('loop', this._onActionLoop);
        this._mixer.addEventListener('finished', this._onActionFinished);
        this._mixer.timeScale = this._timeScale;
    }
    onVisible() {
        super.onVisible();
        this._visible = true;
    }
    onInvisible() {
        super.onInvisible();
        this._visible = false;
    }
    onStart() {
        super.onStart();
    }
    play(clipName, options) {
        const clip = this._clips.get(clipName);
        if (!clip) {
            console.error(`There is no clip named ${clipName} in the Animator ${this.gameObject.name} for GameObject ${this.gameObject.name}`);
            return;
        }
        if (this._clipAlreadyPlaying(clip, LoopOnce)) {
            console.warn(`There is already an action that is playing the clip ${clip.name}`);
            // There is already an action that is playing the clip.
            return;
        }
        if (!options) {
            options = {};
        }
        if (this.debug) {
            console.log(`${this.gameObject.name} play ${clipName} with options: ${JSON.stringify(options)}`);
        }
        // Get action for clip.
        const action = this._mixer.clipAction(clip).reset();
        // Get list of actions that still have weight.
        let actionsWithWeight = this._actionTracker.getActionsWithWeight();
        if (actionsWithWeight && actionsWithWeight.length > 0) {
            // Filter out the clip that we are about to start playing.
            actionsWithWeight = actionsWithWeight.filter(a => a !== action);
        }
        if (this.debug) {
            if (actionsWithWeight && actionsWithWeight.length > 0) {
                let message = `${this.gameObject.name} other actions with weight: ${actionsWithWeight.length}`;
                for (const action of actionsWithWeight) {
                    message += `\n  ${action.getClip().name}`;
                    message += `\n    effectiveWeight: ${action.getEffectiveWeight()}`;
                }
                console.log(message);
            }
            else {
                console.log(`${this.gameObject.name} no other actions with weight.`);
            }
        }
        if (actionsWithWeight &&
            actionsWithWeight.length > 0 &&
            options.transitionDuration > 0) {
            // Fade out the action that still have weight.
            for (let i = 0; i < actionsWithWeight.length; i++) {
                if (this.debug) {
                    console.log(`${this.gameObject.name} fade out action ${actionsWithWeight[i].getClip().name} over ${options.transitionDuration} seconds`);
                }
                actionsWithWeight[i].stopFading();
                actionsWithWeight[i].fadeOut(options.transitionDuration);
            }
            // Fade in the new action.
            if (this.debug) {
                console.log(`${this.gameObject.name} fade in action ${action.getClip().name} over ${options.transitionDuration} seconds`);
            }
            action.stopFading();
            action.fadeIn(options.transitionDuration);
        }
        else {
            // Stop all current actions.
            this.stopAll();
            action.setEffectiveWeight(1);
        }
        // Set the loop properties.
        if (options.loop) {
            action.setLoop(LoopRepeat, Infinity);
        }
        else {
            action.setLoop(LoopOnce, 0);
        }
        // Always clamp on the last frame when finished.
        action.clampWhenFinished = true;
        if (options.durationOverride >= 0) {
            action.setDuration(options.durationOverride);
        }
        else {
            action.setEffectiveTimeScale(1);
        }
        // Change start time if one is provided.
        if (options.normalizedStartTime >= 0) {
            options.normalizedStartTime = clamp(options.normalizedStartTime, 0, 1);
            action.time = unnormalize(options.normalizedStartTime, 0, action.getClip().duration);
        }
        // Play the action.
        action.play();
        this._actionTracker.add(action);
    }
    playAll() {
        this.stopAll();
        for (const [clipName, clip] of this._clips) {
            const action = this._mixer.clipAction(clip).reset();
            action.play();
            this._actionTracker.add(action);
        }
    }
    stopAll() {
        if (this.debug) {
            console.log(`${this.gameObject.name} stop all ${this._actionTracker.count} actions.`);
        }
        for (let i = this._actionTracker.count - 1; i >= 0; i--) {
            const action = this._actionTracker.getByIndex(i);
            action.stop();
            this._actionTracker.remove(action);
        }
    }
    onUpdate() {
        super.onUpdate();
        if (this._visible) {
            this._mixer.update(APEngine.time.deltaTime);
        }
    }
    onLateUpdate() {
        super.onLateUpdate();
    }
    _onActionLoop(e) {
        const loopEvent = e;
        if (this.debug) {
            console.log(`${this.gameObject.name} on action ${loopEvent.action.getClip().name} loop`);
        }
        this.onAnimationLoop.invoke({
            clipName: loopEvent.action.getClip().name
        });
    }
    _onActionFinished(e) {
        const finishEvent = e;
        if (this.debug) {
            console.log(`${this.gameObject.name} on action ${finishEvent.action.getClip().name} finished`);
        }
        this.onAnimationFinished.invoke({
            clipName: finishEvent.action.getClip().name
        });
    }
    _clipAlreadyPlaying(clip, loop) {
        const action = this._mixer.clipAction(clip);
        if (action.isRunning() && action.loop === loop) {
            return true;
        }
        return false;
    }
    onDestroy() {
        super.onDestroy();
        this.stopAll();
        this.onAnimationLoop.dispose();
        this.onAnimationFinished.dispose();
        this._mixer.removeEventListener('loop', this._onActionLoop);
        this._mixer.removeEventListener('finished', this._onActionFinished);
        this._mixer.stopAllAction();
        this._mixer.uncacheRoot(this._mixer.getRoot());
        this._mixer = null;
        this._clips.clear();
    }
}

class MeshDecorator extends Decorator {
    configure(options) {
        super.configure(options);
        this.mesh = options.mesh;
    }
    onAttach(gameObject) {
        super.onAttach(gameObject);
        this.gameObject.add(this.mesh);
    }
    onStart() {
        super.onStart();
    }
    onDestroy() {
        super.onDestroy();
        this.gameObject.remove(this.mesh);
    }
}

const VectorFields = ['x', 'y', 'z'];
class TransformControlsGUI {
    constructor(controls) {
        this.onUnselectClick = new ArgEvent();
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
        this._rootEl.style.bottom = '0';
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
    _addHeader(title) {
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
    _addSpacer(height) {
        const spacerEl = document.createElement('div');
        this._rootEl.appendChild(spacerEl);
        spacerEl.style.height = height !== null && height !== void 0 ? height : '16px';
    }
    _addParagraph(id) {
        const paragraphEl = document.createElement('p');
        this._rootEl.appendChild(paragraphEl);
        paragraphEl.id = id;
        paragraphEl.style.boxSizing = 'border-box';
        paragraphEl.style.margin = '4px 4px 0px 4px';
    }
    _refreshParagraph(id, text) {
        const paragraphEl = document.querySelector(`#${id}`);
        if (paragraphEl) {
            paragraphEl.textContent = text;
        }
    }
    _addButton(text, callback) {
        const buttonEl = document.createElement('button');
        this._rootEl.appendChild(buttonEl);
        buttonEl.style.width = '100%';
        buttonEl.style.fontSize = '14px';
        buttonEl.textContent = text;
        buttonEl.onclick = (e) => callback(e);
    }
    _addButtonRow(configs) {
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
    _addVector3(id, callback) {
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
    _getVector3(id) {
        const vectorEl = document.querySelector(`#${id}`);
        if (vectorEl) {
            const vector = new Vector3();
            for (let i = 0; i < VectorFields.length; i++) {
                const field = VectorFields[i];
                const inputEl = vectorEl.querySelector(`#${field}`);
                vector.setComponent(i, Number.parseFloat(inputEl.value));
            }
            return vector;
        }
        return null;
    }
    _refreshVector3(id, vector) {
        const vectorEl = document.querySelector(`#${id}`);
        if (vectorEl) {
            for (let i = 0; i < VectorFields.length; i++) {
                const field = VectorFields[i];
                const inputEl = vectorEl.querySelector(`#${field}`);
                inputEl.value = vector.getComponent(i).toFixed(3);
            }
        }
    }
    refresh() {
        if (!this._rootEl) {
            return;
        }
        this._refreshParagraph('object-name', this._controls.object.name);
        this._refreshVector3('local-position', this._controls.object.position);
        this._refreshVector3('local-rotation', new Vector3(this._controls.object.rotation.x * MathUtils.RAD2DEG, this._controls.object.rotation.y * MathUtils.RAD2DEG, this._controls.object.rotation.z * MathUtils.RAD2DEG));
        this._refreshVector3('local-scale', this._controls.object.scale);
    }
    _controlsChange() {
        this.refresh();
    }
    _controlsObjectChange() {
        this.refresh();
    }
    dispose() {
        this._controls.removeEventListener('change', this._controlsChange);
        this._controls.removeEventListener('objectChange', this._controlsObjectChange);
        if (this._rootEl) {
            this._rootEl.remove();
            this._rootEl = null;
        }
    }
}

var TransformTool;
(function (TransformTool) {
    var _controls;
    var _gui;
    var _mouseDown;
    TransformTool.onAttach = new ArgEvent();
    TransformTool.onDetach = new ArgEvent();
    TransformTool.onMouseDown = new Event();
    TransformTool.onMouseUp = new Event();
    TransformTool.onObjectChange = new ArgEvent();
    function attach(object3d, cameraDecorator) {
        if (_controls || _gui) {
            detach();
        }
        const transformCamera = cameraDecorator !== null && cameraDecorator !== void 0 ? cameraDecorator : CameraDecorator.PrimaryCamera;
        if (!transformCamera) {
            console.error(`[TransformTool] There is no valid camera to create transfrom controls with.`);
            return;
        }
        if (!APEngine.webglRenderer.domElement) {
            console.error(`[TransformTool] There is no valid dom element to attach transfrom controls events to.`);
            return;
        }
        _controls = new TransformControls(transformCamera.camera, APEngine.webglRenderer.domElement);
        _controls.attach(object3d);
        _controls.setSpace('local');
        _controls.setMode('translate');
        _controls.addEventListener('change', controlsChange);
        _controls.addEventListener('mouseDown', controlsMouseDown);
        _controls.addEventListener('mouseUp', controlsMouseUp);
        _controls.addEventListener('objectChange', controlsObjectChange);
        // window.addEventListener('keydown', handleKeyDown);
        const scene = findParentScene(object3d);
        scene.add(_controls);
        _gui = new TransformControlsGUI(_controls);
        _gui.onUnselectClick.addListener(guiUnselectClick);
    }
    TransformTool.attach = attach;
    function detach() {
        if (_gui) {
            _gui.onUnselectClick.removeListener(guiUnselectClick);
            _gui.dispose();
            _gui = null;
        }
        if (_controls) {
            _controls.removeEventListener('change', controlsChange);
            _controls.removeEventListener('mouseDown', controlsMouseDown);
            _controls.removeEventListener('mouseUp', controlsMouseUp);
            _controls.removeEventListener('objectChange', controlsObjectChange);
            // window.removeEventListener('keydown', handleKeyDown;
            _controls.parent.remove(_controls);
            _controls.detach();
            _controls.dispose();
            _controls = null;
        }
    }
    TransformTool.detach = detach;
    function getAttachedObject() {
        if (_controls) {
            return _controls.object;
        }
        else {
            return null;
        }
    }
    TransformTool.getAttachedObject = getAttachedObject;
    function isMouseDown() {
        return _mouseDown;
    }
    TransformTool.isMouseDown = isMouseDown;
    function guiUnselectClick() {
        detach();
    }
    function controlsChange() {
    }
    function controlsObjectChange() {
        TransformTool.onObjectChange.invoke(getAttachedObject());
    }
    function controlsMouseDown() {
        _mouseDown = true;
        TransformTool.onMouseDown.invoke();
    }
    function controlsMouseUp() {
        _mouseDown = false;
        TransformTool.onMouseUp.invoke();
    }
})(TransformTool || (TransformTool = {}));

class TransformPickerDecorator extends Decorator {
    get pointerTargets() {
        const children = [];
        traverseSafe(this.gameObject, (obj) => children.push(obj));
        return children;
    }
    configure(options) {
        super.configure(options);
    }
    onAttach(gameObject) {
        super.onAttach(gameObject);
    }
    onVisible() {
        super.onVisible();
        APEngine.pointerEventSystem.addListener(this);
    }
    onInvisible() {
        super.onInvisible();
        APEngine.pointerEventSystem.removeListener(this);
    }
    onStart() {
        super.onStart();
    }
    onPointerEnter(event) {
    }
    onPointerExit(event) {
    }
    onPointerDown(event) {
    }
    onPointerUp(event) {
    }
    onPointerClick(event) {
        TransformTool.attach(this.gameObject);
    }
    onUpdate() {
        super.onUpdate();
    }
    onLateUpdate() {
        super.onLateUpdate();
    }
    onDestroy() {
        super.onDestroy();
        if (TransformTool.getAttachedObject() === this.gameObject) {
            TransformTool.detach();
        }
        APEngine.pointerEventSystem.removeListener(this);
    }
}

/**
 * Decorator that provided orbit controls for a camera decorator.
 */
class CameraOrbitDecorator extends Decorator {
    constructor() {
        super(...arguments);
        /**
         * The world position that the camera is looking at.
         */
        this.target = new Vector3();
        /**
         * The distance in pixels that needs to be crossed in order for dragging to start.
         */
        this.dragThreshold = 10.0;
        this.invertY = true;
        this.invertX = true;
        this.xMouseSpeed = 1.0;
        this.yMouseSpeed = 1.0;
        this.xTouchSpeed = 1.0;
        this.yTouchSpeed = 1.0;
        this.xMinDeg = -360.0;
        this.xMaxDeg = 360.0;
        this.yMinDeg = -90.0;
        this.yMaxDeg = 90.0;
        this.zoomMouseSpeed = 1.0;
        this.zoomTouchSpeed = 1.0;
        this.zoomMin = 0.0;
        this.zoomMax = 40.0;
        this.rotateWhileZooming = false;
        this._camera = null;
        this._inputEnabled = true;
        this._zoomEnabled = true;
        this._isDragging = false;
        this._isZooming = false;
        this._x = 0;
        this._y = 0;
        this._zoomDistance = 0;
        this._inputDown = false;
        this._inputDownStartPos = new Vector2();
        this._inputDragLastPos = new Vector2();
        this._inputTouchZoomDist = 0;
    }
    get inputEnabled() { return this._inputEnabled; }
    set inputEnabled(value) {
        this._inputEnabled = value;
        if (!this.inputEnabled) {
            this._inputDown = false;
            this._isDragging = false;
            this._isZooming = false;
            this._inputDownStartPos.set(0, 0);
            this._inputDragLastPos.set(0, 0);
            this._inputTouchZoomDist = 0;
        }
    }
    get zoomEnabled() { return this._zoomEnabled; }
    set zoomEnabled(value) {
        this._zoomEnabled = value;
        if (!this._zoomEnabled) {
            this._isZooming = false;
            this._inputTouchZoomDist = 0;
        }
    }
    get camera() { return this._camera; }
    get isDragging() { return this._isDragging; }
    get isZooming() { return this._isZooming; }
    configure(options) {
        super.configure(options);
        this._camera = getOptionalValue(options.cameraDecorator, null);
    }
    onAttach(gameObject) {
        super.onAttach(gameObject);
        if (!this._camera) {
            // If no camera was provided, look for one on the gameObject we are attached to.
            this._camera = this.gameObject.getDecorator(CameraDecorator);
        }
        if (!this._camera) {
            console.error(`[CameraOrbitDecorator] No camera decorator to control. Need to be provided one or be attached to GameObject with CameraDecorator on it.`);
        }
    }
    onVisible() {
        super.onVisible();
    }
    onInvisible() {
        super.onInvisible();
    }
    onStart() {
        super.onStart();
    }
    setOrbit(x, y) {
        let set = false;
        if (typeof x === 'number') {
            this._x = x;
            set = true;
        }
        if (typeof y === 'number') {
            this._y = y;
            set = true;
        }
        if (set) {
            this._updateCamera();
        }
    }
    setOrbitFromGeoCoord(latitude, longitude) {
        let set = false;
        if (typeof longitude === 'number') {
            this._x = -90 + longitude;
            set = true;
        }
        if (typeof latitude === 'number') {
            this._y = -latitude;
            set = true;
        }
        if (set) {
            this._updateCamera();
        }
    }
    getOrbit() {
        return {
            x: this._x,
            y: this._y
        };
    }
    setZoomDistance(zoom) {
        zoom = clamp(zoom, this.zoomMin, this.zoomMax);
        if (this._zoomDistance !== zoom) {
            this._zoomDistance = zoom;
            this._updateCamera();
        }
    }
    getZoomDistance() {
        return this._zoomDistance;
    }
    _rotateControls() {
        if (!this.inputEnabled) {
            return;
        }
        const input = APEngine.input;
        if (input.currentInputType === InputType.Touch && input.getTouchDown(0)) {
            this._inputDown = true;
            this._isDragging = false;
            this._inputDownStartPos.copy(input.getTouchClientPos(0));
        }
        else if (input.currentInputType === InputType.Mouse && input.getMouseButtonDown(0)) {
            this._inputDown = true;
            this._isDragging = false;
            this._inputDownStartPos.copy(input.getMouseClientPos());
        }
        if (this._inputDown && !this._isDragging) {
            // Need to cross drag theshold in order to start dragging.
            let dragDistance = 0.0;
            let inputPos;
            if (input.currentInputType === InputType.Touch) {
                inputPos = input.getTouchClientPos(0);
            }
            else {
                inputPos = input.getMouseClientPos();
            }
            dragDistance = this._inputDownStartPos.distanceTo(inputPos);
            if (dragDistance >= this.dragThreshold) {
                this._isDragging = true;
                this._inputDragLastPos.copy(inputPos);
            }
        }
        if (input.currentInputType === InputType.Touch && input.getTouchUp(0)) {
            this._inputDown = false;
            this._isDragging = false;
            this._inputDownStartPos.set(0, 0);
        }
        else if (input.currentInputType === InputType.Mouse && input.getMouseButtonUp(0)) {
            this._inputDown = false;
            this._isDragging = false;
            this._inputDownStartPos.set(0, 0);
        }
        if (this._isDragging) {
            const rotateAllowed = !this.isZooming || (this.isZooming && this.rotateWhileZooming);
            if (input.currentInputType === InputType.Touch && input.getTouchHeld(0)) {
                if (rotateAllowed) {
                    const delta = this._inputDragLastPos.clone().sub(input.getTouchClientPos(0));
                    this._x += (delta.x * this.xTouchSpeed);
                    this._y += (delta.y * this.yTouchSpeed);
                }
                this._inputDragLastPos.copy(input.getTouchClientPos(0));
            }
            else if (input.currentInputType === InputType.Mouse && input.getMouseButtonHeld(0)) {
                if (rotateAllowed) {
                    const delta = this._inputDragLastPos.clone().sub(input.getMouseClientPos());
                    this._x += (delta.x * this.xMouseSpeed);
                    this._y += (delta.y * this.yMouseSpeed);
                }
                this._inputDragLastPos.copy(input.getMouseClientPos());
            }
        }
    }
    _zoomControls() {
        if (!this.inputEnabled) {
            return;
        }
        if (!this._zoomEnabled) {
            return;
        }
        const input = APEngine.input;
        let zoomDelta = 0;
        if (input.currentInputType === InputType.Touch && input.getTouchCount() === 2) {
            const posA = input.getTouchClientPos(0);
            const posB = input.getTouchClientPos(1);
            const distance = posA.distanceTo(posB);
            if (input.getTouchDown(1)) {
                // Pinch zoom start.
                this._isZooming = true;
                // Calculate starting distance between the two touch points.
                this._inputTouchZoomDist = distance;
            }
            else {
                zoomDelta = ((this._inputTouchZoomDist - distance) * this.zoomTouchSpeed);
                this._inputTouchZoomDist = distance;
            }
        }
        else if (input.currentInputType === InputType.Mouse && input.getWheelMoved()) {
            this._isZooming = true;
            zoomDelta = (input.getWheelData().delta.y * this.zoomMouseSpeed);
        }
        else {
            this._isZooming = false;
            this._inputTouchZoomDist = 0;
        }
        if (zoomDelta !== 0) {
            this._zoomDistance = clamp(this._zoomDistance + zoomDelta, this.zoomMin, this.zoomMax);
        }
    }
    _updateCamera() {
        this._x = clampDegAngle(this._x, this.xMinDeg, this.xMaxDeg);
        this._y = clampDegAngle(this._y, this.yMinDeg, this.yMaxDeg);
        if (this._camera) {
            const position = pointOnSphere(this.target, this._zoomDistance, new Vector2(this.invertY ? -this._y : this._y, this.invertX ? -this._x : this._x));
            this._camera.gameObject.position.copy(position);
            this._camera.gameObject.lookAt(this.target);
        }
    }
    onUpdate() {
        super.onUpdate();
        if (!APEngine.isXREnabled() && !TransformTool.isMouseDown() && this.target) {
            this._rotateControls();
            this._zoomControls();
            this._updateCamera();
        }
    }
    onLateUpdate() {
        super.onLateUpdate();
    }
    onDestroy() {
        super.onDestroy();
    }
}

/**
 * An easy to use class for handling a simple collection of flags.
 * This is easier to setup than bitwise flags and uses Typescript to stay strongly typed.
 */
class Flags {
    constructor(initialFlags) {
        this._flags = Object.create(initialFlags);
        this._flags = Object.assign(this._flags, initialFlags);
    }
    get flagCount() {
        return Object.keys(this._flags).length;
    }
    /**
     * Set wether or not the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    set(enabled, ...flags) {
        flags = this._internalGetFlags(flags);
        for (const flag of flags) {
            this._flags[flag] = enabled;
        }
    }
    /**
     * Return the name of the flag that sits at the given index.
     */
    flagFromIndex(index) {
        const keys = Object.keys(this._flags);
        if (index >= 0 && index < keys.length) {
            return keys[index];
        }
        console.error(`[Flags] Index ${index} is out of range (0 -> ${keys.length - 1})`);
        return undefined;
    }
    /**
     * Toggle the enabled state of the given flags.
     * This will set flags that are true to false and flags that are false to true.
     * If no flags are given, all available flags are assumed.
     */
    toggle(...flags) {
        flags = this._internalGetFlags(flags);
        for (const flag of flags) {
            this._flags[flag] = !this._flags[flag];
        }
    }
    /**
     * Will return true if one of the given flags is enabled.
     * If no flags are given, all available flags are assumed.
     */
    some(...flags) {
        flags = this._internalGetFlags(flags);
        for (const flag of flags) {
            if (this._flags[flag]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Will return true if all of the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    every(...flags) {
        flags = this._internalGetFlags(flags);
        for (const flag of flags) {
            if (!this._flags[flag]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Will return true if none of the given flags are enabled.
     * If no flags are given, all available flags are assumed.
     */
    not(...flags) {
        flags = this._internalGetFlags(flags);
        for (const flag of flags) {
            if (this._flags[flag]) {
                return false;
            }
        }
        return true;
    }
    only(...flags) {
        flags = this._internalGetFlags(flags);
        const remainingFlags = new Set(Object.keys(this._flags));
        // Check to make sure that the given flags are all enabled.
        for (const flag of flags) {
            if (this._flags[flag]) {
                remainingFlags.delete(flag);
            }
            else {
                // One of the given flags is not enabled.
                return false;
            }
        }
        // Now make sure all of the remaining flags are set to false.
        for (const flag of remainingFlags) {
            if (this._flags[flag]) {
                // One of the remaining flags is enabled.
                return false;
            }
        }
        // Only the given flags are enabled.
        return true;
    }
    _internalGetFlags(flags) {
        if (!flags || flags.length === 0) {
            // No flags were given, return all flags.
            flags = Object.keys(this._flags);
        }
        return flags;
    }
    toString() {
        return JSON.stringify(this._flags);
    }
}

class TapCode {
    constructor(code, onCodeEntered) {
        /**
         * Debug flags for this tap code object.
         */
        this.debugFlags = new Flags({
            inputEvents: false,
            processing: false,
        });
        /**
         * Wether or not this tap code be triggered by entering the code via the keyboard.
         */
        this.allowKeyboardEntry = false;
        this._touchCount = 0;
        this._codeQueue = [];
        this._codeEnteredCallback = onCodeEntered;
        this._codeStr = code;
        this._code = [];
        // Convert code string into array of numbers.
        for (let i = 0; i < code.length; i++) {
            const n = Number.parseInt(code[i]);
            if (Number.isInteger(n)) {
                if (n > 0 && n <= 5) {
                    this._code.push(n);
                }
                else {
                    console.error(`[TapCode] ${n} must be in the range of 1 to 5.`);
                }
            }
            else {
                console.error(`[TapCode] ${n} is not an integer. Tap code must be string of only integer numbers in the range of 1 to 5.`);
            }
        }
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
        document.body.addEventListener('keydown', this._onKeyDown);
        document.body.addEventListener('touchstart', this._onTouchStart);
        document.body.addEventListener('touchend', this._onTouchEnd);
    }
    get code() { return this._codeStr; }
    _onKeyDown(event) {
        if (!event.repeat && this.allowKeyboardEntry) {
            switch (event.key) {
                case '1':
                    this._endTouch(1);
                    break;
                case '2':
                    this._endTouch(2);
                    break;
                case '3':
                    this._endTouch(3);
                    break;
                case '4':
                    this._endTouch(4);
                    break;
                case '5':
                    this._endTouch(5);
                    break;
            }
        }
    }
    _onTouchStart(event) {
        this._touchCount = event.touches.length;
        if (this.debugFlags.some('inputEvents')) {
            console.log(`[TapCode] Touch began. count: ${this._touchCount}`);
        }
    }
    _onTouchEnd(event) {
        if (event.touches.length < this._touchCount) {
            if (this.debugFlags.some('inputEvents')) {
                console.log(`[TapCode] Touch ended. count: ${this._touchCount}`);
            }
            this._endTouch(this._touchCount);
            this._touchCount = 0;
        }
    }
    _endTouch(touchCount) {
        if (touchCount < 1) {
            return;
        }
        this._codeQueue.push(touchCount);
        if (this._codeQueue.length > this._code.length) {
            this._codeQueue.splice(0, this._codeQueue.length - this._code.length);
        }
        if (this.debugFlags.some('processing')) {
            console.log(`[TapCode] Code: ${this._codeStr} Current entry: ${JSON.stringify(this._codeQueue)}`);
        }
        if (this._codeQueue.length < this._code.length) {
            // Not enough taps yet.
            if (this.debugFlags.some('processing')) ;
            return;
        }
        for (let i = 0; i < this._codeQueue.length; i++) {
            if (this._codeQueue[i] != this._code[i]) {
                // Number doesn't match at this position yet.
                return;
            }
        }
        // Tap code success!
        if (this.debugFlags.some('processing')) {
            console.log(`[TapCode] ${this._codeStr} triggered!`);
        }
        this._codeQueue = [];
        this._codeEnteredCallback(this);
    }
    dispose() {
        this._codeEnteredCallback = null;
        document.body.removeEventListener('keydown', this._onKeyDown);
        document.body.removeEventListener('touchstart', this._onTouchStart);
        document.body.removeEventListener('touchend', this._onTouchEnd);
    }
}

class DeviceCameraReader {
    constructor() {
        this._running = false;
        this._canvas = document.createElement('canvas');
        this._update = this._update.bind(this);
    }
    get deviceCamera() { return this._deviceCamera; }
    ;
    get canvas() { return this._canvas; }
    ;
    get running() { return this._running; }
    ;
    /**
     * Start the camera reader with the given options.
     */
    start(options) {
        if (this._running) {
            throw new Error(`${this.constructor.name} is already running. Check 'running' property before calling start()`);
        }
        this._deviceCamera = options.deviceCamera;
        this._running = true;
        this._updateHandle = requestAnimationFrame(this._update);
    }
    _update() {
        if (this._running && this._deviceCamera && this._deviceCamera.isPlaying()) {
            const video = this._deviceCamera.getVideoElement();
            this._canvas.width = video.videoWidth;
            this._canvas.height = video.videoHeight;
            const ctx = this._canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, this._canvas.width, this._canvas.height);
            this.onRenderedToCanvas(this._canvas);
        }
        this._updateHandle = requestAnimationFrame(this._update);
    }
    onRenderedToCanvas(canvas) {
        // Do nothing by default.
    }
    stop() {
        this._deviceCamera = null;
        this._running = false;
        if (typeof this._updateHandle === 'number') {
            cancelAnimationFrame(this._updateHandle);
        }
    }
    dispose() {
        this._deviceCamera = null;
        this._canvas = null;
    }
}

class DeviceCameraQRReader extends DeviceCameraReader {
    constructor() {
        super();
        /**
         * Event that is invoked when a qr code is scanned.
         */
        this.onQRScanned = new ArgEvent();
    }
    start(options) {
        super.start(options);
    }
    onRenderedToCanvas(canvas) {
        super.onRenderedToCanvas(canvas);
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
        });
        if (code) {
            this.onQRScanned.invoke(code.data);
        }
    }
    stop() {
        super.stop();
    }
    dispose() {
        super.dispose();
        this.onQRScanned.removeAllListeners();
    }
}

class State {
    constructor(id, stateMachine) {
        this._id = id;
        this._stateMachine = stateMachine;
    }
    /**
     * The id of the state.
     */
    get id() { return this._id; }
    /**
     * The state machine that the state belongs to.
     */
    get stateMachine() { return this._stateMachine; }
}
class StateMachine {
    constructor(name) {
        /**
         * Debug level for this state machine.
         * 0 = Disabled
         * 1 = State enter/exit
         * 2 = State command
         * 3 = State update
         */
        this.debugLevel = 0;
        this._states = new Map();
        this._transitions = [];
        this.onStateEnter = new ArgEvent();
        this.onStateExit = new ArgEvent();
        this._name = name;
    }
    /**
     * The name of the state machine.
     */
    get name() { return this._name; }
    /**
     * The current state that the state machine is in.
     */
    get currentState() { return this._curState; }
    /**
     * The previous transition used to get to the current state.
     */
    get previousTransition() { return this._prevTransition; }
    /**
     * Startup the state machine in the given state.
     */
    start(startingStateId) {
        if (this._active) {
            return;
        }
        this._active = true;
        this._changeState(startingStateId);
        this.update();
    }
    /**
     * Pause updating the state machine.
     */
    pause() {
        if (!this._active) {
            return;
        }
        this._active = false;
    }
    /**
     * Resume updating the state machine.
     */
    resume() {
        if (this._active) {
            return;
        }
        this._active = true;
        this.update();
    }
    /**
     * Add the given state to the state machine.
     */
    addState(state) {
        if (this._active) {
            throw new Error(`Cannot add states after the state machine has been started.`);
        }
        this._states.set(state.id, state);
    }
    /**
     * Add the given transition to the state machine.
     */
    addStateTransition(fromStateId, command, nextStateId) {
        if (this._active) {
            throw new Error(`Cannot add state transitions after the state machine has been started.`);
        }
        const transition = { fromStateId, command, nextStateId };
        if (!this._states.has(nextStateId)) {
            throw new Error(`Can't add transition for State '${nextStateId}'. This state does not exist on the state machine.`);
        }
        const alreadyAdded = this._transitions.some(t => isEqual(t, transition));
        if (!alreadyAdded) {
            this._transitions.push(transition);
        }
    }
    /**
     * Return the state that is assigned the given state id.
     */
    getState(stateId) {
        return this._states.get(stateId);
    }
    /**
     * Update the state machine. Should be called once per frame.
     */
    update() {
        if (!this._active) {
            return;
        }
        this._updateState();
    }
    /**
     * Usually this state machine should be controlled with state transitions, but in some cases we may want to force a state change.
     */
    forceChangeState(stateId) {
        this._changeState(stateId);
    }
    /**
     * Dispose of the state machine.
     */
    dispose() {
        for (const [id, state] of this._states) {
            state.dispose();
        }
        this._active = false;
        this._curState = null;
        this._changeStateId = null;
        this._lastStateUpdate = null;
        this._transitions = [];
        this._states = new Map();
        this._prevTransition = null;
        this.onStateEnter.removeAllListeners();
        this.onStateExit.removeAllListeners();
    }
    _changeState(stateId) {
        this._changeStateId = stateId;
        // Set the last update frame to an invalid number so that the update state function is forced to run.
        this._lastStateUpdate = -1;
        // Run the update state function immediately to respond to change the state in the same frame.
        this._updateState();
    }
    _getTransition(command) {
        if (!this._transitions) {
            return null;
        }
        const transition = this._transitions.find(t => t.command === command && t.fromStateId === this._curState.id);
        if (!transition) {
            throw new Error(`[StateMachine::${this._name}] No transition found for State '${this._curState.id}' with command '${command}'`);
        }
        return transition;
    }
    _updateState() {
        if (this._lastStateUpdate === APEngine.time.frameCount) {
            return;
        }
        this._lastStateUpdate = APEngine.time.frameCount;
        if (this._changeStateId) {
            if (this._curState) {
                if (this.debugLevel >= 1) {
                    console.log(`[StateMachine::${this._name}] ${this._curState.id} onStateExit. Frame: ${APEngine.time.frameCount}`);
                }
                this._curState.onStateExit();
                this.onStateExit.invoke(this._curState.id);
            }
            this._curState = this._states.get(this._changeStateId);
            if (this._curState) {
                if (this.debugLevel >= 1) {
                    console.log(`[StateMachine::${this._name}] ${this._curState.id} onStateEnter. Frame: ${APEngine.time.frameCount}`);
                }
                this._curState.onStateEnter();
                this.onStateEnter.invoke(this._curState.id);
            }
            else {
                throw new Error(`[StateMachine::${this._name}] No State with Id ${this._changeStateId} found.`);
            }
            this._changeStateId = null;
        }
        if (this._curState) {
            if (this.debugLevel >= 3) {
                console.log(`[StateMachine::${this._name}] ${this._curState.id} onStateUpdate. Frame: ${APEngine.time.frameCount}`);
            }
            const command = this._curState.onStateUpdate();
            if (command) {
                const transition = this._getTransition(command);
                this._prevTransition = transition;
                if (this.debugLevel >= 2) {
                    console.log(`[StateMachine::${this._name}] ${this._curState.id} Command: ${command}, NextStateId: ${transition.nextStateId}. Frame: ${APEngine.time.frameCount}`);
                }
                this._changeState(transition.nextStateId);
            }
        }
    }
}

/**
 * Property Spectator is a simple wrapper object around any javascript value that has events for
 * when it is set/changed as well as polling function for changes.
 */
class PropertySpectator {
    constructor(value) {
        this._value = null;
        this._prevValue = null;
        /**
         * Event invoked when the property value is changed.
         */
        this.onValueChanged = new ArgEvent();
        this._value = value;
    }
    /**
     * The property's current value.
     */
    get value() {
        return this._value;
    }
    set value(obj) {
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
    get previousValue() {
        return this._prevValue;
    }
    /**
     * Does the property currently have a value assigned.
     */
    get hasValue() {
        return (this._value !== null && this._value !== undefined);
    }
}

/**
 * This is a generic object pool class that can be extended from to implement a pool for
 * theoretically any type of object you would want.
 */
class ObjectPool {
    constructor(name, poolEmptyWarn) {
        this.name = getOptionalValue(name, `ObjectPool_${MathUtils.generateUUID()}`);
        this.poolEmptyWarn = getOptionalValue(poolEmptyWarn, true);
        this._objectIds = new Map();
    }
    get poolSize() {
        return this._pool.length;
    }
    /**
     * Initialize the pool of objects.
     * @param startSize [Optional] How starting size of the object pool (Default is 5).
     */
    initializePool(startSize) {
        if (this._pool)
            return;
        startSize = startSize || 5;
        this._pool = [];
        for (let i = 0; i < startSize; i++) {
            const obj = this.createPoolObject();
            const id = this.getPoolObjectId(obj);
            this._objectIds.set(id, true);
            this._pool.push(obj);
        }
        return this;
    }
    /**
     * Retrieve an object from the pool.
     */
    retrieve() {
        if (!this._pool) {
            this.initializePool();
        }
        let obj = null;
        if (this._pool.length > 0) {
            obj = this._pool[0];
            remove(this._pool, o => o === obj);
        }
        else {
            if (this.poolEmptyWarn) {
                console.warn('[ObjectPool]', this.name, 'ran out of objects in its pool, so it is generating another one.');
            }
            obj = this.createPoolObject();
            const id = this.getPoolObjectId(obj);
            this._objectIds.set(id, true);
        }
        this.onRetrieved(obj);
        return obj;
    }
    /**
     * Restore the object to the pool.
     * @param obj
     */
    restore(obj) {
        if (!this._pool) {
            console.warn("[ObjectPool] Can't place object", obj, 'in pool', this.name, 'because the pool was never initialized.');
            return false;
        }
        const id = this.getPoolObjectId(obj);
        if (!this._objectIds.has(id)) {
            console.warn("[ObjectPool] Can't place object", obj, 'in pool', this.name, 'because it does not originate from it.');
            return false;
        }
        this._pool.push(obj);
        this.onRestored(obj);
        return true;
    }
    /**
     * Dispose of the pool and any objects it is holding on to.
     */
    dispose() {
        if (this._pool) {
            for (let i = this._pool.length - 1; i >= 0; i--) {
                let obj = this._pool[i];
                if (obj) {
                    this.disposePoolObject(obj);
                }
                this._pool.splice(i, 1);
            }
        }
        this._objectIds.clear();
    }
}

/**
 * APE Asset Tracker is a class that tracks objects that must be manually cleaned up that are created by Three JS.
 * These include geometries, materials, and textures.
 *
 * To use this tracker, create a new instance of it and then call track() with the given asset you would like to track.
 * The tracker will then recursively search through the asset's heirarchy (if it as one) as track all geometries, materials, and textures that it finds.
 * When you are ready to dispose of the tracked assets, call the dispose() function.
 *
 * Reference: https://threejsfundamentals.org/threejs/lessons/threejs-cleanup.html
 */
var APEAssetTracker;
(function (APEAssetTracker) {
    /**
     * Map of tracked assets indexed by the trackable's uuid.
     */
    APEAssetTracker.assetRefs = new Map();
    /**
     * Debug level for asset tracker.
     * 0: Disabled, 1: Track/Release events, 2: Total counts
     */
    APEAssetTracker.debugLevel = 0;
    APEAssetTracker.snapshots = [];
    /**
     * Map of uuids for objects that do not define a uuid within themselves.
     */
    let internalUUIDs = new Map();
    function getUUID(trackable) {
        if ('uuid' in trackable) {
            return trackable.uuid;
        }
        else {
            let uuid = internalUUIDs.get(trackable);
            if (!uuid) {
                uuid = MathUtils.generateUUID();
                internalUUIDs.set(trackable, uuid);
            }
            return uuid;
        }
    }
    function getName(trackable) {
        if ('name' in trackable) {
            return trackable.name;
        }
        else if (trackable instanceof Skeleton) {
            return 'Skeleton';
        }
        else {
            return 'Unnamed';
        }
    }
    function getType(trackable) {
        if ('type' in trackable) {
            return trackable.type;
        }
        else if (trackable instanceof Skeleton) {
            return 'Skeleton';
        }
        else {
            return 'Unknown Type';
        }
    }
    /**
     * Recursive search function that will collect all objects underneath the given asset that can be considered a Trackable.
     * Each item's key in the Map is the trackable's uuid.
     */
    function findTrackables(asset, trackables) {
        if (!asset) {
            return;
        }
        // Handle arrays of objects, materials, and textures.
        if (Array.isArray(asset)) {
            asset.forEach(resource => findTrackables(resource, trackables));
            return;
        }
        if ('dispose' in asset || asset instanceof Object3D) {
            trackables.set(getUUID(asset), asset);
        }
        if (asset instanceof Object3D) {
            if (asset instanceof Mesh) {
                findTrackables(asset.geometry, trackables);
                findTrackables(asset.material, trackables);
                if (asset instanceof SkinnedMesh) {
                    findTrackables(asset.skeleton, trackables);
                }
            }
            findTrackables(asset.children, trackables);
        }
        else if (asset instanceof Material) {
            // We have to check if there are any textures on the material
            for (const value of Object.values(asset)) {
                if (value instanceof Texture) {
                    findTrackables(value, trackables);
                }
            }
            // We also have to check if any uniforms reference textures or arrays of textures
            if ('uniforms' in asset) {
                const uniforms = asset.uniforms;
                for (const uniform of Object.values(uniforms)) {
                    if (uniform) {
                        const uniformValue = uniform.value;
                        if (uniformValue instanceof Texture || Array.isArray(uniformValue)) {
                            findTrackables(uniformValue, trackables);
                        }
                    }
                }
            }
        }
    }
    function getAssetCounts() {
        const assetCounts = {
            geometry: 0,
            material: 0,
            object3d: 0,
            texture: 0,
            skeleton: 0,
            unknown: 0
        };
        APEAssetTracker.assetRefs.forEach((assetRef) => {
            const asset = assetRef.asset;
            if (asset instanceof Object3D) {
                assetCounts.object3d++;
            }
            else if (asset instanceof Material) {
                assetCounts.material++;
            }
            else if (asset instanceof BufferGeometry) {
                assetCounts.geometry++;
            }
            else if (asset instanceof Texture) {
                assetCounts.texture++;
            }
            else if (asset instanceof Skeleton) {
                assetCounts.skeleton++;
            }
            else {
                assetCounts.unknown++;
            }
        });
        return assetCounts;
    }
    APEAssetTracker.getAssetCounts = getAssetCounts;
    /**
     * Take a snapshot of the current state of asset references.
     * This is useful for comparing snapshots during debugging to figure out which assets are not
     * being untracked and cleaned up properly.
     */
    function takeSnapshot() {
        const snapshot = {
            assetSnapshots: []
        };
        APEAssetTracker.assetRefs.forEach((assetRef) => {
            snapshot.assetSnapshots.push({
                uuid: getUUID(assetRef.asset),
                name: getName(assetRef.asset),
                type: getType(assetRef.asset),
                referenceCount: assetRef.referenceCount,
            });
        });
        APEAssetTracker.snapshots.push(snapshot);
        return snapshot;
    }
    APEAssetTracker.takeSnapshot = takeSnapshot;
    function clearSnapshots() {
        APEAssetTracker.snapshots = [];
    }
    APEAssetTracker.clearSnapshots = clearSnapshots;
    function diffOfLastTwoSnapshots() {
        if (APEAssetTracker.snapshots.length >= 2) {
            return diffOfSnapshots(APEAssetTracker.snapshots[APEAssetTracker.snapshots.length - 2], APEAssetTracker.snapshots[APEAssetTracker.snapshots.length - 1]);
        }
        else {
            console.warn(`Need at least two snapshots in order to diff the last two.`);
        }
    }
    APEAssetTracker.diffOfLastTwoSnapshots = diffOfLastTwoSnapshots;
    function diffOfSnapshots(snapshotA, snapshotB) {
        const setA = Array.from(new Set(snapshotA.assetSnapshots));
        const setB = Array.from(new Set(snapshotB.assetSnapshots));
        // Create a diff set that has the elements from setA that are not in setB.
        const diff = [];
        for (const entry of setA) {
            const inSetB = setB.some(snap => snap.uuid === entry.uuid);
            if (!inSetB) {
                diff.push(entry);
            }
        }
        return diff;
    }
    APEAssetTracker.diffOfSnapshots = diffOfSnapshots;
    function intersectOfLastTwoSnapshots() {
        if (APEAssetTracker.snapshots.length >= 2) {
            return intersectOfSnapshots(APEAssetTracker.snapshots[APEAssetTracker.snapshots.length - 2], APEAssetTracker.snapshots[APEAssetTracker.snapshots.length - 1]);
        }
        else {
            console.warn(`Need at least two snapshots in order to intersect the last two.`);
        }
    }
    APEAssetTracker.intersectOfLastTwoSnapshots = intersectOfLastTwoSnapshots;
    function intersectOfSnapshots(snapshotA, snapshotB) {
        const setA = Array.from(new Set(snapshotA.assetSnapshots));
        const setB = Array.from(new Set(snapshotB.assetSnapshots));
        // Create a intersection set that has the elements that are in both setA and setB.
        const intersect = [];
        for (const entry of setA) {
            const inSetB = setB.some(snap => snap.uuid === entry.uuid);
            if (inSetB) {
                intersect.push(entry);
            }
        }
        return intersect;
    }
    APEAssetTracker.intersectOfSnapshots = intersectOfSnapshots;
    /**
     * Track the given asset by incrementing the reference counter for it.
     */
    function track(asset) {
        const trackables = new Map();
        findTrackables(asset, trackables);
        if (trackables && trackables.size > 0) {
            trackables.forEach((asset, uuid) => {
                let assetRef = APEAssetTracker.assetRefs.get(uuid);
                if (assetRef) {
                    assetRef.referenceCount++;
                }
                else {
                    assetRef = {
                        asset: asset,
                        referenceCount: 1
                    };
                    APEAssetTracker.assetRefs.set(getUUID(asset), assetRef);
                }
                if (APEAssetTracker.debugLevel >= 1) {
                    console.log(`[APEAssetTracker] track asset type: ${asset.constructor.name}, uuid: ${getUUID(asset)}, refCount: ${assetRef.referenceCount}`);
                }
                if (APEAssetTracker.debugLevel >= 2) {
                    console.log(`[APEAssetTracker] tracked assets -> ${JSON.stringify(getAssetCounts())}`);
                }
            });
        }
    }
    APEAssetTracker.track = track;
    /**
     * Untrack the given asset by decrementing the reference counter for it. If the reference counter reaches zero, the asset will be released.
     */
    function untrack(asset) {
        const trackables = new Map();
        findTrackables(asset, trackables);
        if (trackables && trackables.size > 0) {
            trackables.forEach((asset, uuid) => {
                // Only release assets that are explicitly tracked by the tracker.
                // We dont want to cause unintended behaviour by releasing an untracked trackable asset.
                const assetRef = APEAssetTracker.assetRefs.get(uuid);
                if (assetRef) {
                    if (assetRef.referenceCount > 0) {
                        assetRef.referenceCount--;
                        if (APEAssetTracker.debugLevel >= 1) {
                            console.log(`[APEAssetTracker] decrement reference count for asset type: ${asset.constructor.name}, uuid: ${getUUID(asset)}, refCount: ${assetRef.referenceCount}`);
                        }
                    }
                    if (assetRef.referenceCount <= 0) {
                        if (APEAssetTracker.debugLevel >= 1) {
                            console.log(`[APEAssetTracker] release asset type: ${asset.constructor.name}, uuid: ${getUUID(asset)}`);
                        }
                        if (asset instanceof Object3D) {
                            if (asset.parent) {
                                asset.parent.remove(asset);
                            }
                        }
                        if ('dispose' in asset) {
                            asset.dispose();
                        }
                        // Remove the tracked asset from the map.
                        APEAssetTracker.assetRefs.delete(uuid);
                        // Remove the asset from the internal uuid map (if it is even in it).
                        internalUUIDs.delete(asset);
                        if (APEAssetTracker.debugLevel >= 2) {
                            console.log(`[APEAssetTracker] tracked assets -> ${JSON.stringify(getAssetCounts())}`);
                        }
                    }
                }
            });
        }
    }
    APEAssetTracker.untrack = untrack;
    /**
     * Dispose of all tracked assets.
     */
    function dispose() {
        APEAssetTracker.assetRefs.forEach((assetRef, uuid) => {
            const asset = assetRef.asset;
            untrack(asset);
            if (asset instanceof Object3D) {
                if (asset.parent) {
                    asset.parent.remove(asset);
                }
            }
            if ('dispose' in asset) {
                asset.dispose();
            }
        });
        APEAssetTracker.assetRefs = new Map();
        APEAssetTracker.snapshots = [];
        internalUUIDs = new Map();
    }
    APEAssetTracker.dispose = dispose;
})(APEAssetTracker || (APEAssetTracker = {}));

class Object3DPool extends ObjectPool {
    constructor(sourceObject, name, poolEmptyWarn) {
        super(name, poolEmptyWarn);
        this._sourceObject = sourceObject.clone(true);
        this._sourceObject.parent = null;
        APEAssetTracker.track(this._sourceObject);
    }
    onRetrieved(obj) {
        // Do nothing.
    }
    onRestored(obj) {
        if (obj.parent) {
            // Remove from its current parent.
            obj.parent.remove(obj);
            obj.parent = null;
        }
    }
    createPoolObject() {
        const obj = this._sourceObject.clone(true);
        APEAssetTracker.track(obj);
        return obj;
    }
    getPoolObjectId(obj) {
        return obj.uuid;
    }
    disposePoolObject(obj) {
        APEAssetTracker.untrack(obj);
    }
}

/**
 * A Resource Manager is a generic class that manages any type of Resouce that it is created for.
 * Resource Managers load, track, retrieve, and dipose of any Resources assigned to it.
 */
class ResourceManager {
    constructor(resourceActivator) {
        this._resources = new Map();
        this._activator = resourceActivator;
    }
    add(name, config) {
        if (!this._resources.has(name)) {
            const resource = new this._activator(name, config);
            this._resources.set(resource.name, resource);
        }
    }
    unload(name) {
        if (this._resources.has(name)) {
            const resource = this._resources.get(name);
            resource.unload();
            this._resources.delete(name);
        }
    }
    has(name) {
        return this._resources.has(name);
    }
    count() {
        return this._resources.size;
    }
    get(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._resources.has(name)) {
                const resource = this._resources.get(name);
                if (!resource.loaded) {
                    yield resource.load();
                }
                return resource;
            }
            else {
                throw new Error(`Could not get resource: ${name}`);
            }
        });
    }
    lookup(name) {
        return this._resources.get(name);
    }
    /**
     * Returns the combined loading progress of all resources that are currently in this Resource Manager.
     */
    getLoadProgress() {
        if (this._resources.size > 0) {
            let pTotal = 0;
            for (const [resourceName, resource] of this._resources) {
                pTotal += resource.progress;
            }
            return pTotal / this._resources.size;
        }
        else {
            return 1;
        }
    }
    preload() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._resources.size > 0) {
                const resources = Array.from(this._resources.values());
                yield Promise.all(resources.map(r => r.load()));
            }
        });
    }
    /**
     * Returns wether all Resources that are currently in this Resource Manager are loaded or not.
     */
    allLoaded() {
        if (this._resources.size > 0) {
            const resources = Array.from(this._resources.values());
            for (let resource of resources) {
                if (!resource.loaded) {
                    return false;
                }
            }
            return true;
        }
        else {
            return true;
        }
    }
    /**
     * Returns a map of all resource names currenty in the resource manager and wether or not they are currently loaded.
     */
    loadState() {
        const map = new Map();
        for (const [resourceName, resource] of this._resources) {
            map.set(resourceName, resource.loaded);
        }
        return map;
    }
    dispose() {
        this._resources.forEach((resource) => {
            resource.dispose();
        });
        this._resources = new Map();
    }
}

/**
 * Base class of all resource objects that are loaded by ResourceManagers.
 * Resource is a generic class that returns an internally loaded object/asset.
 * Classed that derive from Resource should specifify what the object being loaded is.
 */
class Resource {
    constructor(name, config) {
        this._name = undefined;
        this._loaded = false;
        this._loadPromise = null;
        this._object = null;
        this._progress = 0;
        this._name = name;
    }
    get name() {
        return this._name;
    }
    get loaded() {
        return this._loaded;
    }
    get progress() {
        return this._progress;
    }
    get object() {
        return this._object;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this._loaded) {
                    if (!this._loadPromise) {
                        this._loadPromise = new Promise((resolve) => {
                            this._loadObject().then((object) => {
                                this._object = object;
                                this._loaded = true;
                                this._progress = 1;
                                this._loadPromise = null;
                                resolve(this);
                            });
                        });
                    }
                    return this._loadPromise;
                }
                else {
                    return this;
                }
            }
            catch (error) {
                this._loaded = false;
                this._progress = 0;
                console.error(`Could not load resource ${this.name}.`);
                console.error(error);
            }
        });
    }
    unload() {
        if (this._object) {
            this._unloadObject();
        }
        this._object = null;
        this._progress = 0;
    }
    dispose() {
        this.unload();
    }
}

class AudioResource extends Resource {
    constructor(name, config) {
        super(name, config);
        this._url = config.url;
        this._loop = getOptionalValue(config.loop, false);
    }
    _loadObject() {
        return new Promise(((resolve, reject) => {
            const howl = new Howl({
                src: this._url,
                loop: this._loop,
                onload: () => {
                    resolve(howl);
                },
                onloaderror: (soundId, error) => {
                    reject(error);
                }
            });
        }));
    }
    _unloadObject() {
        this.object.unload();
    }
}

class GLTFPrefab {
    constructor(obj3d, clips) {
        this._prefab = obj3d;
        this._clips = clips;
        APEAssetTracker.track(this._prefab);
    }
    /**
     * The GLTF object3d prefab object.
     * It is NOT RECOMMENDED to use this in your scenes.
     * If you want a clone of the prefab use the clone() function instead.
     */
    get prefab() { return this._prefab; }
    /**
     * The animation clips for the GLTF model.
     */
    get clips() { return this._clips; }
    /**
     * Retrieve a clone of the Object3D.
     * This will clone all Object3Ds and Materials on the prefab.
     *
     * If optional childObjectName is given then the returned clone is only of the specified child object and its children.
     * If the given child object name is not found then an exception will be thrown.
     *
     * Returned object will have '(clone)' appened to its name.
     */
    clone(childObjectName) {
        if (childObjectName) {
            const childObject = this.prefab.getObjectByName(childObjectName);
            if (childObject) {
                // const clone = childObject.clone();
                const clone = SkeletonUtils.clone(childObject);
                clone.name = `${clone.name} (clone)`;
                return clone;
            }
            else {
                throw new Error(`Could not find child object named ${childObjectName} in the prefab ${this._prefab}`);
            }
        }
        else {
            // const clone = this._prefab.clone();
            const clone = SkeletonUtils.clone(this._prefab);
            clone.name = `${clone.name} (clone)`;
            return clone;
        }
    }
    dispose() {
        APEAssetTracker.untrack(this._prefab);
    }
}

class GLTFResource extends Resource {
    constructor(name, config) {
        super(name, config);
        this._gltfUrl = config.gltfUrl;
        this._binUrl = config.binUrl;
        this._textureUrls = config.textureUrls;
    }
    _loadObject() {
        return new Promise((resolve, reject) => {
            const loadingManager = new LoadingManager();
            loadingManager.setURLModifier((url) => {
                if (url.startsWith('data:')) {
                    // Do not redirect data uris.
                    return url;
                }
                if (url.startsWith('blob:')) {
                    // Do not redirect blobs.
                    return url;
                }
                // Redirect gltf relative url to CDN asset location.
                const filename = getFilename(url);
                const ext = getExtension(url);
                if (filename === 'draco_wasm_wrapper.js' || filename === 'draco_decoder.wasm' || filename === 'draco_decoder.js') {
                    // Do not redirect draco specific files.
                    return url;
                }
                let redirectUrl = null;
                if (ext === 'gltf' || ext === 'glb') {
                    redirectUrl = this._gltfUrl;
                }
                else if (ext === 'bin') {
                    if (this._binUrl) {
                        redirectUrl = this._binUrl;
                    }
                }
                else {
                    // Assume that url is for texture image.
                    if (this._textureUrls) {
                        if (isStringArray(this._textureUrls)) {
                            if (!GLTFResource._sentTextureUrlObsoleteWarning) {
                                console.warn(`[GLTFResource] WARNING! OBSOLETE! It is highly recommended that GLTFResource textureUrls be in GLTFTextureRedirect format and not a plain string array.
                                The string array implementation was designed for a specific CDN use case and requires that filesnames match. This filename matching does 
                                not work if using local assets that are hashed at build time.
                                `);
                                GLTFResource._sentTextureUrlObsoleteWarning = true;
                            }
                            redirectUrl = this._textureUrls.find((textureUrl) => filename === getFilename(textureUrl));
                        }
                        else {
                            const textureRedirect = this._textureUrls.find((tr) => filename === tr.filename);
                            if (textureRedirect) {
                                redirectUrl = textureRedirect.redirectUrl;
                            }
                        }
                    }
                }
                if (!redirectUrl) {
                    console.error(`[GLTFResource] ${this.name} could not find a redirect url for ${url}`);
                }
                return redirectUrl;
            });
            const gltfLoader = new GLTFLoader(loadingManager);
            if (!GLTFResource._dracoLoader) {
                GLTFResource._dracoLoader = new DRACOLoader(loadingManager);
                GLTFResource._dracoLoader.setDecoderPath('public/draco/');
                GLTFResource._dracoLoader.setDecoderConfig({ type: 'js' });
            }
            gltfLoader.setDRACOLoader(GLTFResource._dracoLoader);
            gltfLoader.load(this._gltfUrl, (gltf) => {
                const prefab = new GLTFPrefab(gltf.scene, gltf.animations);
                resolve(prefab);
            }, (progressEvent) => {
                this._progress = progressEvent.loaded / progressEvent.total;
            }, (errorEvent) => {
                console.error(`[GLTFResource] ${this.name} Error: ${errorEvent}`);
                reject(errorEvent);
            });
        });
    }
    _unloadObject() {
        this.object.dispose();
    }
}
GLTFResource._sentTextureUrlObsoleteWarning = false;
GLTFResource._dracoLoader = null;
function isStringArray(value) {
    if (value && Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === 'string') {
            return true;
        }
    }
    return false;
}

class TextureResource extends Resource {
    constructor(name, config) {
        super(name, config);
        this._url = config.url;
        this._encoding = config.encoding;
        this._flipY = getOptionalValue(this._flipY, true); // This is the defualt value as of ThreeJS r113
    }
    _loadObject() {
        return new Promise(((resolve, reject) => {
            const loader = new TextureLoader();
            loader.load(this._url, (texture) => {
                if (this._encoding) {
                    texture.encoding = this._encoding;
                    texture.needsUpdate = true;
                }
                texture.flipY = this._flipY ? true : false;
                texture.needsUpdate = true;
                resolve(texture);
            }, (progressEvent) => {
                this._progress = progressEvent.loaded / progressEvent.total;
            }, (errorEvent) => {
                reject(errorEvent);
            });
        }));
    }
    _unloadObject() {
        this.object.dispose();
    }
}

class ImageResource extends Resource {
    constructor(name, config) {
        super(name, config);
        this._url = config.url;
    }
    _loadObject() {
        const onProgress = (event) => {
            this._progress = event.loaded / event.total;
        };
        return loadImage(this._url, onProgress);
    }
    _unloadObject() {
    }
}

class ResourceProgress {
    constructor(id, weight) {
        this.value = 0;
        this._id = id;
        this._weight = weight;
    }
    get id() { return this._id; }
    get weight() { return this._weight; }
}
class ResourceProgressMap {
    constructor() {
        this._progressMap = new Map();
    }
    addProgressObject(config) {
        let p = this._progressMap.get(config.id);
        if (!p) {
            p = new ResourceProgress(config.id, config.weight);
            this._progressMap.set(config.id, p);
        }
        return p;
    }
    removeProgressObject(id) {
        this._progressMap.delete(id);
    }
    clearProgressObjects() {
        this._progressMap = new Map();
    }
    calculateWeightedMean() {
        if (this._progressMap.size === 0) {
            return 0;
        }
        let pSum = 0;
        let wSum = 0;
        for (const [id, p] of this._progressMap) {
            pSum += p.value * p.weight;
            wSum += p.weight;
        }
        const mean = pSum / wSum;
        return mean;
    }
}

/**
 * Contains all the core APEngine Resource Managers and related objects.
 */
var APEResources;
(function (APEResources) {
    APEResources.audio = new ResourceManager(AudioResource);
    APEResources.gltf = new ResourceManager(GLTFResource);
    APEResources.textures = new ResourceManager(TextureResource);
    APEResources.images = new ResourceManager(ImageResource);
    /**
     * Preload all resource managers.
     */
    function preloadResources() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                APEResources.audio.preload(),
                APEResources.gltf.preload(),
                APEResources.textures.preload(),
                APEResources.images.preload()
            ]);
        });
    }
    APEResources.preloadResources = preloadResources;
    function getProgress() {
        const progressMap = new ResourceProgressMap();
        const audioProgress = progressMap.addProgressObject({ id: 'audio', weight: APEResources.audio.count() });
        audioProgress.value = APEResources.audio.getLoadProgress();
        const gltfProgress = progressMap.addProgressObject({ id: 'gltf', weight: APEResources.gltf.count() });
        gltfProgress.value = APEResources.gltf.getLoadProgress();
        const textureProgress = progressMap.addProgressObject({ id: 'textures', weight: APEResources.textures.count() });
        textureProgress.value = APEResources.textures.getLoadProgress();
        const imageProgress = progressMap.addProgressObject({ id: 'images', weight: APEResources.images.count() });
        imageProgress.value = APEResources.images.getLoadProgress();
        return progressMap.calculateWeightedMean();
    }
    APEResources.getProgress = getProgress;
    /**
     * Dispose of all resource managers.
     */
    function diposeAll() {
        APEResources.audio.dispose();
        APEResources.gltf.dispose();
        APEResources.textures.dispose();
        APEResources.images.dispose();
    }
    APEResources.diposeAll = diposeAll;
    /**
     * Print out all resource manager load states to the console.
     */
    function printLoadStates() {
        console.groupCollapsed(`[APEResource] Resource Manager Load States`);
        console.log('Audio');
        console.log(APEResources.audio.loadState());
        console.log('GLTF');
        console.log(APEResources.gltf.loadState());
        console.log('Textures');
        console.log(APEResources.textures.loadState());
        console.log('Images');
        console.log(APEResources.images.loadState());
        console.groupEnd();
    }
    APEResources.printLoadStates = printLoadStates;
})(APEResources || (APEResources = {}));

/**
 * Easing functions from https://easings.net/
 */
function easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2);
}
function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}
function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}
function easeInCubic(x) {
    return x * x * x;
}
function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}
function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeInQuint(x) {
    return x * x * x * x * x;
}
function easeOutQuint(x) {
    return 1 - Math.pow(1 - x, 5);
}
function easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}
function easeInCirc(x) {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
}
function easeOutCirc(x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}
function easeInOutCirc(x) {
    return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}
function easeInElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
}
function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
function easeInOutElastic(x) {
    const c5 = (2 * Math.PI) / 4.5;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}
function easeInQuad(x) {
    return x * x;
}
function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
}
function easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
function easeInQuart(x) {
    return x * x * x * x;
}
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}
function easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}
function easeInExpo(x) {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
function easeInOutExpo(x) {
    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? Math.pow(2, 20 * x - 10) / 2
                : (2 - Math.pow(2, -20 * x + 10)) / 2;
}
function easeInBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
}
function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function easeInOutBack(x) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return x < 0.5
        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}
function easeInBounce(x) {
    return 1 - easeOutBounce(1 - x);
}
function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) {
        return n1 * x * x;
    }
    else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    }
    else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    }
    else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}
function easeInOutBounce(x) {
    return x < 0.5
        ? (1 - easeOutBounce(1 - 2 * x)) / 2
        : (1 + easeOutBounce(2 * x - 1)) / 2;
}

/**
 * Simple object that can mesaure the passage of time.
 * Useful for debugging code performance or simply getting elapsed time values.
 */
class Stopwatch {
    /**
     * Create a new Stopwatch with the start time set to time of creation.
     */
    constructor() {
        this._startTime = null;
        this._stopTime = null;
        this.start();
    }
    /**
     * STart the stopwatch. Set's the start time to now.
     */
    start() {
        this._startTime = Date.now();
        this._stopTime = null;
    }
    /**
     * Stop the stopwatch. Set's the stop time to now.
     */
    stop() {
        this._stopTime = Date.now();
    }
    /**
     * Reset the stopwatch. Clears both the start and stop time.
     */
    reset() {
        this._startTime = null;
        this._stopTime = null;
    }
    /**
     * Return number of milliseconds that have elapsed.
     */
    elapsed() {
        var _a;
        if (this._startTime) {
            const endTime = (_a = this._stopTime) !== null && _a !== void 0 ? _a : Date.now();
            return endTime - this._startTime;
        }
        else {
            return 0;
        }
    }
}

export { APEAssetTracker, APEResources, APEngine, APEngineBuildInfo, APEngineEvents, AnimatorDecorator, ArgEvent, AudioResource, CameraDecorator, CameraOrbitDecorator, Decorator, DeviceCamera, DeviceCameraQRReader, DeviceCameraReader, Event, Flags, GLTFPrefab, GLTFResource, GameObject, ImageResource, Input, InputState, InputType, MeshDecorator, MouseButtonId, Object3DPool, ObjectPool, Physics, PointerEventSystem, PromiseArgEvent, PromiseEvent, PropertySpectator, Resource, ResourceManager, Shout, State, StateMachine, Stopwatch, TapCode, TextureResource, ThreeDevTools, Time, TransformPickerDecorator, TransformTool, Vector3_Back, Vector3_Down, Vector3_Forward, Vector3_Left, Vector3_One, Vector3_Right, Vector3_Up, Vector3_Zero, XRInput, XRPhysics, appendLine, calculateFrustumPlanes, calculateRowOffsets, clamp, clampDegAngle, convertToBox2, copyToClipboard, createDebugCube, createDebugSphere, debugLayersToString, disposeObject3d, disposeObject3ds, easeInBack, easeInBounce, easeInCirc, easeInCubic, easeInElastic, easeInExpo, easeInOutBack, easeInOutBounce, easeInOutCirc, easeInOutCubic, easeInOutElastic, easeInOutExpo, easeInOutQuad, easeInOutQuart, easeInOutQuint, easeInOutSine, easeInQuad, easeInQuart, easeInQuint, easeInSine, easeOutBack, easeOutBounce, easeOutCirc, easeOutCubic, easeOutElastic, easeOutExpo, easeOutQuad, easeOutQuart, easeOutQuint, easeOutSine, findParentScene, getElementByClassName, getExtension, getFilename, getMaterials, getOptionalValue, getWorldPosition, hasValue, inRange, interpolate, interpolateClamped, isEven, isObjectChildOf, isObjectVisible, isOdd, loadImage, normalize, normalizeClamped, objectWorldDirection, pointInPolygon2D, pointOnCircle, pointOnSphere, postJsonData, rotationToFace, setLayer, setLayerMask, setParent, setWorldPosition, sortAZ, sortZA, splitInteger, traverseSafe, traverseVisibleSafe, unnormalize, unnormalizeClamped, waitForCondition, waitForSeconds, worldToScreenPosition };
//# sourceMappingURL=index.js.map
