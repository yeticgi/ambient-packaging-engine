export namespace BuildInfo {
    /**
     * Version number of the app. 
     */
    export const version: string = '__ape-webxr-qa-version__';

    const _time: string = '__ape-webxr-qa-build-time__';

    /**
     * The date that this version of the app was built.
     */
    export function date(): Date {
        const timeNum = parseInt(_time);
        return new Date(timeNum);
    }
}
