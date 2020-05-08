import { AnimationClip } from 'three';
import { IDecoratorOptions, Decorator } from './Decorator';
import { GameObject } from '../GameObject';
import { ArgEvent } from '../../misc/Events';
export interface IAnimatorDecoratorOptions extends IDecoratorOptions {
    clips?: AnimationClip[];
}
export interface AnimatorEvent {
    clipName: string;
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
export declare class AnimatorDecorator extends Decorator {
    private _mixer;
    private _clips;
    private _actionTracker;
    private _timeScale;
    onAnimationLoop: ArgEvent<AnimatorEvent>;
    onAnimationFinished: ArgEvent<AnimatorEvent>;
    get clips(): AnimationClip[];
    /**
     * The global time scale of the animator.
     */
    get timeScale(): number;
    set timeScale(value: number);
    configure(options: IAnimatorDecoratorOptions): void;
    addClip(clip: AnimationClip): void;
    onAttach(gameObject: GameObject): void;
    onVisible(): void;
    onInvisible(): void;
    onStart(): void;
    play(clipName: string, options?: PlayClipOptions): void;
    stopAll(): void;
    onUpdate(): void;
    onLateUpdate(): void;
    private _onActionLoop;
    private _onActionFinished;
    private _clipAlreadyPlaying;
    onDestroy(): void;
}
