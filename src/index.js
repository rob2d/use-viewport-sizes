import { useState, useMemo, useCallback, useRef, useLayoutEffect, } from 'react';

function getVpWidth() {
    return (typeof window != 'undefined') ? Math.max(
        window.document.documentElement.clientWidth,
        window.innerWidth || 0
    ) : 0;
}


function getVpHeight() {
    return (typeof window != 'undefined') ? Math.max(
        window.document.documentElement.clientHeight,
        window.innerHeight || 0
    ) : 0;
}

// =============== //
//  Shared State   //
// =============== //

/**
 * listening component functions
 *
 * @type Function
 */
const listeners = new Set();

/**
 * contains a "hasher" which manages the behavior
 * of the listeners when applicable;
 * keys in the map are the direct listener reference
 * for minimum overhead and so we can reference
 * it easily on deletion
 *
 * @type Map<Object, {{
 *      hasher: Function,
 *      prevHash: Any,
 *      options
 * }}>
 */
const resolverMap = new Map();

let vpWidth = getVpWidth();
let vpHeight = getVpHeight();

// should only be called by *one* component once;
// will iterate through all subscribers
// afterwards

function onResize() {
    vpWidth = getVpWidth();
    vpHeight = getVpHeight();

    listeners.forEach(listener => {
        const params = { vpW: vpWidth, vpH: vpHeight };

        let shouldRun = false;
        let hash;

        const { options, prevHash=undefined } = resolverMap?.get(listener) || {};
        const { hasher } = options;

        if(!options?.hasher) {
            shouldRun = true;
        }
        else {
            hash = hasher(params);
            if(hash != prevHash) { shouldRun = true }
        }

        if(shouldRun) {
            resolverMap.set(listener, { options, prevHash: hash });
            listener({ ...params, options, hash });
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
    const hasher = ((typeof input == 'function') ?
        input :
        input?.hasher
    ) || undefined;

    const debounceTimeout = input?.debounceTimeout || undefined;

    const throttleTimeout = ((typeof input == 'number') ?
        input :
        input?.throttleTimeout
    ) || undefined;

    const dimension = input?.dimension || 'both';

    const options = {
        ...(typeof input == 'function' ? {} : input),
        dimension,
        hasher
    };

    const [state, setState] = useState(() => (!hasher ?
        { vpW: vpWidth, vpH: vpHeight } :
        hasher && hasher({ vpW: vpWidth, vpH: vpHeight })
    ));
    const debounceTimeoutRef = useRef(undefined);
    const listener = useCallback((!hasher ?
        state => setState(state) :
        state => {
            if(debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                setState(state);
            }, debounceTimeoutRef);
        }
    ), [debounceTimeoutRef, hasher, dimension]);

    useLayoutEffect(() => {
        resolverMap.set(listener, {
            options,
            prevHash: state.hash || undefined
        });

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
                window?.removeEventListener?.('resize', onResize);
            }
        };
    }, [listener]);

    let dimensionHash;

    switch (dimension) {
        default:
        case 'both': {
            dimensionHash = `${state?.vpW}_${state.vpH}`;
            break;
        }
        case 'w': {
            dimensionHash = state?.vpW || 0;
            break;
        }
        case 'h': {
            dimensionHash = state?.vpH || 0;
            break;
        }
    }

    const returnValue = useMemo(() => {
        switch (dimension) {
            default:
            case 'both': { return [state?.vpW || 0, state?.vpH || 0] }
            case 'w': { return state?.vpW || 0 }
            case 'h': { return state?.vpH || 0 }
        }
    }, [dimensionHash, onResize, dimension]);

    return returnValue;
}

export default useViewportSizes;
