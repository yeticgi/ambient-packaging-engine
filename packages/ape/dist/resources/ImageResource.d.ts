import { Resource } from "./Resource";
export interface IImageConfig {
    url: string;
}
export declare class ImageResource extends Resource<HTMLImageElement> {
    private _url;
    constructor(name: string, config: unknown);
    protected _loadObject(): Promise<HTMLImageElement>;
    protected _unloadObject(): void;
}
