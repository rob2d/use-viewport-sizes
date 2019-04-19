import { useState, useEffect, useMemo } from "react"

// Note: not using pure ES6/7 as babel
// transpilation eats into precious
// bytes and we're being petty here 🙂

var { documentElement } = window.document;

let something;

function getVpWidth () {
    return Math.max(
        documentElement.clientWidth, 
        window.innerWidth || 0
      );
}
    

function getVpHeight () {
    return Math.max(
        documentElement.clientHeight,
        window.innerHeight || 0
    );
}

// =============== //
//  Shared State   //
// =============== //

var listeners = new Set();
var vpW = getVpWidth();
var vpH = getVpHeight();

function onResize(vpWidth, vpHeight) {
    listeners.forEach(function(listener) {
        listener({ vpWidth, vpHeight });
    });
}

window.addEventListener('resize',function(){
    vpW = getVpWidth();
    vpH = getVpHeight();
    onResize(vpW, vpH);
});

// =============== //
//    the Hook     //
// =============== //

function useViewportSizes(debounce) {
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

    return [vpWidth, vpHeight];
}

export default useViewportSizes