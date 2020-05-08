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
    debug: boolean = false;

    private _actions: AnimationAction[] = [];

    get count(): number { return this._actions.length }

    contains(action: AnimationAction): boolean {
        return this._actions.some(a => a === action);
    }
    
    getByIndex(index: number): AnimationAction {
        return this._actions[index];
    }

    getActionsWithWeight(): AnimationAction[] {
        return this._actions.filter((action) => {
            return action.weight > 0;
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
            this.print();
        }

        return removed;
    }

    print(): void {
        if (this.debug) {
            let message: string = `actions: ${this._actions.length}`;
            for (const action of this._actions) {
                message += `\n  clipName: ${action.getClip().name}`
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

    private _mixer: AnimationMixer;
    private _clips: Map<string, AnimationClip> = new Map();
    private _actionTracker = new ActionTracker();
    private _timeScale: number = 1.0;

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
    }

    onInvisible() {
        super.onInvisible();
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

        // Get action for clip.
        const action = this._mixer.clipAction(clip).reset();

        const actionsWithWeight = this._actionTracker.getActionsWithWeight();
        if (actionsWithWeight.length > 0 && 
            this._actionTracker.count > 0 &&
            options.transitionDuration > 0
        ) {
            // Fade out all other clips that currently have weight values above 0.
            for (let i = 0; i < actionsWithWeight.length; i++) {
                actionsWithWeight[i].fadeOut(options.transitionDuration);
            }

            // Fade in the new action.
            action.fadeIn(options.transitionDuration);
        } else {
            // Stop all current actions.
            this.stopAll();

            action.weight = 1.0;
        }

        // Set the loop properties.
        if (options.loop) {
            action.setLoop(LoopRepeat, Infinity);
        } else {
            action.setLoop(LoopOnce, 0);
        }

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

    stopAll(): void {
        for (let i = 0; i < this._actionTracker.count; i++) {
            const action = this._actionTracker.getByIndex(i);
            action.stop();
            this._actionTracker.remove(action);
        }
    }

    onUpdate(): void {
        super.onUpdate();

        this._mixer.update(APEngine.time.deltaTime);
    }

    onLateUpdate(): void {
        super.onLateUpdate();
    }

    private _onActionLoop(e: DispatcherEvent): void {
        const loopEvent = e as ActionLoopEvent;

        this.onAnimationLoop.invoke({
            clipName: loopEvent.action.getClip().name
        });
    }

    private _onActionFinished(e: DispatcherEvent): void {
        const finishEvent = e as ActionFinishedEvent;

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