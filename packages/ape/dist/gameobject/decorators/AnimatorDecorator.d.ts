import { AnimationClip } from 'three';
import { IDecoratorOptions, Decorator } from './Decorator';
import { GameObject } from '../GameObject';
import { ArgEvent } from '../../misc/Events';
export interface IAnimatorDecoratorOptions extends IDecoratorOptions {
    clips?: AnimationClip[];
}
interface AnimatorEvent {
    clipName: string;
}
export interface PlayClipOptions {
    /**
     * Should the clip be set to loop.
     */
    loop?: boolean;
    /**
     * Should the animation clamp to the pose of the last frame when finished?
     */
    clampWhenFinished?: boolean;
    /**
     * How long a crossfade should take (in seconds) if there is an animation currently playing.
     * If this value is 0 or less, then all animations will be stopped before playing the clip.
     */
    crossFadeDuration?: number;
    /**
     * If true, additional warping (gradually changes of the time scales) will be applied.
     */
    crossFadeWarping?: boolean;
    /**
     * Time to start playing the clip at in normalized range (0.0 - 1.0).
     */
    normalizedStartTime?: number;
}
export declare class AnimatorDecorator extends Decorator {
    private _mixer;
    private _clips;
    private _activeActionTracker;
    onAnimationLoop: ArgEvent<AnimatorEvent>;
    onAnimationFinished: ArgEvent<AnimatorEvent>;
    get clips(): AnimationClip[];
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
export {};
