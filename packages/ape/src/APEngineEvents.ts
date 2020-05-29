import { Event, ArgEvent } from './misc/Events';

export namespace APEngineEvents {
    export const onUpdate: Event = new Event();
    export const onLateUpdate: Event = new Event();
    export const onResize: Event = new Event();
    export const onXRSessionStarted: Event = new Event();
    export const onXRSessionEnded: Event = new Event();
    export const onVisibilityChanged: ArgEvent<boolean> = new ArgEvent();
}