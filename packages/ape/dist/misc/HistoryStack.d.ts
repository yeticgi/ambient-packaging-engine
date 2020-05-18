import { Event, ArgEvent } from "./Events";
export interface HistoryState {
    stateType: string;
    [key: string]: any;
}
/**
 * This the state type of the special state created by HistoryStack internally that
 * denotes the start of the history stack (see onHistoryStackStartPop event for furthur details)
 */
export declare const StateType_HistoryStackStart: string;
/**
 * A custom application style history state stack.
 * This allows the wrapping of web browser History API functionality in such a way that we can keep track of
 * our own custom history state stack and treat is like a smartphone app where you only ever travel backwards.
 */
export declare namespace HistoryStack {
    /**
     * Debug flag for HistoryStack. Enabled lots of useful console logs
     * for debugging the state of the history stack.
     */
    var debug: boolean;
    /**
     * Event invoked when the start of the history stack is popped.
     * This is a special history state event that HistoryStack creates internally and
     * is always the starting point of the history stack. This start history state
     * is often the place you want to go back to the home/default state of your site.
     */
    var onHistoryStackStartPopped: Event;
    /**
     * Event invoked when a history state is popped from the history stack.
     * This will include the special start history state type that HistoryStack created internally.
     * You can use the onHistoryStackStartPop event to listen for that event specifically if you wish.
     */
    var onHistoryStackPopped: ArgEvent<HistoryState>;
    /**
     * Start up HistoryStack by hooking up event listeners to the History API
     * and initializing custom history stack.
     */
    function start(): void;
    /**
     * Reset the state of HistoryStack. Will clear the custom history stack.
     */
    function reset(): void;
    /**
     * Get the readonly copy of the current history stack.
     */
    function getHistoryStack(): Readonly<Readonly<HistoryState>[]>;
    /**
     * Set the history stack.
     * This is useful if loading history stack externally from something like localStorage.
     */
    function setHistoryStack(historyStack: HistoryState[]): void;
    /**
     * Return readonly copy of the current history state.
     */
    function currentState(): Readonly<HistoryState>;
    /**
     * Push history state to the history stack.
     */
    function pushState(state: HistoryState): void;
    /**
     * Remove the last state from the  history stack.
     * This will remove the state silently, as if it was never there.
     * Useful for 'undoing' the last history state.
     */
    function removeLastState(): void;
}
