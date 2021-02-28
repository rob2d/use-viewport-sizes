declare module 'use-viewport-sizes' {
    export type VPSizesHasher = (({ vpW: number, vpH: number }) => String);
    export type VPSizesOptions ={
        debounceTimeout?: number,
        throttleTimeout?: number,
        hasher?: VPSizesHasher,
        dimension?: 'w'|'h'|'both' = 'both'
    };

    /**
     * Hook which observes viewport dimensions. Returns [width, height] of
     * current visible viewport of app, or the specific dimension
     */
    export default function(
        input:number | VPSizesHasher | VPSizesOptions
    ):[vpW: number, vpH: number] | number;
}