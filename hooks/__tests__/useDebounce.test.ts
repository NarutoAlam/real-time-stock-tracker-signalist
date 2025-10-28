import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return a debounced function', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    expect(typeof result.current).toBe('function');
  });

  it('should debounce the callback function', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous timeout when called multiple times', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should respect the delay parameter', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 500));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle zero delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 0));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should create stable debounced function on re-renders with same callback and delay', () => {
    const callback = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb, delay }) => useDebounce(cb, delay),
      { initialProps: { cb: callback, delay: 300 } }
    );

    const firstDebounced = result.current;

    rerender({ cb: callback, delay: 300 });

    expect(result.current).toBe(firstDebounced);
  });

  it('should create new debounced function when callback changes', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb, delay }) => useDebounce(cb, delay),
      { initialProps: { cb: callback1, delay: 300 } }
    );

    const firstDebounced = result.current;

    rerender({ cb: callback2, delay: 300 });

    expect(result.current).not.toBe(firstDebounced);
  });

  it('should create new debounced function when delay changes', () => {
    const callback = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb, delay }) => useDebounce(cb, delay),
      { initialProps: { cb: callback, delay: 300 } }
    );

    const firstDebounced = result.current;

    rerender({ cb: callback, delay: 500 });

    expect(result.current).not.toBe(firstDebounced);
  });

  it('should not call callback if component unmounts before delay', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebounce(callback, 300));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle rapid successive calls correctly', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current();
        jest.advanceTimersByTime(50);
      }
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should allow multiple separate debounced sequences', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 300));

    // First sequence
    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Second sequence
    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should handle negative delay gracefully', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, -100));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});