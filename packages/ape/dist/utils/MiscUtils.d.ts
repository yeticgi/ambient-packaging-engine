export declare function hasValue(obj: any): boolean;
export declare function getOptionalValue(obj: any, defaultValue: any): any;
/**
 * Post the given data object as JSON to the provided URL.
 * @returns - Promise that resolves to a Response or null if an exception occured.
 */
export declare function postJsonData(url: string, data: any): Promise<Response>;
/**
 * Search through element's descendents and return the first child element that contains the given class name(s).
 * An element must contain all of the given class names in order to be matched.
 * @param element The element to search the descendents of.
 * @param className The class name(s) to search for. Can be either a single class name or many.
 */
export declare function getElementByClassName(element: Element, names: string): HTMLElement;
export declare function getFilename(path: string): string | null;
export declare function getExtension(path: string): string | null;
/**
 * Load the image from the given url (or from the cache if the browser as it stored).
 * @param url Location of the image to load.
 */
export declare function loadImage(url: string): Promise<HTMLImageElement>;
export declare function copyToClipboard(text: string): void;
export declare function appendLine(text: string, line: string): string;
