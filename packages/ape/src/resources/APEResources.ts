import { ResourceManager } from './ResourceManager';
import { AudioResource } from './AudioResource';
import { GLTFResource } from './GLTFResource';
import { TextureResource } from './TextureResource';
import { ImageResource } from './ImageResource';
import { ResourceProgressMap } from './ResourceProgress';

/**
 * Contains all the core APEngine Resource Managers and related objects.
 */
export namespace APEResources {
    
    export const audio = new ResourceManager(AudioResource);
    export const gltf = new ResourceManager(GLTFResource);
    export const textures = new ResourceManager(TextureResource);
    export const images = new ResourceManager(ImageResource);

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

    export function getProgress(): Readonly<number> {
        const progressMap = new ResourceProgressMap();

        const audioProgress = progressMap.addProgressObject({ id: 'audio', weight: audio.count() });
        audioProgress.value = audio.getLoadProgress();

        const gltfProgress = progressMap.addProgressObject({ id: 'gltf', weight: gltf.count() });
        gltfProgress.value = gltf.getLoadProgress();

        const textureProgress = progressMap.addProgressObject({ id: 'textures', weight: textures.count() });
        textureProgress.value = textures.getLoadProgress();

        const imageProgress = progressMap.addProgressObject({ id: 'images', weight: images.count() });
        imageProgress.value = images.getLoadProgress();

        return progressMap.calculateWeightedMean();
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