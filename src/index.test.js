import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act, fireEvent }  from '@testing-library/react';
import useViewportSizes from './index';

function BasicUseCase() {
    const [vpW, vpH] = useViewportSizes();
    return (
        <div>
            <div data-testid='vpw'>{vpW}</div>
            <div data-testid='vph'>{vpH}</div>
        </div>
    );
}

function WithDimensionArgument({ options }) {
    const [dimension] = useViewportSizes(options);
    return (
        <div>
            <div data-testid='dimension'>{dimension}</div>
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
    describe('calling with no options', () => {
        test('renders viewport width/height when run with no arguments', async () => {
            setViewportDimensions(640, 480);
            render(<BasicUseCase />);
            expect(screen.getByTestId('vpw').textContent).toEqual('640');
            expect(screen.getByTestId('vph').textContent).toEqual('480');
        });
    
        test('updates viewport width/height read when the window is resized', async () => {
            setViewportDimensions(640, 480);
            render(<BasicUseCase />);
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
            render(<WithDimensionArgument options={{ dimension: 'w' }} />);
            expect(screen.getByTestId('dimension').textContent).toEqual('640');

            setViewportDimensions(44, 80);
            expect(screen.getByTestId('dimension').textContent).toEqual('44');
        });

        test('renders width of viewport when passed dimension: `h`, and updates this', async () => {
            setViewportDimensions(640, 480);
            render(<WithDimensionArgument options={{ dimension: 'h' }} />);
            expect(screen.getByTestId('dimension').textContent).toEqual('480');

            setViewportDimensions(44, 80);
            expect(screen.getByTestId('dimension').textContent).toEqual('80');
        });
    });
});
