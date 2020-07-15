import { ResourceManager } from './ResourceManager';
import { AudioResource } from './AudioResource';
import { GLTFResource } from './GLTFResource';
import { TextureResource } from './TextureResource';
import { ImageResource } from './ImageResource';
import { Progress } from './Progress';

/**
 * Contains all the core APEngine Resource Managers and related objects.
 */
export namespace APEResources {
    
    export const audio = new ResourceManager(AudioResource);
    export const gltf = new ResourceManager(GLTFResource);
    export const textures = new ResourceManager(TextureResource);
    export const images = new ResourceManager(ImageResource);

    var _progress = new Progress();

    /**
     * Preload all resource managers.
     */
    export async function preloadResources(): Promise<void> {
        await Promise.all([
            audio.preload(),
            gltf.preload(),
            textures.preload(),
            images.preload()
        ]);
    }

    export function getLoadProgress(): Readonly<Progress> {
        _progress.set(0, 0);

        const managers = [audio, gltf, textures, images];

        for (const manager of managers) {
            const managerProgress = manager.getLoadProgress();
            _progress.loaded += managerProgress.loaded;
            _progress.total += managerProgress.total;
        }

        return _progress;
    }

    /**
     * Dispose of all resource managers.
     */
    export function diposeAll(): void {
        audio.dispose();
        gltf.dispose();
        textures.dispose();
        images.dispose();
    }

    /**
     * Print out all resource manager load states to the console.
     */
    export function printLoadStates(): void {
        console.groupCollapsed(`[APEResource] Resource Manager Load States`);
        console.log('Audio');
        console.log(audio.loadState());
        console.log('GLTF');
        console.log(gltf.loadState());
        console.log('Textures');
        console.log(textures.loadState());
        console.log('Images');
        console.log(images.loadState());
        console.groupEnd();
    }
}