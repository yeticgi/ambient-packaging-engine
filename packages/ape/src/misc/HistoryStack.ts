import { Event, ArgEvent } from "./Events";

export interface HistoryState {
    stateType: string;
    [key: string]: any;
}

/**
 * This the state type of the special state created by HistoryStack internally that 
 * denotes the start of the history stack (see onHistoryStackStartPop event for furthur details)
 */
export const StateType_HistoryStackStart: string = 'historystack_start';

/**
 * A custom application style history state stack.
 * This allows the wrapping of web browser History API functionality in such a way that we can keep track of
 * our own custom history state stack and treat is like a smartphone app where you only ever travel backwards.
 */
export namespace HistoryStack {
    
    var _started: boolean;
    var _historyStack: HistoryState[] = [];

    /**
     * Debug flag for HistoryStack. Enabled lots of useful console logs
     * for debugging the state of the history stack.
     */
    export var debug: boolean = false;

    /**
     * Event invoked when the start of the history stack is popped.
     * This is a special history state event that HistoryStack creates internally and
     * is always the starting point of the history stack. This start history state
     * is often the place you want to go back to the home/default state of your site.
     */
    export var onHistoryStackStartPopped: Event = new Event();

    /**
     * Event invoked when a history state is popped from the history stack.
     * This will include the special start history state type that HistoryStack created internally.
     * You can use the onHistoryStackStartPop event to listen for that event specifically if you wish.
     */
    export var onHistoryStackPopped: ArgEvent<HistoryState> = new ArgEvent();

    /**
     * Start up HistoryStack by hooking up event listeners to the History API 
     * and initializing custom history stack.
     */
    export function start(): void {
        if (_started) {
            console.error(`HistoryStack is already started.`);
            return;
        }

        if (debug) {
            console.log(`[HistoryStack] start`);
        }

        _started = true;

        // Add our popstate event listener.
        window.addEventListener("popstate", onPopState);

        // First we establish a "back" page to catch backward navigation.
        window.history.replaceState({
            isBackPage: true
        }, '');

        // Then push an "app" page on top of that - this is where the user will sit.
        // (As browsers vary, it might be safer to put this in a short setTimeout).
        window.history.pushState({
            isBackPage: false
        }, '');

        // Push 'start' history state.
        pushState({
            stateType: StateType_HistoryStackStart
        });
    }

    /**
     * Reset the state of HistoryStack. Will clear the custom history stack.
     */
    export function reset(): void {
        // Clear the history stack.
        _historyStack = [];

        // Push 'start' history state.
        pushState({
            stateType: StateType_HistoryStackStart
        });
    }

    /**
     * Get the readonly copy of the current history stack.
     */
    export function getHistoryStack(): Readonly<Readonly<HistoryState>[]> {
        return _historyStack;
    }

    /**
     * Set the history stack.
     * This is useful if loading history stack externally from something like localStorage.
     */
    export function setHistoryStack(historyStack: HistoryState[]): void {
        _historyStack = historyStack;
    }

    /**
     * Return readonly copy of the current history state.
     */
    export function currentState(): Readonly<HistoryState> {
        if (_historyStack.length > 0) {
            return _historyStack[_historyStack.length - 1];
        } else {
            return null;
        }
    }

    /**
     * Push history state to the history stack.
     */
    export function pushState(state: HistoryState): void {
        _historyStack.push(state);

        if (debug) {
            console.log(`[HistoryStack] push state`, state);
            console.log(`[HistoryStack] history stack`, _historyStack);
        }
    }

    /**
     * Remove the last state from the  history stack.
     * This will remove the state silently, as if it was never there.
     * Useful for 'undoing' the last history state.
     */
    export function removeLastState(): void {
        if (_historyStack.length > 0) {
            const state = _historyStack[_historyStack.length - 1];
            _historyStack.splice(_historyStack.length - 1, 1);

            if (debug) {
                console.log(`[HistoryStack] remove last state`, state);
                console.log(`[HistoryStack] history stack`, _historyStack);
            }
        }
    }

    function onPopState(e: PopStateEvent): void {
        if (e.state === null) {
            // If there's no state at all, then the user must have navigated to a new hash.
            // Undo what they've done (as far as navigation) by kicking them backwards to the "app" page
            window.history.go(-1);
    
            // Throw another replaceState in here.`
            // This prevents them from using the "forward" button to return to the new hash.
            window.history.replaceState({
                isBackPage: false
            }, '');
        } else {
            if (e.state.isBackPage) {
                // If there is state and it's the 'back' page...
                if (_historyStack.length > 1) {
                    // Pull/load from our custom history...

                    // Get previous history state.
                    const state = _historyStack[_historyStack.length - 2];

                    // Remove the last entry from app history.
                    removeLastState();

                    // Exceute custom logic on custom history state.
                    _onHistoryStatePop(state);
    
                    // And push them to our "app" page again
                    window.history.pushState({
                        isBackPage: false
                    }, '');
                } else {
                    // No more history - let them exit.
                    window.history.back();
                }
            }
        }
    }

    function _onHistoryStatePop(state: HistoryState): void {
        if (debug) {
            console.log(`[HistoryStack] on history state pop`, state);
            console.log(`[HistoryStack] history stack`, _historyStack);
        }

        if (state.stateType === StateType_HistoryStackStart) {
            onHistoryStackStartPopped.invoke();
        }

        onHistoryStackPopped.invoke(state);
    }
}