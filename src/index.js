import { useState, useRef, useLayoutEffect, useCallback, useMemo } from 'react';

function getVpWidth () {
    return (typeof window != 'undefined') ? Math.max(
        window.document.documentElement.clientWidth,
        window.innerWidth || 0
      ) : 0;
}


function getVpHeight () {
    return (typeof window != 'undefined') ? Math.max(
        window.document.documentElement.clientHeight,
        window.innerHeight || 0
    ) : 0;
}

// =============== //
//  Shared State   //
// =============== //

// NOTE: using vars and separating since Babel
// transpilation saves a bit of filesize here

/**
 * listening component functions
 *
 * @type Function
 */
var listeners = new Set();

/**
 * contains a "hasher" which manages the behavior
 * of the listeners when applicable;
 * keys in the map are the direct listener reference
 * for minimum overhead and so we can reference
 * it easily on deletion
 *
 * @type Map<Object, {{ hasher: Function, prevHash: Any  }}>
 */
var resolverMap = new Map();

var vpWidth = getVpWidth();
var vpHeight = getVpHeight();

// should only be called by *one* component once;
// will iterate through all subscribers
// afterwards

function onResize() {
    vpWidth = getVpWidth();
    vpHeight = getVpHeight();

    listeners.forEach(function(listener) {
        const params = { vpW: vpWidth, vpH: vpHeight };

        if(!resolverMap.has(listener)) {
            listener(params);
        }
        else {
            const { hasher, prevHash } = resolverMap.get(listener);
            const hash = hasher(params);

            if(hash != prevHash) {
                listener({ ...params, hash });
                resolverMap.set(listener, { hasher, prevHash: hash });
            }
        }
    });
}

// =============== //
//    the Hook     //
// =============== //

/**
 * observes the viewport. If input not specified,
 * returns the [width, height] when the window changes.
 * If input is specified as a number, it returns the [width, height].
 *
 * If the input is specified as a function, it accepts { vpW, vpH }
 * and will only return a new value and update when the value
 * computed changes.
 *
 * @input {Function|Number} input
 */
function useViewportSizes(input) {
    const hasCustomHasher = (typeof input == 'function');
    const [state, setState] = useState(()=> !hasCustomHasher ?
        ({ vpW: vpWidth, vpH: vpHeight }) :
        (input && input({ vpW: vpWidth, vpH:vpHeight }))
    );
    const timeout = useRef(undefined);
    const listener = useCallback(
        (!input || hasCustomHasher) ?
            state => setState(state) :
            state => {
                if(timeout.current) { clearTimeout(timeout.current) }
                timeout.current = setTimeout(() => setState(state), input);
    }, [input]);

    useLayoutEffect(() => {
        if(hasCustomHasher) {
            resolverMap.set(listener, { hasher: input, prevHash: state.hash });
        }
        listeners.add(listener);

        if(window && listeners.size == 1) {
            window.addEventListener('resize', onResize);
            onResize();
        }

        // clean up listeners on unmount

        return () => {
            resolverMap.delete(listener);
            listeners.delete(listener);

            if(listeners.size == 0) {
                window.removeEventListener('resize', onResize);
            }
        };
    }, [listener]);

    const returnValue = useMemo(() => ([
        state.vpW, state.vpH, hasCustomHasher ? state.hash : onResize
    ]), [state, onResize])

    return returnValue;
}

export default useViewportSizes