import { AudioManager, IAudioItemOptions } from "@yeticgi/ape";
export interface IAudioItemEntry {
    name: string;
    url: string;
    options?: IAudioItemOptions;
}
export declare namespace AudioManifest {
    const button: IAudioItemEntry;
    const cubeTap: IAudioItemEntry;
    function addAudioItems(audioManager: AudioManager): void;
}
