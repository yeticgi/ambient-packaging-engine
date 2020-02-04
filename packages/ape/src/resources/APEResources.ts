import { ResourceManager } from './ResourceManager';
import { AudioResource } from './AudioResource';
import { GLTFResource } from './GLTFResource';
import { TextureResource } from './TextureResource';
import { ImageResource } from './ImageResource';

export interface IManifestFiles{
    audioUrl?: string;
    gltfUrl?: string;
    textureUrl?: string;
    imageUrl?: string;
}

/**
 * Contains all the core APEngine Resource Managers and related objects.
 */
export namespace APEResources {

    const audioManager = new ResourceManager(AudioResource);
    const gltfManager = new ResourceManager(GLTFResource);
    const textureManager = new ResourceManager(TextureResource);
    const imageManager = new ResourceManager(ImageResource);
    
    /**
     * Add resources from the given manifest files.
     */
    export async function addResourcesFromManifest(manifestFiles: IManifestFiles) {
        if (manifestFiles.audioUrl) {
            await audioManager.addResourcesFromManifest(manifestFiles.audioUrl);
        }
        if (manifestFiles.gltfUrl) {
            await gltfManager.addResourcesFromManifest(manifestFiles.gltfUrl);
        }
        if (manifestFiles.textureUrl) {
            await textureManager.addResourcesFromManifest(manifestFiles.textureUrl);
        }
        if (manifestFiles.imageUrl) {
            await imageManager.addResourcesFromManifest(manifestFiles.imageUrl);
        }
    }

    /**
     * Preload all resource managers.
     */
    export async function preloadResources(): Promise<void> {
        await audioManager.preloadResources();
        await gltfManager.preloadResources();
        await textureManager.preloadResources();
        await imageManager.preloadResources();
    }

    export async function getAudio(name: string): Promise<AudioResource> {
        return audioManager.getResource(name);
    }

    export async function getGLTF(name: string): Promise<GLTFResource> {
        return gltfManager.getResource(name);
    }

    export async function getTexture(name: string): Promise<TextureResource> {
        return textureManager.getResource(name);
    }

    export async function getImage(name: string): Promise<ImageResource> {
        return imageManager.getResource(name);
    }

    /**
     * Dispose of all resource managers.
     */
    export function dispose(): void {
        audioManager.dispose();
        gltfManager.dispose();
        textureManager.dispose();
        imageManager.dispose();
    }
}