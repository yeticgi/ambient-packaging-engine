import { ArgEvent } from "./Events";
export declare abstract class State {
    private _id;
    get id(): string;
    constructor(id: string);
    abstract onStateEnter(): void;
    abstract onStateUpdate(): string;
    abstract onStateExit(): void;
}
export declare class StateMachine {
    /**
     * Debug level for this state machine.
     * 0 = Disabled
     * 1 = State enter/exit
     * 2 = State command
     * 3 = State update
     */
    debugLevel: number;
    private _name;
    private _states;
    private _transitions;
    private _curState;
    private _changeStateId;
    private _lastStateUpdate;
    private _active;
    get name(): string;
    get currentState(): State;
    onStateEnter: ArgEvent<string>;
    onStateExit: ArgEvent<string>;
    constructor(name: string);
    start(startingStateId: string): void;
    pause(): void;
    resume(): void;
    addState(state: State): void;
    addStateTransition(fromStateId: string, command: string, nextStateId: string): void;
    getState(stateId: string): State;
    update(): void;
    /**
     * Usually this state machine should be controlled with state transitions, but in some cases we may want to force a state change.
     */
    forceChangeState(stateId: string): void;
    private _changeState;
    private _getNextStateId;
    private _updateState;
}
