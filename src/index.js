import { 
    useState, 
    useMemo, 
    useCallback, 
    useRef, 
    useLayoutEffect
} from 'react';

function getVpWidth() {
    return Math.max(
        globalThis?.document?.documentElement?.clientWidth || 0,
        globalThis?.innerWidth || 0
    );
}


function getVpHeight() {
    return Math.max(
        globalThis?.document?.documentElement?.clientHeight || 0,
        globalThis?.innerHeight || 0
    );
}

// Avoid useLayoutEffect warning during SSR
// https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : () => {};

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
    let hash;

    const { options, prevHash=undefined } = resolverMap?.get(listener) || {};

    if(!options.hasher) {
        switch (options?.dimension) {
            case 'w':
                hash = vpWidth;
                break;
            case 'h':
                hash = vpHeight;
                break;
            default:
                hash = (vpWidth << 16) | vpHeight;
                break;
        }
    }
    else {
        hash = options.hasher(params);
    }

    if(hash != prevHash) {
        const state = { ...params, options, hash };
        resolverMap.set(listener, {
            options, 
            prevHash: hash, 
            prevState: state
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

export default function useViewportSizes(input) {
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

    const [state, setState] = useState(() => {
        const defaultState = { vpW: vpWidth, vpH: vpHeight };
        return options.hasher ? options.hasher(defaultState) : defaultState;
    });
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

            clearTimeout(throttleTimeoutRef);

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

    useIsomorphicLayoutEffect(() => {
        resolverMap.set(listener, {
            options,
            prevHash: state.hash || undefined
        });

        listeners.add(listener);

        // if first resize listener, add resize event

        if(window && listeners.size == 1) {
            window.addEventListener('resize', onResize);
            onResize();
        } 
        
        // if additional resize listener, trigger it on the new listener

        else {
            triggerResizeListener(listener, vpWidth, vpHeight);
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
            dimensionHash = `${state.vpW}_${state.vpH}`;
            break;
        }
        case 'w': {
            dimensionHash = state.vpW || 0;
            break;
        }
        case 'h': {
            dimensionHash = state.vpH || 0;
            break;
        }
    }

    const returnValue = useMemo(() => {
        switch (dimension) {
            default: { return [state.vpW || 0, state.vpH || 0, onResize] }
            case 'w': { return [state.vpW || 0, onResize] }
            case 'h': { return [state.vpH || 0, onResize] }
        }
    }, [dimensionHash, onResize, dimension]);

    return returnValue;
}
