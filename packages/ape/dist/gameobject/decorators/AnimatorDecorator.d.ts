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
    playOnce(clipName: string): void;
    playLoop(clipName: string): void;
    playOnceCrossFade(clipName: string, duration: number): void;
    playLoopCrossFade(clipName: string, duration: number): void;
    stopAll(): void;
    onUpdate(): void;
    onLateUpdate(): void;
    private _onActionLoop;
    private _onActionFinished;
    private _clipAlreadyPlaying;
    onDestroy(): void;
}
export {};
