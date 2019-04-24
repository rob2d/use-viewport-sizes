import { useState, useRef, useLayoutEffect, useMemo } from "react"

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

// using separate variables since Babel
// transpilation saves a bit of filesize

var listeners = new Set();
var vpW = getVpWidth();
var vpH = getVpHeight();

// should only be called by *one* component once; 
// will iterate through all subscribers
// afterwards

function onResize() {
    vpW = getVpWidth();
    vpH = getVpHeight();
    
    listeners.forEach(function(listener) {
        listener({ vpWidth : vpW, vpHeight : vpH });
    });
}

// =============== //
//    the Hook     //
// =============== //

function useViewportSizes(debounce) {
    const [{ vpWidth, vpHeight }, setState] = useState(()=> ({
        vpWidth : vpW, 
        vpHeight : vpH
    }));
    const timeout = useRef(undefined);
    const listener = useMemo(()=> (!debounce ?
        state => setState(state) : 
        state => {
            if(timeout.current) {
                clearTimeout(timeout.current);
            }
            timeout.current = setTimeout(()=> 
                setState(state), debounce
            );
        }
    ), [debounce, setState]);
    
    useLayoutEffect(()=> {
        listeners.add(listener);

        if(window && listeners.size == 1) {
            window.addEventListener('resize', onResize);        
            onResize();
        }

        // clean up listeners on unmount

        return () => {
            listeners.delete(listener);

            if(listeners.size == 0) {
                window.removeEventListener('resize', onResize);
            }
        };
    }, []);

    return [vpWidth, vpHeight, onResize];
}

export default useViewportSizes