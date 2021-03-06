# viewprt [![Build Status](https://travis-ci.org/gdub22/viewprt.svg)](https://travis-ci.org/gdub22/viewprt)

A tiny, high performance viewport position & intersection obsevation tool.  You can watch when elements enter & exit the viewport, or when the viewport itself is at the bottom or top.  Use this as a building block for things such as lazy loaders, infinite scrollers, etc.

#### [Demo](https://rawgit.com/gdub22/viewprt/master/demos/index.html)  
#### [Dist](https://unpkg.com/viewprt/dist/)

### Install
```bash
yarn add viewprt
```

### API
Create new observers and any time its container is scrolled, resized, or mutated, the appropriate callbacks will be triggered when the condition is met.

```js
import { PositionObserver, ElementObserver } from 'viewprt'

const element = document.getElementById('element')

// Observe when an element enters and exits the viewport:
const elementObserver = ElementObserver(element, {
  // options (defaults)
  container: document.body, // the viewport container element
  offset: 0,                // offset from the edge of the viewport in pixels
  once: false,              // if true, observer is detroyed after first callback is triggered
  onEnter (element) {},     // callback when the element enters the viewport
  onExit (element) {}       // callback when the element exits the viewport
})

// Observe when the viewport reaches its bounds:
const positionObserver = PositionObserver({
  // options (defaults)
  container: document.body, // the viewport container element
  offset: 0,                // offset from the edge of the viewport in pixels
  once: false,              // if true, observer is detroyed after first callback is triggered
  onBottom (container) {},  // callback when the viewport reaches the bottom
  onTop (container) {}      // callback when the viewport reaches the top
})

// Stop observing:
positionObserver.destroy()
elementObserver.destroy() // This happens automatically if the element is removed from DOM

// Start observing again:
positionObserver.activate()
elementObserver.activate()
```

## Build
```bash
yarn build
```

## Test
```bash
yarn test
```
