/**
 * Returns a promise that waits for the given condition function to return true.
 * If the condition function returns false, it will continue to be called at a regular interval until
 * the condition function returns true.
 * @param condition A function that must return true in order for the promise to resolve.
 * @param timeout An optional timeout value. Must be greater than 0. If condition is not met before timeout (ms), then the promise is rejected. Will default to 10 seconds (10000ms) by default. If you want a different timeout, you must provide a value.
 * @param tickRate A optiona tick rate value. Must be greater than 0. How frequently the condition function should be called (in ms).
 */
export declare function waitForCondition(condition: () => boolean, timeout?: number, tickRate?: number): Promise<void>;
/**
 * Return a promise that waits the given number of seconds before resolving.
 * @param seconds Number of seconds to wait before resolving the promise.
 */
export declare function waitForSeconds(seconds: number): Promise<void>;
