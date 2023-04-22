declare module 'use-viewport-sizes' {
    export type VPSizesHasher = ({ vpW, vpH }: {  vpW: number, vpH: number}) => String;
    export type VPSizesOptions ={
        debounceTimeout?: number,
        hasher?: VPSizesHasher,
        dimension: 'both' | undefined
    };

    export type VPSizeOptions ={
        debounceTimeout?: number,
        hasher?: VPSizesHasher,
        dimension?: 'w'|'h'
    };

    /**
     * Hook which observes viewport dimensions. Returns [width, height] of
     * current visible viewport of app, or the specific dimension
     */
    export default function(input:number|VPSizesOptions):([vpW: number, vpH: number, triggerResize: Function]);

    /**
     * Hook which observes viewport dimensions. Returns [width, height] of
     * current visible viewport of app, or the specific dimension
     */
    export default function(input: VPSizeOptions):([dimension: number, triggerResize:Function]);

    /**
     * Hook which observes viewport dimensions. Returns [width, height] of
     * current visible viewport of app, or the specific dimension
     */
    export default function(input:VPSizesHasher):([vpW: number, vpH: number, triggerResize: Function]);

    /**
     * Hook which observes viewport dimensions. Returns [width, height] of
     * current visible viewport of app, or the specific dimension
     */
    export default function():([vpW: number, vpH: number, triggerResize: Function]);
}
