/**
 * Returns a promise that waits for the given condition function to return true.
 * If the condition function returns false, it will continue to be called at a regular interval until
 * the condition function returns true.
 * @param condition A function that must return true in order for the promise to resolve.
 * @param timeout An optional timeout value. Must be greater than 0 to be used. If condition is not met before timeout (ms), then the promise is rejected.
 * @param tickRate A optional tick rate value. Must be greater than 0. How frequently the condition function should be called (in ms).
 */
export async function waitForCondition(condition: () => boolean, timeout?: number, tickRate?: number): Promise<void> {
    if (typeof tickRate !== 'number' || tickRate <= 0) {
        tickRate = 30;
    }

    return new Promise<void>((resolve, reject) => {
        let tickTimeoutId: number;
        let timeoutId: number;

        const tick = () => {
            if (condition()) {
                window.clearTimeout(tickTimeoutId);
                window.clearTimeout(timeoutId);
                return resolve();
            } else {
                tickTimeoutId = window.setTimeout(tick, tickRate);
            }
        };

        tick();

        if (typeof timeout === 'number' && timeout > 0) {
            timeoutId = window.setTimeout(() => {
                // Timeout reached before promise was able to resolve.
                window.clearTimeout(tickTimeoutId);
                
                // Check for condition one last time in last ditch effort to resolve.
                if (condition()) {
                    return resolve();
                } else {
                    return reject('Timeout occured before condition could be met.');
                }
            }, timeout);
        }
    });
}

/**
 * Return a promise that waits the given number of seconds before resolving.
 * @param seconds Number of seconds to wait before resolving the promise.
 * @deprecated Use APEngine.time.waitForSeconds instead. This allows the promise to be responsive to pause/timescale.
 */
export async function waitForSeconds(seconds: number): Promise<void> {
    console.warn(`DEPRECATED: Use APEngine.time.waitForSeconds instead. This allows the promise to be responsive to pause/timescale.`)
    if (seconds > 0) {
        return new Promise<void>((resolve, reject) => {
            window.setTimeout(() => {
                return resolve();
            }, (seconds * 1000));
        });
    } else {
        return Promise.resolve();
    }
}