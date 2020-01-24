import { ResourceManager } from '../resources/ResourceManager';
import { AudioResource } from '../resources/AudioResource';
import { GLTFResource } from '../resources/GLTFResource';
import { TextureResource } from '../resources/TextureResource';

export interface IManifestFiles{
    audioUrl?: string;
    gltfUrl?: string;
    textureUrl?: string;
}

/**
 * Contains all the core APEngine Resource Managers and related objects.
 */
export namespace APEResources {

    const audioManager = new ResourceManager(AudioResource);
    const gltfManager = new ResourceManager(GLTFResource);
    const textureManager = new ResourceManager(TextureResource);
    
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
    }

    /**
     * Preload all resource managers.
     */
    export async function preloadResources(): Promise<void> {
        await audioManager.preloadResources();
        await gltfManager.preloadResources();
        await textureManager.preloadResources();
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

    /**
     * Dispose of all resource managers.
     */
    export function dispose(): void {
        audioManager.dispose();
        gltfManager.dispose();
        textureManager.dispose();
    }
}