import { useState, useEffect, useMemo } from "react"

const getVpWidth = () =>
    Math.max(
      window.document.documentElement.clientWidth, 
      window.innerWidth || 0
    );

const getVpHeight = () =>
    Math.max(
        window.document.documentElement.clientHeight,
        window.innerHeight || 0
    );

const store = {
  listeners: new Set(),
  state: { vpWidth: getVpWidth(), vpHeight: getVpHeight() },
  onResize(vpWidth, vpHeight) {
    this.state = { vpWidth, vpHeight };
    
    for(let listener of this.listeners) {
        listener({ vpWidth, vpHeight });
    }
  }
};

window.addEventListener("resize", () => {
  store.onResize(getVpWidth(), getVpHeight());
});

function useViewportSizes(debounce) {
    const [{ vpWidth, vpHeight }, setState] = useState(() => ({ 
        ...store.state
    }));

    const listener = useMemo(()=> {
        store.listeners.delete(listener);

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
        const { listeners } = store;
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    return [vpWidth, vpHeight];
}

export default useViewportSizes