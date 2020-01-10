
import { IDisposable } from './IDisposable';
import { waitForCondition } from '../Utils';

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
     */
    async startVideoStream(): Promise<boolean> {
        if (this._video) {
            return true;
        }

        try {
            this._stream = await navigator.mediaDevices.getUserMedia(this.constraints);
        } catch (error) {
            console.error(`[DeviceCamera] Could not start video stream. error: ${error}`);
            return false;
        }

        this._video = document.createElement('video');
        this._video.srcObject = this._stream;
        this._video.setAttribute('playinline', 'true'); // Required to tell iOS safari we don't want fullscreen.
        this._video.play();
        
        try {
            await waitForCondition(() => {
                if (this._video) {
                    return this._video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA;
                }
            }, 2000);

            this._playing = true;
            return true;
        } catch (error) {
            console.error(error);
            this.stopVideoStream();
            this._playing = false;
            return false;
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