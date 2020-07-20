import { ArgEvent } from "./Events";
import { IDisposable } from "./IDisposable";
export declare abstract class State<Id, Command> {
    private _id;
    private _stateMachine;
    /**
     * The id of the state.
     */
    get id(): Id;
    /**
     * The state machine that the state belongs to.
     */
    get stateMachine(): StateMachine<Id, Command>;
    constructor(id: Id, stateMachine: StateMachine<Id, Command>);
    abstract onStateEnter(): void;
    abstract onStateUpdate(): Command;
    abstract onStateExit(): void;
    abstract dispose(): void;
}
interface ITransition<Id, Command> {
    fromStateId: Id;
    command: Command;
    nextStateId: Id;
}
export declare class StateMachine<Id, Command> implements IDisposable {
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
    private _prevTransition;
    /**
     * The name of the state machine.
     */
    get name(): string;
    /**
     * The current state that the state machine is in.
     */
    get currentState(): State<Id, Command>;
    /**
     * The previous transition used to get to the current state.
     */
    get previousTransition(): ITransition<Id, Command>;
    onStateEnter: ArgEvent<Id>;
    onStateExit: ArgEvent<Id>;
    constructor(name: string);
    /**
     * Startup the state machine in the given state.
     */
    start(startingStateId: Id): void;
    /**
     * Pause updating the state machine.
     */
    pause(): void;
    /**
     * Resume updating the state machine.
     */
    resume(): void;
    /**
     * Add the given state to the state machine.
     */
    addState(state: State<Id, Command>): void;
    /**
     * Add the given transition to the state machine.
     */
    addStateTransition(fromStateId: Id, command: Command, nextStateId: Id): void;
    /**
     * Return the state that is assigned the given state id.
     */
    getState(stateId: Id): State<Id, Command>;
    /**
     * Update the state machine. Should be called once per frame.
     */
    update(): void;
    /**
     * Usually this state machine should be controlled with state transitions, but in some cases we may want to force a state change.
     */
    forceChangeState(stateId: Id): void;
    /**
     * Dispose of the state machine.
     */
    dispose(): void;
    private _changeState;
    private _getTransition;
    private _updateState;
}
export {};
