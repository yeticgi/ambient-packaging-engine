# APE - Ambient Packaging Engine

APE is a web engine for creating ambient packaging experiences and any other type of 3d web experiences.

In general, APE is a loose set of tools built on top of [three.js](https://github.com/mrdoob/three.js/) that provide a more game engine like experience. This includes built-in time tracking, gameobject and decorator system, scene and rendering management, resource management, input polling, audio playback, webxr integration, etc.

## Installation

```
npm install @yeti-cgi/ape
```

## Usage

### Setup

```typescript
import { APEngine, APEngineEvents } from '@yeti-cgi/ape';

// Initialize APEngine.
APEngine.init({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    // Any desired three.js WebGLRenderer options...
});

APEngineEvents.onUpdate.addListener(onEngineUpdate);

function onEngineUpdate(): void {
    // Do update loop stuff...
}
```

### Scene Management

...TODO

### Time

...TODO

### GameObjects & Decorators

...TODO

### Input

...TODO

### Resource Management

...TODO

### WebXR

...TODO

### Device Camera

...TODO

## Packages

### ape

This is the core package of the the Ambient Packaging Engine. If all you want is to use APE as a starting framework this is the only package you need to get started with no string attached.

### ape-webxr-qa

This package is an example/demo project that uses both APE and the APE React Components to setup a barebones interactive WebGL scene that supports WebXR. This project is a good starting point to see how you can setup and use the different built-in tools of APE.

### [DEPRECATED] ape-reactcomponents

This package contains a number of [React JS](https://reactjs.org/) components that can be used to get up and running easily with APE in a React environment.
