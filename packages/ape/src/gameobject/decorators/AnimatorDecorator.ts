import { 
    AnimationAction,
    AnimationMixer,
    AnimationClip,
    Event as DispatcherEvent,
    LoopOnce,
    LoopRepeat, 
    AnimationActionLoopStyles
} from 'three';
import { IDecoratorOptions, Decorator } from './Decorator';
import { GameObject } from '../GameObject';
import { APEngine } from '../../APEngine';
import { ArgEvent } from '../../misc/Events';
import { clamp, unnormalize } from '../../utils/MathUtils';

export interface IAnimatorDecoratorOptions extends IDecoratorOptions {
    clips?: AnimationClip[];
}

declare type ActionEventType = 'finished' | 'loop';

interface ActionEvent extends DispatcherEvent {
    type: ActionEventType
    action: AnimationAction;
}

interface ActionFinishedEvent extends ActionEvent {
    direction: number;
}

interface ActionLoopEvent extends ActionEvent {
    loopDelta: number;
}

export interface AnimatorEvent {
    clipName: string;
}

class ActionTracker {
    private _actions: AnimationAction[] = [];
    private _animator: AnimatorDecorator;

    get count(): number { return this._actions.length }

    constructor(animator: AnimatorDecorator) { 
        this._animator = animator;
    }

    contains(action: AnimationAction): boolean {
        return this._actions.some(a => a === action);
    }
    
    getByIndex(index: number): AnimationAction {
        return this._actions[index];
    }

    getActionsWithWeight(): AnimationAction[] {
        return this._actions.filter((action) => {
            return action.getEffectiveWeight() > 0;
        });
    }

    tryGet(index: number): AnimationAction {
        if (index >= 0 && index < this._actions.length) {
            return this._actions[index];
        } else {
            return null;
        }
    }

    add(action: AnimationAction): boolean {
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

    remove(action: AnimationAction): boolean {
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

    print(): void {
        if (this._animator.debug) {
            let message: string = `${this._animator.gameObject.name} actions: ${this._actions.length}`;
            for (const action of this._actions) {
                message += `\n  ${action.getClip().name}`;
                message += `\n    effectiveWeight: ${action.getEffectiveWeight()}`;
            }
    
            console.log(message);
        }
    }
}

export interface PlayClipOptions {

    /**
     * Should the clip be set to loop.
     */
    loop?: boolean;

    /** 
     * How quickly to transition to this animation.
     * If this value is 0 or less, then all animations will be stopped before playing the clip.
     */
    transitionDuration?: number;

    /**
     * Time to start playing the clip at in normalized range (0.0 - 1.0).
     */
    normalizedStartTime?: number;
}

export class AnimatorDecorator extends Decorator {

    debug: boolean = false;

    private _mixer: AnimationMixer;
    private _clips: Map<string, AnimationClip> = new Map();
    private _actionTracker = new ActionTracker(this);
    private _timeScale: number = 1.0;
    private _visible: boolean;

    onAnimationLoop: ArgEvent<AnimatorEvent> = new ArgEvent();
    onAnimationFinished: ArgEvent<AnimatorEvent> = new ArgEvent();

    get clips(): AnimationClip[] { return Array.from(this._clips.values()) }
    
    /**
     * The global time scale of the animator.
     */
    get timeScale(): number {
        return this._timeScale;
    }
    set timeScale(value: number) {
        this._timeScale = value;

        if (this._mixer) {
            this._mixer.timeScale = value;
        }
    }
    
    configure(options: IAnimatorDecoratorOptions): void {
        super.configure(options);
        
        if (options.clips) {
            for(const clip of options.clips) {
                this.addClip(clip);
            }
        }
    }

    addClip(clip: AnimationClip): void {
        if (!this._clips.has(clip.name)) {
            this._clips.set(clip.name, clip);
        } else {
            console.error(`Animator already has a clip named ${clip.name} on GameObject ${this.gameObject.name}. All clips on an Animator must have a unique name.`);
        }
    }

    getClip(clipName: string): AnimationClip {
        return this._clips.get(clipName);
    }

    onAttach(gameObject: GameObject): void {
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

    onStart(): void {
        super.onStart();
    }

    play(clipName: string, options?: PlayClipOptions): void {
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
            } else {
                console.log(`${this.gameObject.name} no other actions with weight.`);
            }
        }

        if (actionsWithWeight &&
            actionsWithWeight.length > 0 && 
            options.transitionDuration > 0
        ) {
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
        } else {
            // Stop all current actions.
            this.stopAll();

            action.setEffectiveWeight(1);
        }

        // Set the loop properties.
        if (options.loop) {
            action.setLoop(LoopRepeat, Infinity);
        } else {
            action.setLoop(LoopOnce, 0);
        }

        // Always clamp on the last frame when finished.
        action.clampWhenFinished = true;

        // Change start time if one is provided.
        if (options.normalizedStartTime) {
            options.normalizedStartTime = clamp(options.normalizedStartTime, 0, 1);
            action.time = unnormalize(options.normalizedStartTime, 0, action.getClip().duration);
        }
        
        // Play the action.
        action.play();
        
        this._actionTracker.add(action);
    }

    playAll(): void {
        this.stopAll();

        for (const [clipName, clip] of this._clips) {
            const action = this._mixer.clipAction(clip).reset();
            action.play();

            this._actionTracker.add(action);
        }
    }

    stopAll(): void {
        if (this.debug) {
            console.log(`${this.gameObject.name} stop all ${this._actionTracker.count} actions.`);
        }

        for (let i = this._actionTracker.count - 1; i >= 0; i--) {
            const action = this._actionTracker.getByIndex(i);
            action.stop();
            this._actionTracker.remove(action);
        }
    }

    onUpdate(): void {
        super.onUpdate();

        if (this._visible) {
            this._mixer.update(APEngine.time.deltaTime);
        }
    }

    onLateUpdate(): void {
        super.onLateUpdate();
    }

    private _onActionLoop(e: DispatcherEvent): void {
        const loopEvent = e as ActionLoopEvent;

        if (this.debug) {
            console.log(`${this.gameObject.name} on action ${loopEvent.action.getClip().name} loop`);
        }

        this.onAnimationLoop.invoke({
            clipName: loopEvent.action.getClip().name
        });
    }

    private _onActionFinished(e: DispatcherEvent): void {
        const finishEvent = e as ActionFinishedEvent;

        if (this.debug) {
            console.log(`${this.gameObject.name} on action ${finishEvent.action.getClip().name} finished`);
        }

        this.onAnimationFinished.invoke({
            clipName: finishEvent.action.getClip().name
        });
    }

    private _clipAlreadyPlaying(clip: AnimationClip, loop: AnimationActionLoopStyles): boolean {
        const action = this._mixer.clipAction(clip);
        if (action.isRunning() && action.loop === loop) {
            return true;
        }
        return false;
    }

    onDestroy(): void {
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