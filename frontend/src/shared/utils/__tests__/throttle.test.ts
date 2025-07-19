import { throttle } from '../throttle';

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call function immediately on first call', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn('test');

    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should throttle subsequent calls within wait time', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    // First call - should execute immediately
    throttledFn('first');
    expect(mockFn).toHaveBeenCalledWith('first');
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Second call within 100ms - should be throttled
    throttledFn('second');
    expect(mockFn).toHaveBeenCalledTimes(1); // Still only called once

    // Advance time by 50ms
    jest.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1); // Still throttled

    // Advance time to trigger the throttled call
    jest.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledWith('second');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should call function immediately after wait time has passed', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    // First call
    throttledFn('first');
    expect(mockFn).toHaveBeenCalledWith('first');
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Advance time beyond wait period
    jest.advanceTimersByTime(150);

    // Second call - should execute immediately
    throttledFn('second');
    expect(mockFn).toHaveBeenCalledWith('second');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should use the latest arguments when throttled', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    // First call
    throttledFn('first');
    expect(mockFn).toHaveBeenCalledWith('first');

    // Multiple calls within throttle period
    throttledFn('second');
    throttledFn('third');
    throttledFn('fourth');

    // Should still only be called once
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Advance time to trigger throttled call
    jest.advanceTimersByTime(100);

    // Should be called with the latest arguments
    expect(mockFn).toHaveBeenCalledWith('fourth');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should preserve function context', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);
    const context = { value: 'test' };

    throttledFn.call(context, 'arg');

    expect(mockFn).toHaveBeenCalledWith('arg');
    expect(mockFn.mock.instances[0]).toBe(context);
  });

  it('should handle multiple arguments', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn('arg1', 'arg2', { nested: 'value' });

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { nested: 'value' });
  });

  it('should work with zero wait time', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 0);

    throttledFn('test1');
    throttledFn('test2');
    throttledFn('test3');

    // With zero wait time, all calls should execute immediately
    expect(mockFn).toHaveBeenCalledWith('test1');
    expect(mockFn).toHaveBeenCalledWith('test2');
    expect(mockFn).toHaveBeenCalledWith('test3');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should handle rapid successive calls correctly', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    // Rapid successive calls
    for (let i = 0; i < 10; i++) {
      throttledFn(`call${i}`);
    }

    // Only first call should execute immediately
    expect(mockFn).toHaveBeenCalledWith('call0');
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Advance time to trigger the last throttled call
    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('call9');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
}); 
