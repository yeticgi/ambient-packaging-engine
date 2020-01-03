import { 
    AudioManager,
    IAudioItemOptions
} from "@yeticgi/ape";

import buttonUrl from '../public/sound/button.mp3';
import cubeTapUrl from '../public/sound/cube_tap.mp3';

export interface IAudioItemEntry {
    name: string,
    url: string,
    options?: IAudioItemOptions
}

export namespace AudioManifest {

    export const button: IAudioItemEntry = {
        name: 'button',
        url: buttonUrl,
    }

    export const cubeTap: IAudioItemEntry = {
        name: 'cubeTap',
        url: cubeTapUrl,
    }

    export function addAudioItems(audioManager: AudioManager) {
        let entries = getItemEntries();
        entries.forEach((entry) => {
            audioManager.addAudioItem(entry.name, entry.url, entry.options);
        });
    }

    function getItemEntries(): IAudioItemEntry[] {
        let entries: IAudioItemEntry[] = [];
        let values = Object.values(AudioManifest);
        values.forEach((value) => {
            let entry = value as IAudioItemEntry;
            if (entry.name && entry.url) {
                entries.push(entry);
            }
        });

        return entries;
    }
}