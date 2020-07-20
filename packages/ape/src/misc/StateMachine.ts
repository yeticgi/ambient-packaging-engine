import { ArgEvent } from "./Events";
import { APEngine } from "../APEngine";
import isEqual from "lodash/isEqual";
import { IDisposable } from "./IDisposable";

export abstract class State<Id, Command> {
    private _id: Id;
    private _stateMachine: StateMachine<Id, Command>;

    /**
     * The id of the state.
     */
    get id(): Id { return this._id }

    /**
     * The state machine that the state belongs to.
     */
    get stateMachine(): StateMachine<Id, Command> { return this._stateMachine }

    constructor(id: Id, stateMachine: StateMachine<Id, Command>) {
        this._id = id;
        this._stateMachine = stateMachine;
    }

    abstract onStateEnter(): void;
    abstract onStateUpdate(): Command;
    abstract onStateExit(): void;
    abstract dispose(): void;
}

interface ITransition<Id, Command> {
    fromStateId: Id,
    command: Command,
    nextStateId: Id
}

export class StateMachine<Id, Command> implements IDisposable {
    /**
     * Debug level for this state machine.  
     * 0 = Disabled  
     * 1 = State enter/exit  
     * 2 = State command
     * 3 = State update
     */
    debugLevel: number = 0;

    private _name: string;
    private _states: Map<Id, State<Id, Command>> = new Map();
    private _transitions: ITransition<Id, Command>[] = [];
    private _curState: State<Id, Command>;
    private _changeStateId: Id;
    private _lastStateUpdate: number;
    private _active: boolean;
    private _prevTransition: ITransition<Id, Command>;

    /**
     * The name of the state machine.
     */
    get name(): string { return this._name; } 

    /**
     * The current state that the state machine is in.
     */
    get currentState(): State<Id, Command> { return this._curState; }

    /**
     * The previous transition used to get to the current state.
     */
    get previousTransition(): ITransition<Id, Command> { return this._prevTransition; }

    onStateEnter: ArgEvent<Id> = new ArgEvent();
    onStateExit: ArgEvent<Id> = new ArgEvent();

    constructor(name: string) {
        this._name = name;
    }

    /**
     * Startup the state machine in the given state.
     */
    start(startingStateId: Id): void {
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
    pause(): void {
        if (!this._active) {
            return;
        }

        this._active = false;
    }

    /**
     * Resume updating the state machine.
     */
    resume(): void {
        if (this._active) {
            return;
        }

        this._active = true;
        this.update();
    }

    /**
     * Add the given state to the state machine.
     */
    addState(state: State<Id, Command>): void {
        if (this._active) {
            throw new Error(`Cannot add states after the state machine has been started.`);
        }

        this._states.set(state.id, state);
    }

    /**
     * Add the given transition to the state machine.
     */
    addStateTransition(fromStateId: Id, command: Command, nextStateId: Id): void {
        if (this._active) {
            throw new Error(`Cannot add state transitions after the state machine has been started.`);
        }

        const transition = { fromStateId, command, nextStateId };

        if (!this._states.has(nextStateId)) {
            throw new Error(`Can't add transition for State '${nextStateId}'. This state does not exist on the state machine.`);
        }

        const alreadyAdded: boolean = this._transitions.some(t => isEqual(t, transition));
        if (!alreadyAdded) {
            this._transitions.push(transition);
        }
    }

    /**
     * Return the state that is assigned the given state id.
     */
    getState(stateId: Id) {
        return this._states.get(stateId);
    }

    /**
     * Update the state machine. Should be called once per frame.
     */
    update(): void {
        if (!this._active) {
            return;
        }

        this._updateState();
    }

    /**
     * Usually this state machine should be controlled with state transitions, but in some cases we may want to force a state change.
     */
    forceChangeState(stateId: Id): void {
        this._changeState(stateId);
    }

    /**
     * Dispose of the state machine.
     */
    dispose(): void {
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

    private _changeState(stateId: Id): void {
        this._changeStateId = stateId;
        
        // Set the last update frame to an invalid number so that the update state function is forced to run.
        this._lastStateUpdate = -1;

        // Run the update state function immediately to respond to change the state in the same frame.
        this._updateState();
    }

    private _getTransition(command: Command): ITransition<Id, Command> {
        if (!this._transitions) {
            return null;
        }

        const transition = this._transitions.find(t => t.command === command && t.fromStateId === this._curState.id);

        if (!transition) {
            throw new Error(`[StateMachine::${this._name}] No transition found for State '${this._curState.id}' with command '${command}'`);
        }

        return transition;
    }

    private _updateState(): void {
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
            } else {
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