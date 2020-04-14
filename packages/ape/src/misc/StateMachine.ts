import { ArgEvent } from "./Events";
import { APEngine } from "../APEngine";
import isEqual from "lodash/isEqual";

export abstract class State {
    private _id: string;

    get id(): string { return this._id }

    constructor(id: string) {
        this._id = id;
    }

    abstract onStateEnter(): void;
    abstract onStateUpdate(): string;
    abstract onStateExit(): void;
}

interface ITransition {
    fromStateId: string,
    command: string,
    nextStateId: string
}

export class StateMachine {
    /**
     * Debug level for this state machine.  
     * 0 = Disabled  
     * 1 = State enter/exit  
     * 2 = State command
     * 3 = State update
     */
    debugLevel: number = 0;

    private _name: string;
    private _states: Map<string, State> = new Map();
    private _transitions: ITransition[] = [];
    private _curState: State;
    private _changeStateId: string;
    private _lastStateUpdate: number;
    private _active: boolean;

    get name(): string { return this._name; } 
    get currentState(): State { return this._curState; }

    onStateEnter: ArgEvent<string> = new ArgEvent();
    onStateExit: ArgEvent<string> = new ArgEvent();

    constructor(name: string) {
        this._name = name;
    }

    start(startingStateId: string): void {
        if (this._active) {
            return;
        }

        this._active = true;

        this._changeState(startingStateId);
        this.update();
    }

    pause(): void {
        if (!this._active) {
            return;
        }

        this._active = false;
    }

    resume(): void {
        if (this._active) {
            return;
        }

        this._active = true;
        this.update();
    }

    addState(state: State): void {
        if (this._active) {
            throw new Error(`Cannot add states after the state machine has been started.`);
        }

        this._states.set(state.id, state);
    }

    addStateTransition(fromStateId: string, command: string, nextStateId: string): void {
        if (this._active) {
            throw new Error(`Cannot add state transitions after the state machine has been started.`);
        }

        const transition: ITransition = { fromStateId, command, nextStateId };

        if (!this._states.has(nextStateId)) {
            throw new Error(`Can't add transition for State '${nextStateId}'. This state does not exist on the state machine.`);
        }

        const alreadyAdded: boolean = this._transitions.some(t => isEqual(t, transition));
        if (!alreadyAdded) {
            this._transitions.push(transition);
        }
    }

    getState(stateId: string) {
        return this._states.get(stateId);
    }

    update(): void {
        if (!this._active) {
            return;
        }

        this._updateState();
    }

    /**
     * Usually this state machine should be controlled with state transitions, but in some cases we may want to force a state change.
     */
    forceChangeState(stateId: string): void {
        this._changeState(stateId);
    }

    private _changeState(stateId: string): void {
        this._changeStateId = stateId;
        
        // Set the last update frame to an invalid number so that the update state function is forced to run.
        this._lastStateUpdate = -1;

        // Run the update state function immediately to respond to change the state in the same frame.
        this._updateState();
    }

    private _getNextStateId(command: string): string {
        if (!this._transitions) {
            return null;
        }

        const transition: ITransition = this._transitions.find(t => t.command === command && t.fromStateId === this._curState.id);

        if (!transition) {
            throw new Error(`[StateMachine::${this._name}] No transition found for State '${this._curState.id}' with command '${command}'`);
        }

        return transition.nextStateId;
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
                if (this.debugLevel >= 2) {
                    console.log(`[StateMachine::${this._name}] ${this._curState.id} Command: ${command}, NextStateId: ${this._getNextStateId(command)}. Frame: ${APEngine.time.frameCount}`);
                }

                const nextStateId = this._getNextStateId(command);
                this._changeState(nextStateId);
            }
        }
    }
}