# APE - Ambient Packaging Engine

This is the monorepo for the Ambient Packaging Engine (APE).
APE is a web engine for creating ambient packaging experiences and any other type of 3d web experiences.

In general, APE is a loose set of tools built on top of [three.js](https://github.com/mrdoob/three.js/) that provide a more game engine like experience. This includes built-in time tracking, gameobject and decorator system, scene and rendering management, resource management, input polling, audio playback, webxr integration, etc.


## ape

This is the core package of the the Ambient Packaging Engine. If all you want is to use APE as a starting framework this is the only package you need to get started with no string attached.

Checkout the [README for APE](./packages/ape/README.md) for more usage information.

## ape-webxr-qa

This package is an example/demo project that uses both APE and the APE React Components to setup a barebones interactive WebGL scene that supports WebXR. This project is a good starting point to see how you can setup and use the different built-in tools of APE.

## [DEPRECATED] ape-reactcomponents

This package contains a number of [React JS](https://reactjs.org/) components that can be used to get up and running easily with APE in a React environment.
