
import { IDisposable } from '../misc/IDisposable';
import { waitForCondition, waitForSeconds } from '../utils/WaitPromises';

export interface IVideoStreamStartResult {
    started: boolean;
    error?: any;
}

/**
 * Device Camera is a class that wraps modern rowser functionality to interact with device camera hardware.
 */
export class DeviceCamera implements IDisposable {
    
    constraints: MediaStreamConstraints;

    private _video: HTMLVideoElement = null;
    private _stream: MediaStream = null;
    private _playing: boolean = false;

    constructor(constraints?: MediaStreamConstraints) {
        this.constraints = constraints;
    }

    /**
     * Is the device camera stream currently playing or not.
     */
    isPlaying(): boolean {
        return this._playing;
    }

    /**
     * The video element that is playing the device camera feed.
     */
    getVideoElement(): HTMLVideoElement {
        return this._video;
    }

    /**
     * Request to start device camera video stream. Promise will return true if successful, otherwise false.
     * Uses the DeviceCamera.constraints object when requesting the camera from the browser.
     * 
     * May provide a timeout value in milliseconds.
     */
    async startVideoStream(timeout?: number): Promise<IVideoStreamStartResult> {
        if (this._video) {
            return {
                started: true
            }
        }

        try {
            this._stream = await navigator.mediaDevices.getUserMedia(this.constraints);
        } catch (error) {
            return {
                started: false,
                error: error
            }
        }

        this._video = document.createElement('video');
        this._video.srcObject = this._stream;
        // this._video.setAttribute('autoplay', 'false');
        this._video.setAttribute('playsinline', 'true');
        this._video.play();

        if (typeof timeout === 'number') {
            if (timeout <= 0) {
                timeout = 6000;
            }
        }

        
        try {
            await waitForCondition(() => {
                if (this._video) {
                    return this._video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA;
                }
            }, timeout);

            this._playing = true;
            return {
                started: true
            }
        } catch (error) {
            this.stopVideoStream();
            this._playing = false;
            return {
                started: false,
                error: error
            }
        }
    }

    /**
     * Stop running video streams and clean up related objects.
     */
    stopVideoStream(): void {
        if (this._video) {
            this._video = null;
        }

        if (this._stream) {
            const tracks = this._stream.getTracks()
            for (let track of tracks) {
                track.stop();
            }

            this._stream = null;
        }

        this._playing = false;
    }

    dispose(): void {
        this.stopVideoStream();
    }
}