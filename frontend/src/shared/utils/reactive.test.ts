import { makeReactive, createDeepReactiveMap } from './reactive';

describe('makeReactive', () => {
  it('should create a reactive object that triggers onChange when properties are set', () => {
    const onChange = jest.fn();
    const obj = { name: 'John', age: 30 };
    const reactiveObj = makeReactive(obj, onChange);

    reactiveObj.name = 'Jane';

    expect(onChange).toHaveBeenCalledWith('nested-update', {
      target: obj,
      prop: 'name',
      value: 'Jane',
      oldValue: 'John',
    });
  });

  it('should not trigger onChange when setting the same value', () => {
    const onChange = jest.fn();
    const obj = { name: 'John' };
    const reactiveObj = makeReactive(obj, onChange);

    reactiveObj.name = 'John';

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should work without onChange callback', () => {
    const obj = { name: 'John' };
    const reactiveObj = makeReactive(obj);

    expect(() => {
      reactiveObj.name = 'Jane';
    }).not.toThrow();
  });

  it('should preserve object properties', () => {
    const obj = { name: 'John', age: 30 };
    const reactiveObj = makeReactive(obj);

    expect(reactiveObj.name).toBe('John');
    expect(reactiveObj.age).toBe(30);
  });

  it('should handle nested object properties', () => {
    const onChange = jest.fn();
    const obj = { user: { name: 'John' } };
    const reactiveObj = makeReactive(obj, onChange);

    // Only direct property changes trigger onChange
    reactiveObj.user = { name: 'Jane' };

    expect(onChange).toHaveBeenCalledWith('nested-update', {
      target: obj,
      prop: 'user',
      value: { name: 'Jane' },
      oldValue: { name: 'John' },
    });
  });

  it('should handle array properties', () => {
    const onChange = jest.fn();
    const obj = { items: [1, 2, 3] };
    const reactiveObj = makeReactive(obj, onChange);

    // Only direct property changes trigger onChange
    reactiveObj.items = [1, 2, 3, 4];

    expect(onChange).toHaveBeenCalledWith('nested-update', {
      target: obj,
      prop: 'items',
      value: [1, 2, 3, 4],
      oldValue: [1, 2, 3],
    });
  });
});

describe('createDeepReactiveMap', () => {
  it('should create a reactive map that triggers onChange when setting values', () => {
    const onChange = jest.fn();
    const map = new Map();
    const reactiveMap = createDeepReactiveMap(map, onChange);

    const value = { name: 'John' };
    reactiveMap.set('key1', value);

    expect(onChange).toHaveBeenCalledWith('set', {
      key: 'key1',
      value: expect.any(Object),
      oldValue: undefined,
    });
  });

  it('should create a reactive map from existing map', () => {
    const onChange = jest.fn();
    const originalMap = new Map([['key1', { name: 'John' }]]);
    const reactiveMap = createDeepReactiveMap(originalMap, onChange);

    expect(reactiveMap.size).toBe(1);
    expect(reactiveMap.get('key1')).toEqual({ name: 'John' });
  });

  it('should trigger onChange when deleting values', () => {
    const onChange = jest.fn();
    const map = new Map([['key1', { name: 'John' }]]);
    const reactiveMap = createDeepReactiveMap(map, onChange);

    reactiveMap.delete('key1');

    expect(onChange).toHaveBeenCalledWith('delete', {
      key: 'key1',
      oldValue: expect.any(Object),
    });
  });

  it('should trigger onChange when clearing the map', () => {
    const onChange = jest.fn();
    const map = new Map([['key1', { name: 'John' }], ['key2', { name: 'Jane' }]]);
    const reactiveMap = createDeepReactiveMap(map, onChange);

    reactiveMap.clear();

    expect(onChange).toHaveBeenCalledWith('clear', {
      entries: expect.arrayContaining([
        ['key1', expect.any(Object)],
        ['key2', expect.any(Object)],
      ]),
    });
  });

  it('should not trigger onChange when deleting non-existent key', () => {
    const onChange = jest.fn();
    const map = new Map();
    const reactiveMap = createDeepReactiveMap(map, onChange);

    reactiveMap.delete('non-existent');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not trigger onChange when clearing empty map', () => {
    const onChange = jest.fn();
    const map = new Map();
    const reactiveMap = createDeepReactiveMap(map, onChange);

    reactiveMap.clear();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should work without onChange callback', () => {
    const map = new Map();
    const reactiveMap = createDeepReactiveMap(map);

    expect(() => {
      reactiveMap.set('key1', { name: 'John' });
      reactiveMap.delete('key1');
      reactiveMap.clear();
    }).not.toThrow();
  });

  it('should throw error when passing non-Map object', () => {
    expect(() => {
      createDeepReactiveMap({} as any);
    }).toThrow('Parameter must be an instance of Map');
  });

  it('should make nested objects reactive', () => {
    const onChange = jest.fn();
    const map = new Map();
    const reactiveMap = createDeepReactiveMap(map, onChange);

    const nestedObj = { user: { name: 'John' } };
    reactiveMap.set('key1', nestedObj);

    // The set operation should trigger onChange
    expect(onChange).toHaveBeenCalledWith('set', {
      key: 'key1',
      value: expect.any(Object),
      oldValue: undefined,
    });

    // Clear previous calls
    onChange.mockClear();

    // Modify the top-level object property - this should trigger nested-update
    const retrievedObj = reactiveMap.get('key1');
    retrievedObj.user = { name: 'Jane' };

    expect(onChange).toHaveBeenCalledWith('nested-update', {
      target: expect.any(Object),
      prop: 'user',
      value: { name: 'Jane' },
      oldValue: { name: 'John' },
    });
  });

  it('should handle primitive values', () => {
    const onChange = jest.fn();
    const map = new Map();
    const reactiveMap = createDeepReactiveMap(map, onChange);

    reactiveMap.set('key1', 'string value');
    reactiveMap.set('key2', 42);
    reactiveMap.set('key3', true);

    expect(reactiveMap.get('key1')).toBe('string value');
    expect(reactiveMap.get('key2')).toBe(42);
    expect(reactiveMap.get('key3')).toBe(true);
  });

  it('should preserve map methods', () => {
    const map = new Map();
    const reactiveMap = createDeepReactiveMap(map);

    reactiveMap.set('key1', { name: 'John' });
    reactiveMap.set('key2', { name: 'Jane' });

    expect(reactiveMap.has('key1')).toBe(true);
    expect(reactiveMap.has('key3')).toBe(false);
    expect(reactiveMap.size).toBe(2);
    expect(Array.from(reactiveMap.keys())).toEqual(['key1', 'key2']);
    expect(Array.from(reactiveMap.values())).toHaveLength(2);
  });

  it('should handle updating existing values', () => {
    const onChange = jest.fn();
    const map = new Map([['key1', { name: 'John' }]]);
    const reactiveMap = createDeepReactiveMap(map, onChange);

    const newValue = { name: 'Jane' };
    reactiveMap.set('key1', newValue);

    expect(onChange).toHaveBeenCalledWith('set', {
      key: 'key1',
      value: expect.any(Object),
      oldValue: expect.any(Object),
    });
  });
}); 
