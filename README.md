# use-viewport-sizes #

[![npm](https://img.shields.io/npm/v/use-viewport-sizes.svg?color=blue)](https://www.npmjs.com/package/use-viewport-sizes) [![npm](https://img.shields.io/npm/dw/use-viewport-sizes.svg?color=red)]() [![GitHub issues](https://img.shields.io/github/issues-raw/rob2d/use-viewport-sizes.svg)](https://github.com/rob2d/use-viewport-sizes/issues) 
![Github Workflow Status](https://github.com/rob2d/use-viewport-sizes/actions/workflows/node.js.yml/badge.svg)
[![NPM](https://img.shields.io/npm/l/use-viewport-sizes.svg)](https://github.com/rob2d/use-viewport-sizes/blob/master/LICENSE)

A lightweight, TypeScript-compatible React hook for tracking viewport sizes in your components. Includes optional debounce, throttle, and custom memoization for optimized rendering.

## Table of Contents
- [Installation](#installation)
- [Benefits](#benefits)
- [Usage](#usage)
  - [Basic Use-case](#basic-use-case)
  - [Measure/Update only on one dimension](#measureupdate-only-on-one-dimension)
  - [With Throttling](#with-throttling)
  - [With Debouncing](#with-debouncing)
  - [Only update vpW/vpH passed on specific conditions](#only-update-vpwvph-passed-on-specific-conditions)
- [Support](#support)
- [License](#license)

## Installation ##

```
npm install -D use-viewport-sizes
```

## Benefits ##
- extremely lightweight and zero dependencies -- adds **2.38kb** pre gzip, and **1.09kb** after gzip.
- only one `window.onresize` handler used to subscribe to any changes in an unlimited number of components no matter the use-cases.
- optional debounce to delay updates until user stops dragging their window for a moment; this can make expensive components with size-dependent calculations run much faster and your app feel smoother.
- debouncing does not create new handlers or waste re-renders in your component; the results are also pooled from only one resize result.
- optional hash function to update component subtree only at points you would like to.
- supports lazy loaded components and SSR out of the box.
- compatible with React v16 | v17 | v18 | v19


## Usage ##

### **See it in Action** ###

<center>
<img src="./doc/use-viewport-sizes.gif" />

[CodeSandbox IDE](https://codesandbox.io/s/react-hooks-viewport-sizes-demo-forked-i8urr)

</center>

### **Basic Use-case**
*registers dimension changes on every resize event immediately*

```js
import useViewportSizes from 'use-viewport-sizes'

function MyComponent(props) {
  const [vpWidth, vpHeight] = useViewportSizes();

  // ...renderLogic
}
```

### **Measure/Update only on one dimension**

If passed `options.dimension` as `w` or `h`, only the viewport width or height will be
measured and observed for updates.
The only dimension returned in the return array value will be the width or height, according
to what was passed.

```js
import useViewportSizes from 'use-viewport-sizes';

function MyComponent(props) {
  const [vpHeight] = useViewportSizes({ dimension: 'h' });

  // ...renderLogic
}
```

### **With Throttling**

If passed `options.throttleTimeout`, or options are entered as a `Number`, dimension changes
are registered on a throttled basis e.g. with a maximum frequency.

This is useful for listening to expensive components such as data grids which may be too
expensive to re-render during window resize dragging.

```js
import useViewportSizes from 'use-viewport-sizes';

function MyExpensivelyRenderedComponent(props) {
  // throttled by 1s between updates
  const [vpWidth, vpHeight] = useViewportSizes({ throttleTimeout: 1000 }); 

  // ...renderLogic
}
```

### **With Debouncing**

If passed `options.debounceTimeout`, dimension changes are registered only when a user stops dragging/resizing the window for a specified number of miliseconds. This is an alternative behavior to `throttleTimeout` where it may be less
important to update viewport the entire way that a user is resizing.

```js
import useViewportSizes from 'use-viewport-sizes';

function MyExpensivelyRenderedComponent(props) {
  // debounced by 1s between updates
  const [vpWidth, vpHeight] = useViewportSizes({ debounceTimeout: 1000 });

  // ...renderLogic
}
```

### **Only update vpW/vpH passed on specific conditions**
If passed an `options.hasher` function, this will be used to calculate a hash that only updates the viewport when the calculation changes. In the example here, we are using it to detect when we have a breakpoint change which may change how a component is rendered if this is not fully possible or inconvenient via CSS `@media` queries. The hash will also be available as the 3rd value returned from the hook for convenience.

```js
import useViewportSizes from 'use-viewport-sizes';

function getBreakpointHash({ vpW, vpH }) {
  if(vpW <= 240) { return 'xs' }
  if(vpW <= 320) { return 'sm' }
  else if(vpW <= 640) { return 'md' }
  return 'lg';
}

function MyBreakpointBehaviorComponent() {
  const [vpW, vpH] = useViewportSizes({ hasher: getBreakpointHash });

  // do-something in render and add new update for vpW, 
  // vpH in this component's subtree only when a breakpoint
  // hash updates
}
```

## Support
If you find any issues or would like to request something changed, please feel free to [post an issue on Github](https://github.com/rob2d/use-viewport-sizes/issues/new).

Otherwise, if this was useful and you'd like to show your support, no donations necessary, but please consider [checking out the repo](https://github.com/rob2d/use-viewport-sizes) and giving it a star (⭐).

## License ##

Open Source **[MIT license](http://opensource.org/licenses/mit-license.php)**
