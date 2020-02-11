import { ResourceManager } from './ResourceManager';
import { AudioResource, IAudioConfig } from './AudioResource';
import { GLTFResource, IGLTFConfig } from './GLTFResource';
import { TextureResource, ITextureConfig } from './TextureResource';
import { ImageResource, IImageConfig } from './ImageResource';

/**
 * Contains all the core APEngine Resource Managers and related objects.
 */
export namespace APEResources {

    const audioManager = new ResourceManager(AudioResource);
    const gltfManager = new ResourceManager(GLTFResource);
    const textureManager = new ResourceManager(TextureResource);
    const imageManager = new ResourceManager(ImageResource);

    /**
     * Preload all resource managers.
     */
    export async function preloadResources(): Promise<void> {
        await audioManager.preloadResources();
        await gltfManager.preloadResources();
        await textureManager.preloadResources();
        await imageManager.preloadResources();
    }

    export function addAudio(name: string, config: IAudioConfig): void {
        audioManager.addResource(name, config);
    }

    export async function getAudio(name: string): Promise<AudioResource> {
        return audioManager.getResource(name);
    }

    export function addGLTF(name: string, config: IGLTFConfig): void {
        gltfManager.addResource(name, config);
    }

    export async function getGLTF(name: string): Promise<GLTFResource> {
        return gltfManager.getResource(name);
    }

    export function addTexture(name: string, config: ITextureConfig): void {
        textureManager.addResource(name, config);
    }

    export async function getTexture(name: string): Promise<TextureResource> {
        return textureManager.getResource(name);
    }

    export function addImage(name: string, config: IImageConfig): void {
        imageManager.addResource(name, config);
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