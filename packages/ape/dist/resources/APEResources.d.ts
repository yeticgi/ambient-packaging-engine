import { ResourceManager } from './ResourceManager';
import { AudioResource } from './AudioResource';
import { GLTFResource } from './GLTFResource';
import { TextureResource } from './TextureResource';
import { ImageResource } from './ImageResource';
/**
 * Contains all the core APEngine Resource Managers and related objects.
 */
export declare namespace APEResources {
    const audio: ResourceManager<AudioResource>;
    const gltf: ResourceManager<GLTFResource>;
    const textures: ResourceManager<TextureResource>;
    const images: ResourceManager<ImageResource>;
    /**
     * Preload all resource managers.
     */
    function preloadResources(): Promise<void>;
    /**
     * Dispose of all resource managers.
     */
    function diposeAll(): void;
    /**
     * Print out all resource manager load states to the console.
     */
    function printLoadStates(): void;
}
