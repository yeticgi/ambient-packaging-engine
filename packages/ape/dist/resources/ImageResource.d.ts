import { Resource } from "./Resource";
export interface IImageConfig {
    url: string;
}
export declare class ImageResource extends Resource<string> {
    private _url;
    constructor(name: string, config: unknown);
    protected _loadObject(): Promise<string>;
    protected _unloadObject(): void;
}
