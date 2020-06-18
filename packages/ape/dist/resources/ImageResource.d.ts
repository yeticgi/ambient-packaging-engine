import { Resource } from "./Resource";
export interface IImageConfig {
    url: string;
}
export declare class ImageResource extends Resource<HTMLImageElement, IImageConfig> {
    private _url;
    constructor(name: string, config: IImageConfig);
    protected _loadObject(): Promise<HTMLImageElement>;
    protected _unloadObject(): void;
}
