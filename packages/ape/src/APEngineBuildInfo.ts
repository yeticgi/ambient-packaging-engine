export namespace APEngineBuildInfo {
    /**
     * Version number of the app. 
     */
    export const version: string = '__ape_version__';

    const _time: string = '__ape-build-time__';

    /**
     * The date that this version of the app was built.
     */
    export function date(): Date {
        const timeNum = parseInt(_time);
        return new Date(timeNum);
    }
}
