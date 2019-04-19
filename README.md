# use-viewport-sizes #

A tiny React hook which allows you to track visible window/document area in your components w/ an optional debounce for updates to give the most optimal experience for components with expensive renders.

## Installation ##

```
npm install -D use-viewport-sizes
```

## Benefits
- extremely lightweight and dependency-free; **2.8kb pre-gzipped** with all dependencies.
- only one `window.onresize` handler used to subscribe to any changes in an unlimited number of components.
- optional debounce to delay updates until user stops dragging their window for a moment; this can make expensive components with size-dependent calculations run much faster and your app feel smoother.
- debouncing does not create new handlers; the results are pooled from only one result.

## Usage ##

### See it in Action ###
For an illustration of the concept, check out a CodeSandox:
[https://codesandbox.io/s/j3vzpqxwww](https://codesandbox.io/s/j3vzpqxwww)

### Without Debouncing 
*(e.g. register every resize event immediately)*

```
import useViewportSizes from 'use-viewport-sizes'

function MyComponent () {
    const [vpWidth, vpHeight] = useViewportSizes();
}
```


### With Debouncing  
*for expensive components such as data grids which may be too
expensive to re-render during window resize dragging.*
```
import useViewportSizes from 'use-viewport-sizes'

function MyExpensiveComponent () {
    const [vpWidth, vpHeight] = useViewportSizes(1000); // 1s debounce
}
```

