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
import { IDisposable } from '../../misc/IDisposable';

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

interface AnimatorEvent {
    clipName: string;
}

class ActionTracker {
    debug: boolean = false;

    private _actions: AnimationAction[] = [];

    get count(): number { return this._actions.length }

    contains(action: AnimationAction): boolean {
        return this._actions.some(a => a === action);
    }
    
    get(index: number): AnimationAction {
        return this._actions[index];
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

export class AnimatorDecorator extends Decorator {

    private _mixer: AnimationMixer;
    private _clips: Map<string, AnimationClip> = new Map();
    private _activeActionTracker = new ActionTracker();

    onAnimationLoop: ArgEvent<AnimatorEvent> = new ArgEvent();
    onAnimationFinished: ArgEvent<AnimatorEvent> = new ArgEvent();

    get clips(): AnimationClip[] { return Array.from(this._clips.values()) }
    
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
            console.error(`Animator already has a clip named ${clip.name}. All clips on an Animator must have a unique name.`);
        }
    }

    onAttach(gameObject: GameObject): void {
        super.onAttach(gameObject);

        this._onActionLoop = this._onActionLoop.bind(this);
        this._onActionFinished = this._onActionFinished.bind(this);

        this._mixer = new AnimationMixer(this.gameObject);
        this._mixer.addEventListener('loop', this._onActionLoop);
        this._mixer.addEventListener('finished', this._onActionFinished);
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

    playOnce(clipName: string): void {
        const clip = this._clips.get(clipName);
        if (!clip) {
            console.error(`There is no clip named ${clip} on the Animator ${this.gameObject.name}`);
            return;
        }
        if (this._clipAlreadyPlaying(clip, LoopOnce)) {
            // There is already an action that is playing the clip.
            return;
        }

        this.stopAll();

        const action = this._mixer.clipAction(clip).reset().setLoop(LoopOnce, 0).play();
        action.clampWhenFinished = true;
        this._activeActionTracker.add(action);
    }

    playLoop(clipName: string): void {
        const clip = this._clips.get(clipName);
        if (!clip) {
            console.error(`There is no clip named ${clip} on the Animator ${this.gameObject.name}`);
            return;
        }
        if (this._clipAlreadyPlaying(clip, LoopRepeat)) {
            // There is already an action that is playing the clip.
            return;
        }

        this.stopAll();
        
        const action = this._mixer.clipAction(clip).reset().setLoop(LoopRepeat, Infinity).play();
        this._activeActionTracker.add(action);
    }

    playOnceCrossFade(clipName: string, duration: number): void {
        const clip = this._clips.get(clipName);
        if (!clip) {
            console.error(`There is no clip named ${clip} on the Animator ${this.gameObject.name}`);
            return;
        }
        if (this._clipAlreadyPlaying(clip, LoopOnce)) {
            // There is already an action that is playing the clip.
            return;
        }

        // Get the action we are going to crossfade from.
        const fromAction: AnimationAction = this._activeActionTracker.tryGet(0);

        if (fromAction) {
            // From action is no longer considered active by Animator as it is being faded out.
            this._activeActionTracker.remove(fromAction);
            
            const action = this._mixer.clipAction(clip).reset();
            action.crossFadeFrom(fromAction, duration, false).setLoop(LoopOnce, 0).play();
            action.clampWhenFinished = true;
            this._activeActionTracker.add(action);
        } else {
            // No animation to crossfade from, do a normal play once.
            this.playOnce(clipName);
        }
    }

    playLoopCrossFade(clipName: string, duration: number): void {
        const clip = this._clips.get(clipName);
        if (!clip) {
            console.error(`There is no clip named ${clip} on the Animator ${this.gameObject.name}`);
            return;
        }
        if (this._clipAlreadyPlaying(clip, LoopRepeat)) {
            // There is already an action that is playing the clip.
            return;
        }

        // Get the action we are going to crossfade from.
        const fromAction: AnimationAction = this._activeActionTracker.tryGet(0);

        if (fromAction) {
            // From action is no longer considered active by Animator as it is being faded out.
            this._activeActionTracker.remove(fromAction);

            const action = this._mixer.clipAction(clip).reset();
            action.crossFadeFrom(fromAction, duration, false).setLoop(LoopRepeat, Infinity).play();
            this._activeActionTracker.add(action);
        } else {
            // No animation to crossfade from, do a normal play loop.
            this.playLoop(clipName);
        }
    }

    stopAll(): void {
        for (let i = 0; i < this._activeActionTracker.count; i++) {
            const action = this._activeActionTracker.get(i);
            action.stop();
            this._activeActionTracker.remove(action);
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

        this._activeActionTracker.remove(finishEvent.action);

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