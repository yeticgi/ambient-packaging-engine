import { ArgEvent } from "./Events";
export declare abstract class State<Id, Command> {
    private _id;
    get id(): Id;
    constructor(id: Id);
    abstract onStateEnter(): void;
    abstract onStateUpdate(): Command;
    abstract onStateExit(): void;
}
export declare class StateMachine<Id, Command> {
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
    get currentState(): State<Id, Command>;
    onStateEnter: ArgEvent<Id>;
    onStateExit: ArgEvent<Id>;
    constructor(name: string);
    start(startingStateId: Id): void;
    pause(): void;
    resume(): void;
    addState(state: State<Id, Command>): void;
    addStateTransition(fromStateId: Id, command: Command, nextStateId: Id): void;
    getState(stateId: Id): State<Id, Command>;
    update(): void;
    /**
     * Usually this state machine should be controlled with state transitions, but in some cases we may want to force a state change.
     */
    forceChangeState(stateId: Id): void;
    private _changeState;
    private _getNextStateId;
    private _updateState;
}
