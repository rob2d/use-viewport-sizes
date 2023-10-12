import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act, fireEvent }  from '@testing-library/react';
import useViewportSizes from './index';

function DimensionView({ options }) {
    const [dimension] = useViewportSizes(options);
    return (
        <div>
            <div data-testid='dimension'>{dimension}</div>
        </div>
    );
}

function DimensionsView({ options }) {
    const [vpW, vpH] = useViewportSizes(options);
    return (
        <div>
            <div data-testid='vpw'>{vpW}</div>
            <div data-testid='vph'>{vpH}</div>
        </div>
    );
}

function setViewportDimensions(width, height) {
    act(() => {
        window.innerWidth = width;
        window.innerHeight = height;
    });

    fireEvent(window, new Event('resize'));
}

describe('useViewportSizes', () => {
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('calling with no options', () => {
        test('renders viewport width/height when run with no arguments', async () => {
            setViewportDimensions(640, 480);
            render(<DimensionsView />);
            expect(screen.getByTestId('vpw').textContent).toEqual('640');
            expect(screen.getByTestId('vph').textContent).toEqual('480');
        });
    
        test('updates viewport width/height read when the window is resized', async () => {
            setViewportDimensions(640, 480);
            render(<DimensionsView />);
            expect(screen.getByTestId('vpw').textContent).toEqual('640');
            expect(screen.getByTestId('vph').textContent).toEqual('480');
    
            setViewportDimensions(50, 100);
            expect(screen.getByTestId('vpw').textContent).toEqual('50');
            expect(screen.getByTestId('vph').textContent).toEqual('100');
        });
    });

    describe('calling with one dimension option passed', () => {
        test('renders width of viewport when passed dimension: `w`, and updates this', async () => {
            setViewportDimensions(640, 480);
            render(<DimensionView options={{ dimension: 'w' }} />);
            expect(screen.getByTestId('dimension').textContent).toEqual('640');

            setViewportDimensions(44, 80);
            expect(screen.getByTestId('dimension').textContent).toEqual('44');
        });

        test('renders width of viewport when passed dimension: `h`, and updates this', async () => {
            setViewportDimensions(640, 480);
            render(<DimensionView options={{ dimension: 'h' }} />);
            expect(screen.getByTestId('dimension').textContent).toEqual('480');

            setViewportDimensions(44, 80);
            expect(screen.getByTestId('dimension').textContent).toEqual('80');
        });
    });

    describe('other scenarios', () => {
        test('works with a custom hasher to only update when a breakpoint changes', async () => {
            jest.useFakeTimers();
            setViewportDimensions(640, 480);
            const options = { 
                hasher: ({ vpW }) => {
                    if(vpW <= 240) { return 'xs' }
                    if(vpW <= 320) { return 'sm' }
                    else if(vpW <= 640) { return 'md' }
                    else return 'lg';
                } 
            };

            render(<DimensionsView options={options} />);
            expect(screen.getByTestId('vpw').textContent).toEqual('640');

            setViewportDimensions(639, 480);
            jest.runAllTimers();
            expect(screen.getByTestId('vpw').textContent).toEqual('640');

            setViewportDimensions(645, 480);
            jest.runAllTimers();

            expect(screen.getByTestId('vpw').textContent).toEqual('645');
            
            setViewportDimensions(240, 480);
            jest.runAllTimers();
            expect(screen.getByTestId('vpw').textContent).toEqual('240');

            setViewportDimensions(238, 480);
            jest.runAllTimers();
            expect(screen.getByTestId('vpw').textContent).toEqual('240');

            setViewportDimensions(300, 480);
            jest.runAllTimers();
            expect(screen.getByTestId('vpw').textContent).toEqual('300');

            
            setViewportDimensions(500, 200);
            jest.runAllTimers();
            expect(screen.getByTestId('vpw').textContent).toEqual('500');
        });

        test('debounces updated render of vpw/vph with debounceTimeout', async () => {
            jest.useFakeTimers();
            setViewportDimensions(640, 480);
            await jest.runAllTimersAsync();
            render(<DimensionsView options={{ debounceTimeout: 500 }} />);
            await act(async () => {
                await jest.runAllTimersAsync();
            });
            expect(screen.getByTestId('vpw').textContent).toEqual('640');
            expect(screen.getByTestId('vph').textContent).toEqual('480');

            await act(async () => {
                await jest.advanceTimersByTimeAsync(100);
            });
            expect(screen.getByTestId('vpw').textContent).toEqual('640');
            expect(screen.getByTestId('vph').textContent).toEqual('480');

            await act(async () => {
                await jest.advanceTimersByTimeAsync(450);
                setViewportDimensions(100, 100);
                await jest.runAllTimersAsync();
            });
            expect(screen.getByTestId('vpw').textContent).toEqual('100');
            expect(screen.getByTestId('vph').textContent).toEqual('100');
        });

        test('throttles updated render of vpw/vph with throttleTimeout', async () => {
            jest.useFakeTimers();
            
            setViewportDimensions(640, 480);
            render(<DimensionsView options={{ throttleTimeout: 100 }} />);

            await act(async () => {
                await jest.runAllTimersAsync();
                setViewportDimensions(200, 200);
                await jest.advanceTimersByTimeAsync(50);
            });
            
            expect(screen.getByTestId('vpw').textContent).toEqual('640');
            expect(screen.getByTestId('vph').textContent).toEqual('480');

            await act(async () => {
                await jest.advanceTimersByTimeAsync(150);
            });
            
            expect(screen.getByTestId('vpw').textContent).toEqual('200');
            expect(screen.getByTestId('vph').textContent).toEqual('200');

            await act(async () => {
                await jest.advanceTimersByTimeAsync(450);
                setViewportDimensions(100, 100);
                await jest.runAllTimersAsync();
            });
           
            expect(screen.getByTestId('vpw').textContent).toEqual('100');
            expect(screen.getByTestId('vph').textContent).toEqual('100');
        });
    });
});
