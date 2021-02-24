declare module 'use-viewport-sizes' {
    /**
     * Hook which observes viewport dimensions.
     *
     * If input not specified, returns the [width, height] when the window changes.
     * If input is specified as a number, it returns the [width, height].
     *
     * If the input is specified as a function, it accepts a callback
     * with the viewport width and height passed in the first arg as
     * { vpW, vpH }, and will only return a new value and update when
     * the hash-value returned changes.
     */
    export default function(
        input:number | (({ vpW: number, vpH: number }) => String)
    ):[vpW: number, vpH: number];
}