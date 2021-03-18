import { useState, useMemo, useCallback, useRef, useLayoutEffect } from 'react';

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

/**
 * called to update resize dimensions with the handlers
 * passed themselves; separated from the actual
 * pub-sub caller (onResize) so we can individually
 * dispatch subscription events and avoid updating all
 * components at once
 *
 * @param {*} listener
 * @param {*} vpWidth
 * @param {*} vpHeight
 */
function triggerResizeListener(listener, vpWidth, vpHeight) {
    const params = { vpW: vpWidth, vpH: vpHeight };

    let shouldRun = false;
    let hash;

    const { options, prevHash=undefined } = resolverMap?.get(listener) || {};
    const { hasher } = options;

    if(!options?.hasher) {
        const dimensionsUpdated = new Set();

        switch (options?.dimension) {
            case 'w':
                hash = `${vpWidth}`;
                break;
            case 'h':
                hash = `${vpHeight}`;
                break;
            default:
            case 'both':
                hash = `${vpWidth}_${vpHeight}`;
                break;
        }
    }
    else {
        hash = hasher(params);
    }

    if(hash != prevHash) { shouldRun = true }

    if(shouldRun) {
        const state = { ...params, options, hash };
        resolverMap.set(listener, {
            options, prevHash: hash, prevState: state
        });
        listener(state);
    }
}

/**
 * called to update resize dimensions;
 * only called once throughout hooks so if
 * using SSR, may be expensive to trigger in all
 * components with effect on paint as described in
 * readme
 */
function onResize() {
    vpWidth = getVpWidth();
    vpHeight = getVpHeight();

    listeners.forEach(listener =>
        triggerResizeListener(listener, vpWidth, vpHeight)
    );
}

// =============== //
//    the Hook     //
// =============== //

function getInitialState(options, vpW, vpH) {
    let returnValue = {};
    if(options.hasher) {
        returnValue = options.hasher({ vpW, vpH });
    } else {
        returnValue = { vpW, vpH };
    }

    return (!options.hasher ?
        { vpW, vpH } :
        hasher && hasher({ vpW: vpWidth, vpH: vpHeight })
    )
}

function useViewportSizes(input) {
    const hasher = ((typeof input == 'function') ?
        input :
        input?.hasher
    ) || undefined;

    const debounceTimeout = ((typeof input?.debounceTimeout == 'number') ?
        input?.debounceTimeout : 0
    );

    const throttleTimeout = ((typeof input == 'number')  ?
        input :
        input?.throttleTimeout
    ) || 0;

    const dimension = input?.dimension || 'both';

    const options = {
        ...(typeof input == 'object' ? input : {}),
        dimension,
        hasher
    };

    const [state, setState] = useState(() => getInitialState(options));
    const debounceTimeoutRef = useRef(undefined);
    const throttleTimeoutRef = useRef(undefined);
    const lastThrottledRef = useRef(undefined);

    const listener = useCallback(nextState => {
        if(!debounceTimeout && !throttleTimeout) {
            setState(nextState);
            return;
        }

        if(debounceTimeout) {
            if(debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => (
                setState(nextState)
            ), debounceTimeout);
        }

        if(throttleTimeout) {
            const lastTick = lastThrottledRef.current;
            const timeSinceLast = (!lastTick ? throttleTimeout : Date.now() - lastTick);
            console.log('should process in ->', throttleTimeout - timeSinceLast);

            throttleTimeoutRef.current = setTimeout(() => {
                lastThrottledRef.current = new Date().getTime();
                const vpWidth = getVpWidth();
                const vpHeight = getVpHeight();

                const dimensionsUpdated = new Set();

                if(vpHeight != state.vpH) {
                    dimensionsUpdated.add('h');
                }

                if(vpWidth != state.vpW) {
                    dimensionsUpdated.add('w');
                }

                if(dimensionsUpdated.has('w') || dimensionsUpdated.has('h')) {
                    dimensionsUpdated.add('both');
                }

                if(dimensionsUpdated.has(dimension)) {
                    setState({ vpW: vpWidth, vpH: vpHeight });
                }
            }, Math.max(0, throttleTimeout - timeSinceLast));
        }
    }, [debounceTimeoutRef, hasher, dimension, state]);

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
            case 'both': { return [state?.vpW || 0, state?.vpH || 0, onResize] }
            case 'w': { return [state?.vpW || 0, onResize] }
            case 'h': { return [state?.vpH || 0, onResize] }
        }
    }, [dimensionHash, onResize, dimension]);

    return returnValue;
}

export default useViewportSizes;
