# use-viewport-sizes #

tiny React hook which allows you to track visible window viewport size in your components w/ an optional debounce for updates for optimal rendering.

## Installation ##

```
npm install -D use-viewport-sizes
```

## Benefits
- extremely lightweight and dependency-free; **2.8kb pre-gzipped** with all dependencies.
- only one `window.onresize` handler used to subscribe to any changes in an unlimited number of components.
- optional debounce to delay updates until user stops dragging their window for a moment; this can make expensive components with size-dependent calculations run much faster and your app feel smoother.
- debouncing does not create new handlers or waste re-renders in your component; the results are also pooled from only one resize result.

## Usage ##

### **See it in Action** ###
*for an illustration of the concept, check out a CodeSandox* @
[https://codesandbox.io/s/j3vzpqxwww](https://codesandbox.io/s/j3vzpqxwww)

### **Without Debouncing**
*registers dimension changes on every resize event immediately*

```
import useViewportSizes from 'use-viewport-sizes'

function MyComponent (props) {
    const [vpWidth, vpHeight] = useViewportSizes();

    ...renderLogic
}
```


### **With Debouncing**  
*registers dimension changes only when a user stops dragging/resizing the window for a specified number of miliseconds; for expensive components such as data grids which may be too
expensive to re-render during window resize dragging.*
```
import useViewportSizes from 'use-viewport-sizes'

function MyExpensivelyRenderedComponent (props) {
    const [vpWidth, vpHeight] = useViewportSizes(1000); // 1s debounce

    ...renderLogic
}
```

