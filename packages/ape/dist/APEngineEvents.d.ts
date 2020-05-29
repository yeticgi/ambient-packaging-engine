import { Event, ArgEvent } from './misc/Events';
export declare namespace APEngineEvents {
    const onUpdate: Event;
    const onLateUpdate: Event;
    const onResize: Event;
    const onXRSessionStarted: Event;
    const onXRSessionEnded: Event;
    const onVisibilityChanged: ArgEvent<boolean>;
}
