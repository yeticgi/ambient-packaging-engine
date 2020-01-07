# APE WebXR QA Builds

## v0.0.1
[APE WebXR QA - Build v0.0.1](./ape-webxr-qa/0-0-1/index.html)

### Notes

This is the first build of the **Ambient Packaging Engine - WebXR Quality Assurance** (APE WebXR QA) app.

The purpose of this app is to help in testing the key components of the Ambient Packaging Engine across different devices and browsers.

The following are the key components of APE WebXR QA v0.0.1:  

- HTML Front End (via [React](https://reactjs.org/))
- WebGL rendering of 3d scenes (via [three](https://threejs.org/)).
- Augmented Reality (via [WebXR](https://immersive-web.github.io/webxr/))
- Sound playback (via [howler](https://howlerjs.com/))

### How to Use

1. Click on the build link above to load up the specified APE WebXR QA build.
2. You should see 3 rotating cubes (red, green, and blue).
3. There a few user interface components here driven by React that should also be rendered:
   - The 3d scene is being drawn onto a canvas being rendered by React.
   - In the upper right corner of the screen is a Pause button rendered by React.
   - In the upper left corner of the screen is some version info rendered by React.
4. Tapping on a rotating cube should play a sound effect and toggle its rotation on/off.
5. Tapping the Pause button should toggle time. So if the cubes were rotating, they should stop while paused.
6. Pause button should now be the Resume button. Pressing the Resume button should turn time back on.
7. A WebXR button should be visible at the bottom center of the screen that can be in a few different states:
   1. If the browser does not support AR it should say: `WEBXR NOT AVAILABLE` or `AR NOT SUPPORTED`
   2. If the device supports AR and the browser supports the WebXR API it should say `START AR`. 
        > **NOTE:**  
         Be sure to [read the section]((#browser-webxr-support)) about browser WebXR support. WebXR has only recently been standardized and support is just starting to come online.
8. Pressing the WebXR button when it says `START AR` should ask you permission to start AR and then put the device into Immersive AR mode.
9.  Once you have the camera feed, move the device around until a white donut shaped reticule appears on detected planar surfaces.
10. Tapping on the screen once the white reticule is visible will place the red, green, and blue cubes at the location of the reticule.
11. You should be able to exit AR mode by using your devices back button.

### Browser WebXR Support

As of writing, the only browser to officially support the WebXR API is Chrome 79+.  
However, even Chrome 79+ needs some flags enabled manually in order to support the full feature set of WebXR Augmented Reality.

1. In your Chrome browser go to: `chrome://flags`
2. Type `webxr` into the search bar on this page.
3. If the device's Chrome browser supports the WebXR API there should be a number of available flags visible. Find the following flags and set them to `Enabled`:
   - WebXR Device API
   - WebXR AR Module
   - WebXR Hit Test
   - WebXR Plane Detection
4. Chrome will probably ask you to relaunch all the tabs after turning on all of these flags. Do so so that these new settigns get loaded properly.