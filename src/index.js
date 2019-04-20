import { useState, useEffect, useMemo } from "react"

// Note: not using pure ES6/7 as babel
// transpilation eats into precious
// bytes and we're being petty here 🙂

var { documentElement } = window.document;

function getVpWidth () {
    return (typeof window != 'undefined') ? Math.max(
        documentElement.clientWidth, 
        window.innerWidth || 0
      ) : 0;
}
    

function getVpHeight () {
    return (typeof window != 'undefined') ? Math.max(
        documentElement.clientHeight,
        window.innerHeight || 0
    ) : 0;
}

// =============== //
//  Shared State   //
// =============== //

// using separate variables since Babel
// transpilation saves a bit of filesize

var listeners = new Set();
var vpW = 0;
var vpH = 0;

let hasListenerBeenAttached = false;


// should only be called by *one* component once; 
// will iterate through all subscribers
// afterwards

function onResize() {
    let vpWidth = getVpWidth();
    let vpHeight = getVpHeight();
    listeners.forEach(function(listener) {
        listener({ vpWidth, vpHeight });
    });
}



// =============== //
//    the Hook     //
// =============== //

function useViewportSizes(debounce) {
    useLayoutEffect(()=> {
        if(window && !hasListenerBeenAttached) {
            hasListenerBeenAttached = true;
            window.addEventListener('resize', onResize);        
            onResize();
        }
    }, []);

    const [{ vpWidth, vpHeight }, setState] = useState(() => ({ 
        vpWidth : vpW, vpHeight : vpH
    }));

    const listener = useMemo(()=> {
        listeners.delete(listener);

        let interval = undefined;

        return !debounce ?
            state => setState({ ...state }) : 
            state => {
                if(interval) {
                    clearTimeout(interval);
                }
                interval = setTimeout(()=> 
                    setState({ ...state }), 
                    debounce
                );
            };
    }, [debounce, setState]);

    useEffect(() => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    return [vpWidth, vpHeight, onResize];
}

export default useViewportSizes